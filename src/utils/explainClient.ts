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

export async function fetchExplanation(text: string): Promise<Explanation> {
  const key = keyFor(text);
  const cached = readCache()[key];
  if (cached) return cached;

  const response = await fetch('/api/french/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not explain this text');
  writeCache(key, data);
  return data as Explanation;
}
