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
// Order (updated 2026-11-23):
//   1. Nemotron 3 Ultra: strongest free option, ~1.3 s to first token; reliable in real use.
//   2. Nemotron 3.5 Super VL, then `openrouter/free` (any available free model).
//   3. Nemotron 3.5 Lightning last: fast on paper but failing in real use.
// Not usable here: Perplexity Decider models only return probabilities via a separate
// Decisions API, they cannot write explanations.
// Note: NVIDIA's free endpoints log prompts to improve their products, so never send personal data.
const DEFAULT_OPENROUTER_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'openrouter/free',
  'nvidia/nemotron-3.5-lightning:free',
];

const REQUEST_TIMEOUT_MS = 20000;
// If a model has not answered after this long, a backup model starts in parallel and the
// first valid answer wins (the slower request is cancelled). Free models are often queued,
// so this cuts the worst-case wait a lot. Override with EXPLAIN_HEDGE_MS.
// 10 s keeps quota use low: a parallel backup request also counts toward the 50/day free limit.
const HEDGE_DELAY_MS = Number(process.env.EXPLAIN_HEDGE_MS) || 10000;

const CACHE_FILE = process.env.EXPLAIN_CACHE_FILE || path.join(process.cwd(), '.cache', 'explanations.json');
const MAX_CACHE_ENTRIES = 5000;
// Holds sentence explanations (key = text) and verb meanings (key = "verb:<infinitive>").
let cache: Map<string, unknown> | null = null;
let saveTimer: NodeJS.Timeout | null = null;

function loadCache(): Map<string, unknown> {
  if (cache) return cache;
  cache = new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, unknown>;
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
function extractJson(raw: string | undefined): any {
  if (!raw) return null;
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parseExplanation(raw: string | undefined): Explanation | null {
  const data = extractJson(raw);
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
}

interface Attempt {
  provider: string;
  error: string;
  rateLimited: boolean;
  /** The account-wide free limit was hit, so other free models will fail too. */
  accountLimit?: boolean;
}

/** One kind of AI request: the prompt and how to validate the reply. */
interface Task<T> {
  prompt: string;
  parse: (raw: string | undefined) => T | null;
}

type Outcome<T> = { ok: T } | Attempt;

const abortReason = (err: any) =>
  err?.name === 'TimeoutError' ? 'timed out' : err?.name === 'AbortError' ? 'cancelled (another model answered)' : String(err?.message || err);

async function tryOpenRouter<T>(task: Task<T>, apiKey: string, model: string, signal: AbortSignal): Promise<Outcome<T>> {
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
        messages: [{ role: 'user', content: task.prompt }],
        temperature: 0.2,
        // Reasoning models (Ultra) spend tokens thinking before answering: keep it short and
        // leave room for the JSON. Models without reasoning ignore this field.
        reasoning: { effort: 'low' },
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
        accountLimit: /openrouter_free_tier_(daily|per_minute)|free-models-per-(day|min)/i.test(body),
      };
    }
    const payload = (await response.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string | null; reasoning?: string | null }; finish_reason?: string }>;
    };
    // Guard against a free id being silently served by a paid model.
    if (payload.model && model.endsWith(':free') && !String(payload.model).startsWith(model.replace(/:free$/, ''))) {
      console.warn(`OpenRouter served ${payload.model} for ${model}`);
    }
    const choice = payload.choices?.[0];
    const content = choice?.message?.content || '';
    // Some reasoning models put the final JSON in `reasoning` and leave `content` empty.
    const parsed = task.parse(content) ?? task.parse(choice?.message?.reasoning || undefined);
    if (parsed) return { ok: parsed };
    return {
      provider,
      error: !content.trim()
        ? `empty reply (finish_reason: ${choice?.finish_reason ?? 'unknown'})`
        : `reply was not valid JSON: ${content.slice(0, 120)}`,
      rateLimited: false,
    };
  } catch (err: any) {
    return { provider, error: abortReason(err), rateLimited: false };
  }
}

// Google retires model ids for new users, so default to its "-latest" aliases.
const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-flash-lite-latest,gemini-flash-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

