import { conjugate } from 'conjugation-fr';
import verbsListJson from 'conjugation-fr/verbs-fr.json';
import { Verb, ConjugationForm, TenseId, VerbGroup, AuxiliaryVerb, VerbProgress } from '../types';
import { ALL_VERBS } from '../data/allVerbs';
import { getSavedVerbInfo } from './verbMeanings';

// Map of all 7,014 verbs in the French database
const VERB_ENTRIES = verbsListJson as unknown as Record<string, { t: string; aux?: string | string[] }>;
export const ALL_FRENCH_VERB_KEYS = Object.keys(VERB_ENTRIES);
export const TOTAL_EXTERNAL_VERBS_COUNT = ALL_FRENCH_VERB_KEYS.length;

// Built-in English translation dictionary for common French verbs
const COMMON_TRANSLATIONS: Record<string, string> = {
  être: 'to be',
  avoir: 'to have',
  aller: 'to go',
  faire: 'to do / make',
  dire: 'to say / tell',
  pouvoir: 'to be able to (can)',
  vouloir: 'to want',
  savoir: 'to know (a fact/how to)',
  falloir: 'to be necessary (must)',
  voir: 'to see',
  devoir: 'to have to (must/owe)',
  venir: 'to come',
  suivre: 'to follow',
  parler: 'to speak / talk',
  aimer: 'to love / like',
  passer: 'to pass / spend (time)',
  croire: 'to believe',
  demander: 'to ask',
  rester: 'to stay / remain',
  répondre: 'to answer / reply',
  entendre: 'to hear',
  penser: 'to think',
  arriver: 'to arrive / happen',
  connaître: 'to know (be familiar with)',
  partir: 'to leave / depart',
  mettre: 'to put / place / wear',
  tenir: 'to hold / keep',
  comprendre: 'to understand',
  rendre: 'to return / give back',
  attendre: 'to wait / expect',
  sortir: 'to go out / exit',
  vivre: 'to live',
  écrire: 'to write',
  prendre: 'to take',
  donner: 'to give',
  trouver: 'to find',
  sentir: 'to feel / smell',
  perdre: 'to lose',
  commencer: 'to begin / start',
  servir: 'to serve',
  monter: 'to go up / climb',
  laisser: 'to let / leave',
  recevoir: 'to receive',
  tomber: 'to fall',
  ouvrir: 'to open',
  lire: 'to read',
  dormir: 'to sleep',
  mourir: 'to die',
  naître: 'to be born',
  courir: 'to run',
  boire: 'to drink',
  choisir: 'to choose',
  finir: 'to finish',
  réussir: 'to succeed',
  réfléchir: 'to reflect / think over',
  grandir: 'to grow up',
  obéir: 'to obey',
  punir: 'to punish',
  maigrir: 'to lose weight',
  grossir: 'to gain weight',
  bâtir: 'to build',
  agir: 'to act',
  habiter: 'to live / reside',
  manger: 'to eat',
  acheter: 'to buy',
  appeler: 'to call',
  jeter: 'to throw',
  préférer: 'to prefer',
  espérer: 'to hope',
  essayer: 'to try',
  payer: 'to pay',
  nettoyer: 'to clean',
  voyager: 'to travel',
  étudier: 'to study',
  travailler: 'to work',
  jouer: 'to play',
  chanter: 'to sing',
  danser: 'to dance',
  fermer: 'to close',
  oublier: 'to forget',
  écouter: 'to listen to',
  regarder: 'to watch / look at',
  chercher: 'to look for / search',
  montrer: 'to show',
  porter: 'to wear / carry',
  gagner: 'to win / earn',
  vendre: 'to sell',
  descendre: 'to descend / go down',
  conduire: 'to drive',
  traduire: 'to translate',
  construire: 'to build / construct',
  détruire: 'to destroy',
  instruire: 'to instruct',
  produire: 'to produce',
  peindre: 'to paint',
  craindre: 'to fear',
  atteindre: 'to reach / attain',
  éteindre: 'to extinguish / turn off',
  joindre: 'to join / attach',
  résoudre: 'to resolve / solve',
  moudre: 'to grind',
  coudre: 'to sew',
  vaincre: 'to conquer / defeat',
  convaincre: 'to convince',
  plaire: 'to please',
  se_taire: 'to be quiet',
  taire: 'to silence / conceal',
  valoir: 'to be worth',
  pleuvoir: 'to rain',
  neiger: 'to snow',
  paraître: 'to appear / seem',
  apparaître: 'to appear',
  disparaître: 'to disappear',
  reconnaître: 'to recognize',
  battre: 'to beat / hit',
  abattre: 'to knock down',
  combattre: 'to fight',
  débattre: 'to debate',
  permettre: 'to permit / allow',
  promettre: 'to promise',
  soumettre: 'to submit',
  transmettre: 'to transmit',
  admettre: 'to admit',
  apprendre: 'to learn',
  surprendre: 'to surprise',
  entreprendre: 'to undertake',
  reprendre: 'to resume / retake',
  revenir: 'to come back',
  devenir: 'to become',
  se_souvenir: 'to remember',
  intervenir: 'to intervene',
  parvenir: 'to manage to / reach',
  prévenir: 'to prevent / warn',
  convenir: 'to suit / agree',
  obtenir: 'to obtain / get',
  retenir: 'to retain / remember',
  contenir: 'to contain',
  soutenir: 'to support',
  maintenir: 'to maintain',
  appartenir: 'to belong to',
  envoyer: 'to send',
  renvoyer: 'to send back / dismiss',
  employer: 'to employ / use',
  essuyer: 'to wipe',
  appuyer: 'to press / support',
  cueillir: 'to gather / pick',
  accueillir: 'to welcome / greet',
  recueillir: 'to collect / harvest',
  offrir: 'to offer / give',
  souffrir: 'to suffer',
  couvrir: 'to cover',
  découvrir: 'to discover',
  rouvrir: 'to reopen',
  fuir: 'to flee / run away',
  s_enfuir: 'to escape / flee',
  asseoir: 'to sit down',
  s_asseoir: 'to sit down',
  vêtir: 'to clothe / dress',
  mentir: 'to lie',
  démentir: 'to deny',
  ressentir: 'to feel / experience',
  consentir: 'to consent',
  desservir: 'to clear (table) / serve',
  repartir: 'to set off again',
  ressortir: 'to stand out / go out again',
  endormir: 'to put to sleep',
  s_endormir: 'to fall asleep',
};


