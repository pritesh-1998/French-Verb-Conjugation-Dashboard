/**
 * English meanings for library verbs that have no built-in translation.
 * Looked up once with AI (/api/french/verb-info), then saved in the browser,
 * so each verb costs at most one free AI request.
 */
export interface VerbInfo {
  english: string;
  note: string;
  example: { fr: string; en: string };
}

const STORAGE_KEY = 'french_verb_meanings_v1';
let memory: Record<string, VerbInfo> | null = null;

function readAll(): Record<string, VerbInfo> {
  if (memory) return memory;
  try {
    memory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    memory = {};
  }
  return memory!;
}

export function getSavedVerbInfo(infinitive: string): VerbInfo | null {
  if (typeof window === 'undefined') return null;
  return readAll()[infinitive.trim().toLowerCase()] || null;
}

function saveVerbInfo(infinitive: string, info: VerbInfo): void {
  const all = readAll();
  all[infinitive.trim().toLowerCase()] = info;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage full or blocked: the server cache still has it
  }
}

/** True when the app only has a placeholder ("to papoter (French verb)") for this verb. */
export function needsVerbMeaning(english: string): boolean {
  return /\(French verb\)\s*$/.test(english);
}

export async function fetchVerbInfo(infinitive: string, signal?: AbortSignal): Promise<VerbInfo> {
  const saved = getSavedVerbInfo(infinitive);
  if (saved) return saved;
  const response = await fetch('/api/french/verb-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ infinitive }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not look up this verb');
  saveVerbInfo(infinitive, data as VerbInfo);
  return data as VerbInfo;
}