async function tryGemini<T>(task: Task<T>, apiKey: string, signal: AbortSignal, model: string): Promise<Outcome<T>> {
  const provider = `gemini:${model}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: task.prompt }] }],
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
    const parsed = task.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text);
    return parsed ? { ok: parsed } : { provider, error: 'reply was not valid JSON', rateLimited: false };
  } catch (err: any) {
    return { provider, error: abortReason(err), rateLimited: false };
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

interface Answer<T> {
  value: T;
  source: string;
}

const inFlight = new Map<string, Promise<Answer<unknown>>>();

/** Cache lookup, then one shared AI call per key (identical requests at once share it). */
async function cachedAiCall<T>(key: string, task: Task<T>): Promise<{ value: T; cached: boolean; source: string; ms: number }> {
  const started = Date.now();
  const hit = loadCache().get(key) as T | undefined;
  if (hit) return { value: hit, cached: true, source: 'cache', ms: Date.now() - started };

  let pending = inFlight.get(key) as Promise<Answer<T>> | undefined;
  if (!pending) {
    pending = runProviders(task).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  const answer = await pending;
  remember(key, answer.value);
  return { value: answer.value, source: answer.source, cached: false, ms: Date.now() - started };
}

export async function explainFrench(text: string): Promise<ExplainResult> {
  const { value, ...meta } = await cachedAiCall(cacheKeyFor(text), {
    prompt: buildPrompt(text),
    parse: parseExplanation,
  });
  return { explanation: value, ...meta };
}

type Candidate<T> = { source: string; run: (signal: AbortSignal) => Promise<Outcome<T>> };

/**
 * Staggered race: start the first model; if it has not answered within HEDGE_DELAY_MS,
 * start the next one too (or immediately, if the first one already failed). The first
 * valid answer wins and the other requests are cancelled.
 */
function raceCandidates<T>(candidates: Candidate<T>[], attempts: Attempt[]): Promise<Answer<T> | null> {
  return new Promise((resolve) => {
    const controller = new AbortController();
    let next = 0;
    let running = 0;
    let done = false;
    let hedgeTimer: NodeJS.Timeout | null = null;
    let stopLaunching = false;

    const finish = (answer: Answer<T> | null) => {
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
        if ('ok' in result) {
          console.log(`AI answer from ${candidate.source} in ${Date.now() - startedAt} ms`);
          finish({ value: result.ok, source: candidate.source });
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

let openRouterDailyLimitUntil = 0;

async function runProviders<T>(task: Task<T>): Promise<Answer<T>> {
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
  const candidates: Candidate<T>[] = [];

  // After OpenRouter reports the daily free limit, skip it until the reset (00:00 UTC)
  // and go straight to the backup, instead of waiting on a refusal every time.
  const openRouterPaused = Date.now() < openRouterDailyLimitUntil;
  if (openRouterPaused) {
    attempts.push({ provider: 'openrouter', error: 'skipped: free-models-per-day limit reached earlier today', rateLimited: true, accountLimit: true });
  }

  if (openRouterKey && !openRouterPaused) {
    for (const model of models.length ? models : DEFAULT_OPENROUTER_MODELS) {
      candidates.push({ source: model, run: (signal) => tryOpenRouter(task, openRouterKey, model, signal) });
    }
  }
  const answer = await raceCandidates(candidates, attempts);
  if (answer) return answer;
  if (attempts.some((a) => /free-models-per-day|openrouter_free_tier_daily/i.test(a.error))) {
    const reset = new Date();
    reset.setUTCHours(24, 0, 0, 0);
    openRouterDailyLimitUntil = reset.getTime();
  }

  if (geminiKey) {
    for (const model of GEMINI_MODELS) {
      const result = await tryGemini(task, geminiKey, new AbortController().signal, model);
      if ('ok' in result) return { value: result.ok, source: `gemini:${model}` };
      attempts.push(result);
      if (!/HTTP 404/.test(result.error)) break; // only a retired/unknown model is worth trying the next id
    }
  }

  console.error('All AI providers failed:', attempts);
  const allRateLimited = attempts.length > 0 && attempts.every((a) => a.rateLimited);
  if (allRateLimited) {
    throw new ExplainError(
      'The free AI models are at their limit right now (about 50 requests a day, resetting at 00:00 UTC). Try again later.',
      429,
      true
    );
  }
  throw new ExplainError(describeFailure(attempts), 503, true);
}

const shortModel = (provider: string) =>
  provider.replace(/^openrouter:/, '').replace(/^nvidia\//, '').replace(/:free$/, '');

/** Turn provider errors into a message that says what to do. */
export function describeFailure(attempts: Attempt[]): string {
  const all = attempts.map((a) => a.error).join('\n');
  let hint = 'The free AI models are busy or unavailable right now. Please try again in a minute.';
  if (/free-models-per-day|openrouter_free_tier_daily/i.test(all)) {
    hint =
      "You've used today's 50 free OpenRouter requests. They reset at 00:00 UTC (7 PM in Toronto). " +
      'Saved answers still work. Adding $10 of OpenRouter credits once raises the limit to 1,000 a day.';
  } else if (/HTTP 401|No auth|User not found|invalid.*key/i.test(all)) {
    hint = 'OpenRouter rejected the API key. Check OPENROUTER_API_KEY in your .env file (no quotes or spaces), then restart the server.';
  } else if (/HTTP 402/.test(all)) {
    hint = 'OpenRouter says the account balance is negative, which blocks free models too. Check openrouter.ai/settings/credits.';
  } else if (/HTTP 404/.test(all) && /data policy|privacy|No endpoints found/i.test(all)) {
    hint = 'OpenRouter is blocking free models because of your privacy settings. Open openrouter.ai/settings/privacy and allow free endpoints that may train on or publish prompts, then try again.';
  } else if (/HTTP 404/.test(all)) {
    hint = 'One or more model names no longer exist on OpenRouter. Set OPENROUTER_MODELS in .env to free models listed at openrouter.ai/models?q=free.';
  } else if (/empty reply|not valid JSON/.test(all)) {
    hint = 'The free models answered, but not in the expected format. Please try again; if it keeps happening, try a different model in OPENROUTER_MODELS.';
  } else if (/timed out/.test(all) && attempts.every((a) => /timed out|cancelled/.test(a.error))) {
    hint = 'The free models took too long to answer (they are probably queued). Please try again in a minute.';
  }
  const details = attempts
    .filter((a) => !/cancelled/.test(a.error))
    .map((a) => `• ${shortModel(a.provider)}: ${a.error.replace(/\s+/g, ' ').slice(0, 140)}`)
    .join('\n');
  return details ? `${hint}\n\nDetails:\n${details}` : hint;
}

/** Quick health check of the OpenRouter key and today's free usage. */
export async function checkOpenRouterKey(): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, problem: 'OPENROUTER_API_KEY is not set' };
  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    const body = await response.json().catch(() => ({}));
    return response.ok
      ? { ok: true, models: process.env.OPENROUTER_MODELS || DEFAULT_OPENROUTER_MODELS.join(','), key: body?.data ?? body }
      : { ok: false, status: response.status, problem: body?.error?.message || 'OpenRouter rejected the key' };
  } catch (err: any) {
    return { ok: false, problem: `Could not reach OpenRouter: ${err?.message || err}` };
  }
}

function remember(key: string, value: unknown): void {
  const store = loadCache();
  store.set(key, value);
  if (store.size > MAX_CACHE_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  saveCacheSoon();
}

// ---------------------------------------------------------------------------
// Verb meanings for the ~7,000 library verbs that have no built-in English translation.

export interface VerbInfo {
  /** English meaning, e.g. "to chat / to gossip". */
  english: string;
  /** One short note on usage or register (e.g. informal, reflexive use). */
  note: string;
  example: { fr: string; en: string };
}

function buildVerbPrompt(infinitive: string): string {
  return `You are a French dictionary for English speakers. The French verb is "${infinitive.replace(/"/g, '')}".
Reply with ONLY one JSON object, no markdown, in exactly this shape:
{
  "english": "the English meaning as 'to ...', with up to 3 common senses separated by ' / '",
  "note": "one short sentence on how it is used (register, common contexts, reflexive or prepositions if relevant)",
  "example": {"fr": "one short, natural everyday French sentence using the verb (conjugated)", "en": "its English translation"}
}`;
}

function parseVerbInfo(raw: string | undefined): VerbInfo | null {
  const data = extractJson(raw);
  if (typeof data?.english !== 'string' || !data.english.trim()) return null;
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const english = str(data.english);
  return {
    english: /^to\s/i.test(english) ? english : `to ${english}`,
    note: str(data.note),
    example: { fr: str(data.example?.fr), en: str(data.example?.en) },
  };
}

export async function lookupVerbInfo(infinitive: string): Promise<{ info: VerbInfo; cached: boolean; source: string; ms: number }> {
  const clean = infinitive.trim().toLowerCase();
  const { value, ...meta } = await cachedAiCall(`verb:${clean}`, {
    prompt: buildVerbPrompt(clean),
    parse: parseVerbInfo,
  });
  return { info: value, ...meta };
}