// Determine group
export function detectVerbGroup(infinitive: string, template?: string): VerbGroup {
  if (infinitive === 'aller') return 3;
  if (infinitive.endsWith('er')) return 1;
  if (infinitive.endsWith('ir')) {
    if (template === 'fin:ir') return 2;
    // Check if imperfect has -iss-
    try {
      const imp = conjugate(infinitive, 'indicative', 'imperfect');
      if (imp && imp[0] && imp[0].verb.includes('iss')) {
        return 2;
      }
    } catch {
      // ignore
    }
  }
  return 3;
}

// Determine auxiliary
export function detectAuxiliary(infinitive: string): AuxiliaryVerb {
  const entry = VERB_ENTRIES[infinitive];
  if (entry && entry.aux === 'être') return 'être';

  const ETRE_VERBS = new Set([
    'aller', 'venir', 'partir', 'arriver', 'entrer', 'sortir',
    'monter', 'descendre', 'tomber', 'mourir', 'naître', 'rester',
    'retourner', 'revenir', 'devenir', 'rentrer'
  ]);
  return ETRE_VERBS.has(infinitive) ? 'être' : 'avoir';
}

// Generate an English translation if missing
export function getEnglishTranslation(infinitive: string): string {
  if (COMMON_TRANSLATIONS[infinitive]) {
    return COMMON_TRANSLATIONS[infinitive];
  }
  // Check curated ALL_VERBS
  const found = ALL_VERBS.find((v) => v.infinitive.toLowerCase() === infinitive.toLowerCase());
  if (found) return found.english;

  // Clean prefix heuristics
  if (infinitive.startsWith('re') && COMMON_TRANSLATIONS[infinitive.slice(2)]) {
    return `to re-${COMMON_TRANSLATIONS[infinitive.slice(2)].replace(/^to\s+/, '')}`;
  }
  if (infinitive.startsWith('dé') && COMMON_TRANSLATIONS[infinitive.slice(2)]) {
    return `to un-${COMMON_TRANSLATIONS[infinitive.slice(2)].replace(/^to\s+/, '')}`;
  }

  // A meaning looked up earlier with AI (see verbMeanings.ts)
  const saved = getSavedVerbInfo(infinitive);
  if (saved) return saved.english;

  // Placeholder: the verb modal looks up the real meaning when this verb is opened
  return `to ${infinitive} (French verb)`;
}

