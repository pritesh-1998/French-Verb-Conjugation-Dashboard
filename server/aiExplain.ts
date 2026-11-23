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
// `openrouter/free` is OpenRouter's router that picks any available free model, used as the last resort.
const DEFAULT_OPENROUTER_MODELS = [
  'nvidia/nemotron-3.5-super-vl:free',
  'inclusionai/ling-3.2-flash:free',
  'nvidia/nemotron-3.5-lightning:free',
  'openrouter/free',
];

const REQUEST_TIMEOUT_MS = 15000;

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
For sentences, give 3-6 vocabulary entries for the core words. For a single word, focus on meaning, pronunciation, gender if it is a noun, and usage.`;
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

async function tryOpenRouter(text: string, apiKey: string, model: string): Promise<Explanation | Attempt> {
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
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
    return { provider, error: err?.name === 'TimeoutError' ? 'timed out' : String(err?.message || err), rateLimited: false };
  }
}

async function tryGemini(text: string, apiKey: string): Promise<Explanation | Attempt> {
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
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
    return { provider, error: err?.name === 'TimeoutError' ? 'timed out' : String(err?.message || err), rateLimited: false };
  }
}

const inFlight = new Map<string, Promise<Explanation>>();

export async function explainFrench(text: string): Promise<{ explanation: Explanation; cached: boolean }> {
  const key = cacheKeyFor(text);
  const hit = loadCache().get(key);
  if (hit) return { explanation: hit, cached: true };

  // Two identical requests at once share one AI call.
  let pending = inFlight.get(key);
  if (!pending) {
    pending = runProviders(text).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  const explanation = await pending;
  return { explanation, cached: false };
}

async function runProviders(text: string): Promise<Explanation> {
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

  if (openRouterKey) {
    for (const model of models.length ? models : DEFAULT_OPENROUTER_MODELS) {
      const result = await tryOpenRouter(text, openRouterKey, model);
      if ('translation' in result) return remember(text, result);
      attempts.push(result);
      if (result.accountLimit) break;
    }
  }
  if (geminiKey) {
    const result = await tryGemini(text, geminiKey);
    if ('translation' in result) return remember(text, result);
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
