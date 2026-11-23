import fs from 'fs';
import path from 'path';

/**
 * French explanation service.
 *
 * Providers are tried in order until one returns valid JSON:
 *   1. OpenRouter free models (OPENROUTER_API_KEY, models from OPENROUTER_MODELS)
 *   2. Gemini (GEMINI_API_KEY), only if a key is set
 *
 * Answers are cached on disk, so a repeated question never spends free-tier quota.
 * Without purchased credits, OpenRouter allows ~50 free requests/day and ~20/minute.
 */

export interface Explanation {
  translation: string;
  pronunciation: string;
  ipa: string;
  partOfSpeech: string;
  grammar: string;
  vocabulary: Array<{ word: string; meaning: string; partOfSpeech: string }>;
  example: string;
  exampleMeaning: string;
}

export class ExplainError extends Error {
  constructor(message: string, public status: number, public retryable: boolean) {
    super(message);
  }
}

// Free models change often; override with OPENROUTER_MODELS (comma-separated) without a code change.
// Order (2026-11-23):
//   1. Nemotron 3.5 Lightning: fast (~0.5 s to first token, ~115 tok/s), plenty for word/sentence notes.
//   2. Nemotron 3 Ultra: much stronger reasoning, slower (~1.3 s, ~47 tok/s); used when Lightning fails.
//   3. Nemotron 3.5 Super VL, then `openrouter/free` (any available free model) as last resorts.
// Note: NVIDIA's free endpoints log prompts to improve their products, so never send personal data.
const DEFAULT_OPENROUTER_MODELS = [
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'openrouter/free',
];

const REQUEST_TIMEOUT_MS = 20000;
// If a model has not answered after this long, a backup model starts in parallel and the
// first valid answer wins (the slower request is cancelled). Free models are often queued,
// so this cuts the worst-case wait a lot. Override with EXPLAIN_HEDGE_MS.
const HEDGE_DELAY_MS = Number(process.env.EXPLAIN_HEDGE_MS) || 6000;

const CACHE_FILE = process.env.EXPLAIN_CACHE_FILE || path.join(process.cwd(), '.cache', 'explanations.json');
const MAX_CACHE_ENTRIES = 5000;
let cache: Map<string, Explanation> | null = null;
let saveTimer: NodeJS.Timeout | null = null;

function loadCache(): Map<string, Explanation> {
  if (cache) return cache;
  cache = new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, Explanation>;
    for (const [key, value] of Object.entries(raw)) cache.set(key, value);
  } catch {
    // no cache yet
  }
  return cache;
}

function saveCacheSoon(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(loadCache())));
    } catch (err: any) {
      console.warn('Could not save explanation cache:', err?.message || err);
    }
  }, 1000);
}

export const cacheKeyFor = (text: string): string =>
  text.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

export function explanationCacheSize(): number {
  return loadCache().size;
}

function buildPrompt(text: string): string {
  return `You are a friendly French tutor for an English-speaking learner. Analyze this French text: "${text.replace(/"/g, '\\"')}".
Reply with ONLY one JSON object, no markdown, in exactly this shape:
{
  "translation": "natural English meaning",
  "pronunciation": "simple readable pronunciation guide for English speakers",
  "ipa": "IPA for the text if useful, otherwise empty string",
  "partOfSpeech": "part of speech for a single word, or sentence type for a sentence",
  "grammar": "concise, useful grammar note (tense, agreement, verb pattern, common mistake)",
  "vocabulary": [{"word":"French word","meaning":"English meaning","partOfSpeech":"noun/verb/etc"}],
  "example": "one short natural French example sentence",
  "exampleMeaning": "English meaning of the example"
}
Keep every field short (one or two sentences). For sentences, give 3-5 vocabulary entries for the core words. For a single word, focus on meaning, pronunciation, gender if it is a noun, and usage.`;
}

// Free models do not all support JSON mode, so pull the first {...} block out of the reply.
function parseExplanation(raw: string | undefined): Explanation | null {
  if (!raw) return null;
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof data?.translation !== 'string' || !data.translation.trim()) return null;
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      translation: data.translation,
      pronunciation: str(data.pronunciation),
      ipa: str(data.ipa),
      partOfSpeech: str(data.partOfSpeech),
      grammar: str(data.grammar),
      vocabulary: Array.isArray(data.vocabulary)
        ? data.vocabulary
            .filter((v: any) => v && typeof v.word === 'string')
            .slice(0, 8)
            .map((v: any) => ({ word: v.word, meaning: str(v.meaning), partOfSpeech: str(v.partOfSpeech) }))
        : [],
      example: str(data.example),
      exampleMeaning: str(data.exampleMeaning),
    };
  } catch {
    return null;
  }
}

interface Attempt {
  provider: string;
  error: string;
  rateLimited: boolean;
  /** The account-wide free limit was hit, so other free models will fail too. */
  accountLimit?: boolean;
}