// Cache of dynamically generated Verb objects.
// Capped (least recently used is evicted) so browsing many verbs cannot grow memory without bound.
const DYNAMIC_VERB_CACHE = new Map<string, Verb>();
const DYNAMIC_VERB_CACHE_LIMIT = 300;

function rememberVerb(key: string, verb: Verb): void {
  DYNAMIC_VERB_CACHE.delete(key);
  DYNAMIC_VERB_CACHE.set(key, verb);
  if (DYNAMIC_VERB_CACHE.size > DYNAMIC_VERB_CACHE_LIMIT) {
    const oldest = DYNAMIC_VERB_CACHE.keys().next().value;
    if (oldest !== undefined) DYNAMIC_VERB_CACHE.delete(oldest);
  }
}

// Pronoun labels for UI display
const PRONOUN_DISPLAYS: Record<number, string> = {
  0: 'je / j’',
  1: 'tu',
  2: 'il / elle / on',
  3: 'nous',
  4: 'vous',
  5: 'ils / elles',
};

const SUBJUNCTIVE_DISPLAYS: Record<number, string> = {
  0: 'que je / j’',
  1: 'que tu',
  2: 'qu’il / elle',
  3: 'que nous',
  4: 'que vous',
  5: 'qu’ils / elles',
};

const IMPERATIVE_DISPLAYS: Record<number, string> = {
  1: '(tu)',
  3: '(nous)',
  4: '(vous)',
};

// Safe helper to conjugate a specific mode & tense
function getConjugatedForms(
  infinitive: string,
  mode: string,
  tense: string,
  tenseId: TenseId
): ConjugationForm[] {
  try {
    const raw = conjugate(infinitive, mode, tense);
    if (!raw || !Array.isArray(raw)) return [];

    return raw.map((item) => {
      const idx = item.pronounIndex;
      let display = PRONOUN_DISPLAYS[idx] || item.pronoun;
      if (tenseId === 'subjonctif') {
        display = SUBJUNCTIVE_DISPLAYS[idx] || item.pronoun;
      } else if (tenseId === 'imperatif') {
        display = IMPERATIVE_DISPLAYS[idx] || item.pronoun;
      }

      // Build the canonical full form
      let fullForm = '';
      const p = item.pronoun ? item.pronoun.trim() : '';
      const v = item.verb ? item.verb.trim() : '';

      if (!p) {
        fullForm = v;
      } else if (p.endsWith("'") || p.endsWith("’")) {
        fullForm = `${p}${v}`;
      } else {
        fullForm = `${p} ${v}`;
      }

      // Extract basic stem & ending
      let stem = '';
      let ending = '';
      if (v.length > 2) {
        if (v.endsWith('ent')) {
          stem = v.slice(0, -3);
          ending = 'ent';
        } else if (v.endsWith('ons')) {
          stem = v.slice(0, -3);
          ending = 'ons';
        } else if (v.endsWith('ez')) {
          stem = v.slice(0, -2);
          ending = 'ez';
        } else if (v.endsWith('ais') || v.endsWith('ait')) {
          stem = v.slice(0, -3);
          ending = v.slice(-3);
        } else if (v.endsWith('ions') || v.endsWith('iez')) {
          stem = v.slice(0, -4);
          ending = v.slice(-4);
        } else if (v.endsWith('es')) {
          stem = v.slice(0, -2);
          ending = 'es';
        } else if (v.endsWith('e') || v.endsWith('s') || v.endsWith('t') || v.endsWith('d')) {
          stem = v.slice(0, -1);
          ending = v.slice(-1);
        }
      }

      return {
        pronoun: p || display,
        pronounDisplay: display,
        form: fullForm,
        stem: stem || undefined,
        ending: ending || undefined,
      };
    });
  } catch {
    return [];
  }
}

