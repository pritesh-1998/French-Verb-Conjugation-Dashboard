import { conjugate } from 'conjugation-fr';
import verbsListJson from 'conjugation-fr/verbs-fr.json';
import { Verb, ConjugationForm, TenseId, VerbGroup, AuxiliaryVerb, VerbProgress } from '../types';
import { ALL_VERBS } from '../data/allVerbs';

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

  // Format cleanly as "to [verb]"
  return `to ${infinitive} (French verb)`;
}

// Cache of dynamically generated Verb objects
const DYNAMIC_VERB_CACHE = new Map<string, Verb>();

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
  if (DYNAMIC_VERB_CACHE.has(normalized)) {
    return DYNAMIC_VERB_CACHE.get(normalized)!;
  }

  // Check curated list
  const existing = ALL_VERBS.find((v) => v.infinitive.toLowerCase() === normalized);
  if (existing) {
    DYNAMIC_VERB_CACHE.set(normalized, existing);
    return existing;
  }

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

  DYNAMIC_VERB_CACHE.set(normalized, verbObj);
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

// Reverse-search a user-typed conjugated form across the library.
// Curated verbs are checked first for a fast, reliable answer; external
// verbs are checked only until the requested result limit is reached.
export function searchFrenchConjugatedForms(query: string, limit = 8): FrenchQueryMatch[] {
  const q = normalizeFrenchSearch(query);
  if (!q || q.includes(' ') || q.length < 2) return [];

  const tenseChecks: Array<{ id: TenseId; name: string }> = [
    { id: 'present', name: 'Présent' },
    { id: 'passeCompose', name: 'Passé Composé' },
    { id: 'imparfait', name: 'Imparfait' },
    { id: 'futurSimple', name: 'Futur Simple' },
    { id: 'conditionnel', name: 'Conditionnel' },
    { id: 'subjonctif', name: 'Subjonctif' },
    { id: 'imperatif', name: 'Impératif' },
  ];
  const matches: FrenchQueryMatch[] = [];
  const seen = new Set<string>();

  const checkVerb = (verb: Verb) => {
    for (const tense of tenseChecks) {
      for (const form of verb.conjugations[tense.id] || []) {
        const candidates = [
          normalizeFrenchSearch(form.form),
          normalizeFrenchSearch(form.form.replace(/^[a-zàâäçéèêëîïôöùûüÿ]+[' ]/i, '')),
          normalizeFrenchSearch(form.form.replace(/^je\s+|^tu\s+|^il\s+|^elle\s+|^on\s+|^nous\s+|^vous\s+|^ils\s+|^elles\s+/, '').trim()),
        ];
        if (candidates.some((candidate) => candidate === q)) {
          const key = `${verb.id}:${tense.id}:${form.form}`;
          if (!seen.has(key)) {
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
        }
      }
      if (matches.length >= limit) return true;
    }
    return false;
  };

  for (const verb of ALL_VERBS) {
    if (checkVerb(verb)) return matches;
  }

  for (const key of ALL_FRENCH_VERB_KEYS) {
    const verb = conjugateVerbFromLibrary(key);
    if (checkVerb(verb)) break;
  }

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