async function tryOpenRouter(text: string, apiKey: string, model: string, signal: AbortSignal): Promise<Explanation | Attempt> {
  const provider = `openrouter:${model}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'French Verb Dashboard',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildPrompt(text) }],
        temperature: 0.2,
        // Reasoning models (Ultra) spend tokens thinking before answering: keep it short and
        // leave room for the JSON. Models without reasoning ignore this field.
        reasoning: { effort: 'low', exclude: true },
        max_tokens: 2000,
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
    });
    if (!response.ok) {
      const body = await response.text();
      return {
        provider,
        error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
        rateLimited: response.status === 429,
        accountLimit: /openrouter_free_tier_(daily|per_minute)/.test(body),
      };
    }
    const payload = (await response.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    // Guard against a free id being silently served by a paid model.
    if (payload.model && model.endsWith(':free') && !String(payload.model).startsWith(model.replace(/:free$/, ''))) {
      console.warn(`OpenRouter served ${payload.model} for ${model}`);
    }
    const parsed = parseExplanation(payload.choices?.[0]?.message?.content);
    return parsed ?? { provider, error: 'reply was not valid JSON', rateLimited: false };
  } catch (err: any) {
    return { provider, error: err?.name === 'TimeoutError' ? 'timed out' : err?.name === 'AbortError' ? 'cancelled (another model answered)' : String(err?.message || err), rateLimited: false };
  }
}

async function tryGemini(text: string, apiKey: string, signal: AbortSignal): Promise<Explanation | Attempt> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const provider = `gemini:${model}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text) }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
    });
    if (!response.ok) {
      const body = await response.text();
      return { provider, error: `HTTP ${response.status}: ${body.slice(0, 200)}`, rateLimited: response.status === 429 };
    }
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const parsed = parseExplanation(payload.candidates?.[0]?.content?.parts?.[0]?.text);
    return parsed ?? { provider, error: 'reply was not valid JSON', rateLimited: false };
  } catch (err: any) {
    return { provider, error: err?.name === 'TimeoutError' ? 'timed out' : err?.name === 'AbortError' ? 'cancelled (another model answered)' : String(err?.message || err), rateLimited: false };
  }
}

export interface ExplainResult {
  explanation: Explanation;
  cached: boolean;
  /** Which provider/model answered ("cache" for a cached answer). */
  source: string;
  /** Server-side time spent getting the answer. */
  ms: number;
}

interface Answer {
  explanation: Explanation;
  source: string;
}

const inFlight = new Map<string, Promise<Answer>>();

export async function explainFrench(text: string): Promise<ExplainResult> {
  const started = Date.now();
  const key = cacheKeyFor(text);
  const hit = loadCache().get(key);
  if (hit) return { explanation: hit, cached: true, source: 'cache', ms: Date.now() - started };

  // Two identical requests at once share one AI call.
  let pending = inFlight.get(key);
  if (!pending) {
    pending = runProviders(text).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  const answer = await pending;
  return { ...answer, cached: false, ms: Date.now() - started };
}

type Candidate = { source: string; run: (signal: AbortSignal) => Promise<Explanation | Attempt> };

/**
 * Staggered race: start the first model; if it has not answered within HEDGE_DELAY_MS,
 * start the next one too (or immediately, if the first one already failed). The first
 * valid answer wins and the other requests are cancelled.
 */
function raceCandidates(candidates: Candidate[], attempts: Attempt[]): Promise<Answer | null> {
  return new Promise((resolve) => {
    const controller = new AbortController();
    let next = 0;
    let running = 0;
    let done = false;
    let hedgeTimer: NodeJS.Timeout | null = null;
    let stopLaunching = false;

    const finish = (answer: Answer | null) => {
      if (done) return;
      done = true;
      if (hedgeTimer) clearTimeout(hedgeTimer);
      controller.abort();
      resolve(answer);
    };

    const launch = () => {
      if (done || stopLaunching || next >= candidates.length) {
        if (running === 0) finish(null);
        return;
      }
      const candidate = candidates[next++];
      running++;
      const startedAt = Date.now();
      if (hedgeTimer) clearTimeout(hedgeTimer);
      hedgeTimer = setTimeout(launch, HEDGE_DELAY_MS);
      candidate.run(controller.signal).then((result) => {
        running--;
        if (done) return;
        if ('translation' in result) {
          console.log(`Explanation from ${candidate.source} in ${Date.now() - startedAt} ms`);
          finish({ explanation: result, source: candidate.source });
          return;
        }
        attempts.push(result);
        if (result.accountLimit) stopLaunching = true;
        launch(); // a failure starts the next model right away
      });
    };

    launch();
  });
}

async function runProviders(text: string): Promise<Answer> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!openRouterKey && !geminiKey) {
    throw new ExplainError(
      'No AI key is set. Add OPENROUTER_API_KEY (free at openrouter.ai/keys) to your .env file to enable explanations.',
      503,
      false
    );
  }

  const models = (process.env.OPENROUTER_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean);
  const attempts: Attempt[] = [];
  const candidates: Candidate[] = [];

  if (openRouterKey) {
    for (const model of models.length ? models : DEFAULT_OPENROUTER_MODELS) {
      candidates.push({ source: model, run: (signal) => tryOpenRouter(text, openRouterKey, model, signal) });
    }
  }
  const answer = await raceCandidates(candidates, attempts);
  if (answer) {
    remember(text, answer.explanation);
    return answer;
  }

  if (geminiKey) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    const result = await tryGemini(text, geminiKey, new AbortController().signal);
    if ('translation' in result) {
      remember(text, result);
      return { explanation: result, source: `gemini:${model}` };
    }
    attempts.push(result);
  }

  console.error('All explanation providers failed:', attempts);
  const allRateLimited = attempts.length > 0 && attempts.every((a) => a.rateLimited);
  throw new ExplainError(
    allRateLimited
      ? 'The free AI models are at their limit right now (about 50 requests a day, resetting at 00:00 UTC). Try again later.'
      : 'The free AI models are busy or unavailable right now. Please try again in a minute.',
    allRateLimited ? 429 : 503,
    true
  );
}

function remember(text: string, explanation: Explanation): Explanation {
  const store = loadCache();
  store.set(cacheKeyFor(text), explanation);
  if (store.size > MAX_CACHE_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  saveCacheSoon();
  return explanation;
}