// Build a full Verb model dynamically from the 7,014 French verb library
export function conjugateVerbFromLibrary(infinitive: string): Verb {
  const normalized = infinitive.trim().toLowerCase();

  // Check cache first
  const cached = DYNAMIC_VERB_CACHE.get(normalized);
  if (cached) {
    rememberVerb(normalized, cached);
    return cached;
  }

  // Check curated list
  const existing = ALL_VERBS.find((v) => v.infinitive.toLowerCase() === normalized);
  if (existing) {
    rememberVerb(normalized, existing);
    return existing;
  }

  const verbObj = buildLibraryVerb(normalized);
  rememberVerb(normalized, verbObj);
  return verbObj;
}

// Build a Verb from the library without touching the cache.
function buildLibraryVerb(normalized: string): Verb {
  const entry = VERB_ENTRIES[normalized];
  const template = entry?.t;
  const group = detectVerbGroup(normalized, template);
  const auxiliary = detectAuxiliary(normalized);
  const english = getEnglishTranslation(normalized);

  // Retrieve past participle
  let pastParticiple = '';
  try {
    const ppList = conjugate(normalized, 'participle', 'past-participle');
    if (ppList && ppList[0]) {
      pastParticiple = ppList[0].verb;
    }
  } catch {
    // fallback
    if (group === 1) pastParticiple = `${normalized.slice(0, -2)}é`;
    else if (group === 2) pastParticiple = `${normalized.slice(0, -2)}i`;
    else pastParticiple = `${normalized.slice(0, -2)}u`;
  }

  // Retrieve present participle
  let presentParticiple = '';
  try {
    const prpList = conjugate(normalized, 'participle', 'present-participle');
    if (prpList && prpList[0]) {
      presentParticiple = prpList[0].verb;
    }
  } catch {
    presentParticiple = `${normalized.slice(0, -2)}ant`;
  }

  // Retrieve conjugations for all 7 tenses
  const present = getConjugatedForms(normalized, 'indicative', 'present', 'present');
  const imparfait = getConjugatedForms(normalized, 'indicative', 'imperfect', 'imparfait');
  const passeCompose = getConjugatedForms(normalized, 'indicative', 'perfect-tense', 'passeCompose');
  const futurSimple = getConjugatedForms(normalized, 'indicative', 'future', 'futurSimple');
  const conditionnel = getConjugatedForms(normalized, 'conditional', 'present', 'conditionnel');
  const subjonctif = getConjugatedForms(normalized, 'subjunctive', 'present', 'subjonctif');
  const imperatif = getConjugatedForms(normalized, 'imperative', 'imperative-present', 'imperatif');

  const verbObj: Verb = {
    id: normalized.replace(/[^a-z0-9]/g, '_'),
    infinitive: normalized,
    english,
    group,
    auxiliary,
    regular: group === 1 && normalized !== 'aller',
    level: 'B1',
    frequencyRank: 999,
    pastParticiple: pastParticiple || `${normalized.slice(0, -2)}é`,
    presentParticiple: presentParticiple || `${normalized.slice(0, -2)}ant`,
    conjugations: {
      present,
      imparfait,
      passeCompose,
      futurSimple,
      conditionnel,
      subjonctif,
      imperatif,
    },
    example: {
      fr: `Nous aimons ${normalized} quand nous avons du temps.`,
      en: `We like to ${english.replace(/^to\s+/, '')} when we have time.`,
      verbForm: normalized,
    },
    tip:
      group === 1
        ? 'Regular 1st group (-er) verb. Uses standard endings: -e, -es, -e, -ons, -ez, -ent.'
        : group === 2
        ? '2nd group verb with regular "-iss-" infix in plural forms (nous -issons, vous -issez, ils -issent).'
        : `3rd group irregular verb with auxiliary "${auxiliary}". Check root stems for future and subjunctive tenses.`,
  };

  return verbObj;
}

