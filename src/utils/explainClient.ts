/**
 * Client for /api/french/explain with a browser cache, so a text you already
 * looked up opens instantly and does not use any free AI quota.
 */
export interface Explanation {
  translation: string;
  pronunciation: string;
  ipa?: string;
  partOfSpeech: string;
  grammar: string;
  vocabulary: Array<{ word: string; meaning: string; partOfSpeech: string }>;
  example?: string;
  exampleMeaning?: string;
}

const STORAGE_KEY = 'french_explanations_cache_v1';
const MAX_ENTRIES = 300;

const keyFor = (text: string) => text.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

function readCache(): Record<string, Explanation> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(key: string, value: Explanation): void {
  try {
    const cache = readCache();
    delete cache[key];
    cache[key] = value;
    const keys = Object.keys(cache);
    for (const old of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) delete cache[old];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked: the server cache still helps
  }
}

export interface ExplanationResult {
  explanation: Explanation;
  /** "browser cache", "cache" (server), or the AI model that answered. */
  source: string;
  /** Total wait in the browser, in milliseconds. */
  ms: number;
}

const prettyModel = (source: string) =>
  source
    .replace(/^nvidia\//, '')
    .replace(/:free$/, '')
    .replace(/^nemotron-3\.5-lightning$/, 'Nemotron Lightning')
    .replace(/^nemotron-3-ultra-550b-a55b$/, 'Nemotron Ultra')
    .replace(/^nemotron-3\.5-super-vl$/, 'Nemotron Super')
    .replace(/^openrouter\/free$/, 'OpenRouter free model');

export async function fetchExplanation(text: string, signal?: AbortSignal): Promise<ExplanationResult> {
  const started = performance.now();
  const key = keyFor(text);
  const cached = readCache()[key];
  if (cached) return { explanation: cached, source: 'saved answer', ms: 0 };

  const response = await fetch('/api/french/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not explain this text');
  writeCache(key, data);
  const model = response.headers.get('X-Explain-Model') || '';
  return {
    explanation: data as Explanation,
    source: model === 'cache' ? 'saved answer' : prettyModel(model) || 'AI',
    ms: Math.round(performance.now() - started),
  };
}