// Search across all 7,014 French verbs plus curated database
export interface VerbSearchResult {
  id: string;
  infinitive: string;
  english: string;
  group: VerbGroup;
  auxiliary: AuxiliaryVerb;
  isCurated: boolean;
}

export function searchAnyFrenchVerb(query: string, limit = 12): VerbSearchResult[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const results: VerbSearchResult[] = [];
  const seen = new Set<string>();

  // 1. First priority: search curated ALL_VERBS
  for (const v of ALL_VERBS) {
    if (v.infinitive.toLowerCase().startsWith(q) || v.english.toLowerCase().includes(q)) {
      results.push({
        id: v.id,
        infinitive: v.infinitive,
        english: v.english,
        group: v.group,
        auxiliary: v.auxiliary,
        isCurated: true,
      });
      seen.add(v.infinitive.toLowerCase());
      if (results.length >= limit) return results;
    }
  }

  // 2. Second priority: exact match in the 7,014 database
  if (VERB_ENTRIES[q] && !seen.has(q)) {
    results.unshift({
      id: q.replace(/[^a-z0-9]/g, '_'),
      infinitive: q,
      english: getEnglishTranslation(q),
      group: detectVerbGroup(q, VERB_ENTRIES[q].t),
      auxiliary: detectAuxiliary(q),
      isCurated: false,
    });
    seen.add(q);
  }

  // 3. Third priority: startsWith match in the 7,014 database
  for (let i = 0; i < ALL_FRENCH_VERB_KEYS.length; i++) {
    const key = ALL_FRENCH_VERB_KEYS[i];
    if (!seen.has(key) && key.startsWith(q)) {
      results.push({
        id: key.replace(/[^a-z0-9]/g, '_'),
        infinitive: key,
        english: getEnglishTranslation(key),
        group: detectVerbGroup(key, VERB_ENTRIES[key].t),
        auxiliary: detectAuxiliary(key),
        isCurated: false,
      });
      seen.add(key);
      if (results.length >= limit) return results;
    }
  }

  // 4. Fourth priority: substring match in the 7,014 database
  for (let i = 0; i < ALL_FRENCH_VERB_KEYS.length; i++) {
    const key = ALL_FRENCH_VERB_KEYS[i];
    if (!seen.has(key) && key.includes(q)) {
      results.push({
        id: key.replace(/[^a-z0-9]/g, '_'),
        infinitive: key,
        english: getEnglishTranslation(key),
        group: detectVerbGroup(key, VERB_ENTRIES[key].t),
        auxiliary: detectAuxiliary(key),
        isCurated: false,
      });
      seen.add(key);
      if (results.length >= limit) return results;
    }
  }

  return results;
}

export interface FrenchQueryMatch {
  id: string;
  infinitive: string;
  english: string;
  conjugatedForm?: string;
  tenseName?: string;
  kind: 'infinitive' | 'conjugated';
}

const normalizeFrenchSearch = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ');

const FORM_TENSES: Array<{ id: TenseId; name: string }> = [
  { id: 'present', name: 'Présent' },
  { id: 'passeCompose', name: 'Passé Composé' },
  { id: 'imparfait', name: 'Imparfait' },
  { id: 'futurSimple', name: 'Futur Simple' },
  { id: 'conditionnel', name: 'Conditionnel' },
  { id: 'subjonctif', name: 'Subjonctif' },
  { id: 'imperatif', name: 'Impératif' },
];

// The ways a typed word can match one conjugated form: the full form ("j'aime"),
// the form without its pronoun ("aime"). Multi-word keys are skipped because
// searches containing a space are not reverse-searched.
function formSearchKeys(form: string): string[] {
  const keys = new Set([
    normalizeFrenchSearch(form),
    normalizeFrenchSearch(form.replace(/^[a-zàâäçéèêëîïôöùûüÿ]+[' ]/i, '')),
    normalizeFrenchSearch(form.replace(/^je\s+|^tu\s+|^il\s+|^elle\s+|^on\s+|^nous\s+|^vous\s+|^ils\s+|^elles\s+/, '').trim()),
  ]);
  return [...keys].filter((key) => key && !key.includes(' '));
}

// A hit is packed as one number: verb index * 100 + tense index * 10 + person index.
const packHit = (verbIdx: number, tenseIdx: number, personIdx: number) => verbIdx * 100 + tenseIdx * 10 + personIdx;

function addVerbToIndex(index: Map<string, number[]>, verb: Verb, verbIdx: number): void {
  FORM_TENSES.forEach((tense, tenseIdx) => {
    (verb.conjugations[tense.id] || []).forEach((form, personIdx) => {
      for (const key of formSearchKeys(form.form)) {
        const hits = index.get(key);
        const hit = packHit(verbIdx, tenseIdx, personIdx);
        if (!hits) index.set(key, [hit]);
        else if (hits[hits.length - 1] !== hit) hits.push(hit);
      }
    });
  });
}

// Curated verbs: small, so indexed synchronously on first search.
let curatedFormIndex: Map<string, number[]> | null = null;
function getCuratedFormIndex(): Map<string, number[]> {
  if (!curatedFormIndex) {
    curatedFormIndex = new Map();
    ALL_VERBS.forEach((verb, idx) => addVerbToIndex(curatedFormIndex!, verb, idx));
  }
  return curatedFormIndex;
}

// Library verbs (~7,000): indexed once, in small slices, so the page never freezes.
// Before this index finishes, only curated verbs are found; listeners are told when it is ready.
const CURATED_INFINITIVES = new Set(ALL_VERBS.map((v) => v.infinitive.toLowerCase()));
const LIBRARY_INDEX_KEYS = ALL_FRENCH_VERB_KEYS.filter((key) => !CURATED_INFINITIVES.has(key));
const libraryFormIndex = new Map<string, number[]>();
let libraryIndexedCount = 0;
let libraryIndexPromise: Promise<void> | null = null;
const libraryIndexListeners = new Set<() => void>();

export function isFrenchFormIndexReady(): boolean {
  return libraryIndexedCount >= LIBRARY_INDEX_KEYS.length;
}

export function onFrenchFormIndexReady(listener: () => void): () => void {
  if (isFrenchFormIndexReady()) {
    listener();
    return () => {};
  }
  libraryIndexListeners.add(listener);
  return () => libraryIndexListeners.delete(listener);
}

function indexLibrarySlice(budgetMs: number): void {
  const deadline = performance.now() + budgetMs;
  while (libraryIndexedCount < LIBRARY_INDEX_KEYS.length && performance.now() < deadline) {
    const idx = libraryIndexedCount++;
    try {
      addVerbToIndex(libraryFormIndex, buildLibraryVerb(LIBRARY_INDEX_KEYS[idx]), idx);
    } catch {
      // skip the rare verb the library cannot conjugate
    }
  }
}

// Start building the library index in the background (safe to call many times).
export function warmFrenchFormIndex(): Promise<void> {
  if (!libraryIndexPromise) {
    libraryIndexPromise = new Promise((resolve) => {
      const step = () => {
        indexLibrarySlice(12);
        if (isFrenchFormIndexReady()) {
          libraryIndexListeners.forEach((listener) => listener());
          libraryIndexListeners.clear();
          resolve();
        } else {
          setTimeout(step, 0);
        }
      };
      step();
    });
  }
  return libraryIndexPromise;
}

// Build the whole library index right away (used by scripts and tests).
export function buildFrenchFormIndexSync(): void {
  indexLibrarySlice(Infinity);
}

// Reverse-search a user-typed conjugated form ("suis" -> être, suivre).
// Uses precomputed indexes, so each search is a couple of map lookups.
export function searchFrenchConjugatedForms(query: string, limit = 8): FrenchQueryMatch[] {
  const q = normalizeFrenchSearch(query);
  if (!q || q.includes(' ') || q.length < 2) return [];

  if (!libraryIndexPromise) void warmFrenchFormIndex();

  const matches: FrenchQueryMatch[] = [];
  const seen = new Set<string>();
  const collect = (hits: number[] | undefined, verbAt: (idx: number) => Verb | null) => {
    for (const hit of hits || []) {
      if (matches.length >= limit) return;
      const verb = verbAt(Math.floor(hit / 100));
      if (!verb) continue;
      const tense = FORM_TENSES[Math.floor(hit / 10) % 10];
      const form = verb.conjugations[tense.id]?.[hit % 10];
      if (!form) continue;
      const key = `${verb.id}:${tense.id}:${form.form}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        id: verb.id,
        infinitive: verb.infinitive,
        english: verb.english,
        conjugatedForm: form.form,
        tenseName: tense.name,
        kind: 'conjugated',
      });
    }
  };

  collect(getCuratedFormIndex().get(q), (idx) => ALL_VERBS[idx] || null);
  collect(libraryFormIndex.get(q), (idx) => {
    try {
      return conjugateVerbFromLibrary(LIBRARY_INDEX_KEYS[idx]);
    } catch {
      return null;
    }
  });

  return matches;
}

// Get or dynamically conjugate a verb from either curated or external library
export function getVerbByInfinitiveOrId(idOrInfinitive: string): Verb | null {
  if (!idOrInfinitive) return null;
  const normalized = idOrInfinitive.trim().toLowerCase().replace(/_/g, ' ');
  
  // Try curated
  const curated = ALL_VERBS.find(
    (v) => v.id.toLowerCase() === idOrInfinitive.toLowerCase() || v.infinitive.toLowerCase() === normalized
  );
  if (curated) return curated;

  // Try dynamic library
  const cleanedKey = idOrInfinitive.trim().toLowerCase().replace(/\s+/g, '_');
  const directKey = idOrInfinitive.trim().toLowerCase();
  if (VERB_ENTRIES[directKey] || VERB_ENTRIES[cleanedKey] || directKey.endsWith('er') || directKey.endsWith('ir') || directKey.endsWith('re')) {
    try {
      return conjugateVerbFromLibrary(VERB_ENTRIES[directKey] ? directKey : VERB_ENTRIES[cleanedKey] ? cleanedKey : directKey);
    } catch {
      return null;
    }
  }

  return null;
}

// Get all bookmarked verbs (both curated and dynamic 7,000+ library verbs)
export function getAllFavoriteVerbs(progress?: Record<string, VerbProgress>): Verb[] {
  const favorites: Verb[] = [];
  const seen = new Set<string>();

  const prog: Record<string, VerbProgress> =
    progress ||
    (typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(
              localStorage.getItem('french_verbs_progress') ||
              localStorage.getItem('french_verb_progress') ||
              '{}'
            );
          } catch {
            return {};
          }
        })()
      : {});

  Object.keys(prog).forEach((verbId) => {
    if (prog[verbId]?.bookmarked) {
      const verb = getVerbByInfinitiveOrId(verbId);
      if (verb && !seen.has(verb.id)) {
        seen.add(verb.id);
        favorites.push(verb);
      }
    }
  });

  return favorites;
}

// Get random sample of verbs from the 7,014 database for specific groups
export function getRandomVerbsFromLibrary(
  count: number,
  options?: { groups?: number[]; excludeIds?: string[] } | number[]
): Verb[] {
  const groups = Array.isArray(options) ? options : options?.groups || [1, 2, 3];
  const exclude = new Set(!Array.isArray(options) ? options?.excludeIds || [] : []);

  // Filter keys by group
  const eligibleKeys = ALL_FRENCH_VERB_KEYS.filter((key) => {
    if (exclude.has(key)) return false;
    const entry = VERB_ENTRIES[key];
    const group = detectVerbGroup(key, entry?.t);
    return groups.includes(group);
  });

  if (eligibleKeys.length === 0) {
    return ALL_VERBS.slice(0, count);
  }

  // Shuffle and pick
  const shuffled = [...eligibleKeys].sort(() => Math.random() - 0.5);
  const pickedKeys = shuffled.slice(0, Math.min(count, 50));

  const verbs: Verb[] = [];
  for (const key of pickedKeys) {
    try {
      const v = conjugateVerbFromLibrary(key);
      verbs.push(v);
    } catch {
      // ignore rare conjugation errors
    }
  }

  return verbs.length > 0 ? verbs : ALL_VERBS.slice(0, count);
}
