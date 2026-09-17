import { Verb } from '../types';
import { buildErVerb, buildIrRegularVerb } from './verbGenerators';
import { IRREGULAR_VERBS } from './irregularVerbs';

// Regular 1st group (-er) verbs
const ER_VERBS: Verb[] = [
  buildErVerb(
    'parler',
    'parler',
    'to speak / talk',
    'A1',
    10,
    {
      fr: 'Je parle couramment français et anglais.',
      en: 'I speak French and English fluently.',
      verbForm: 'parle',
    },
    'Model verb for regular 1st group (-er). Follows the standard -e, -es, -e, -ons, -ez, -ent pattern.'
  ),
  buildErVerb(
    'aimer',
    'aimer',
    'to love / like',
    'A1',
    11,
    {
      fr: 'Nous aimons voyager en été.',
      en: 'We love to travel in summer.',
      verbForm: 'aimons',
    },
    'Starts with a vowel: elision occurs with "je" -> "j\'aime".'
  ),
  buildErVerb(
    'habiter',
    'habiter',
    'to live / reside',
    'A1',
    12,
    {
      fr: 'Ils habitent dans un charmant appartement.',
      en: 'They live in a charming apartment.',
      verbForm: 'habitent',
    },
    'Mute "h" requires elision: "j\'habite". Silent -ent in ils habitent.'
  ),
  buildErVerb(
    'manger',
    'manger',
    'to eat',
    'A1',
    13,
    {
      fr: 'Nous mangeons souvent ensemble le dimanche.',
      en: 'We often eat together on Sundays.',
      verbForm: 'mangeons',
    },
    'Stem change: adds an "e" before "o" or "a" to preserve soft "g" sound (nous mangeons, je mangeais).'
  ),
  buildErVerb(
    'commencer',
    'commencer',
    'to begin / start',
    'A2',
    14,
    {
      fr: 'Le cours commence à neuf heures.',
      en: 'The class begins at nine o’clock.',
      verbForm: 'commence',
    },
    'Stem change: adds a cedilla "ç" before "o" or "a" to keep soft "s" sound (nous commençons).'
  ),
  buildErVerb(
    'regarder',
    'regarder',
    'to watch / look at',
    'A1',
    15,
    {
      fr: 'Tu regardes un film français ce soir ?',
      en: 'Are you watching a French movie tonight?',
      verbForm: 'regardes',
    },
    'Direct transitive verb: does not take a preposition ("regarder un film", not "regarder à un film").'
  ),
  buildErVerb(
    'ecouter',
    'écouter',
    'to listen to',
    'A1',
    16,
    {
      fr: 'J’écoute de la musique classique pour me détendre.',
      en: 'I listen to classical music to relax.',
      verbForm: 'écoute',
    },
    'Takes direct object in French: écouter la radio (to listen TO the radio).'
  ),
  buildErVerb(
    'donner',
    'donner',
    'to give',
    'A1',
    17,
    {
      fr: 'Il donne de bons conseils à ses étudiants.',
      en: 'He gives good advice to his students.',
      verbForm: 'donne',
    },
    'Follows regular -er conjugation. Construction: donner quelque chose à quelqu’un.'
  ),
  buildErVerb(
    'trouver',
    'trouver',
    'to find / consider',
    'A1',
    18,
    {
      fr: 'Je trouve cette ville absolument magnifique.',
      en: 'I find this city absolutely beautiful.',
      verbForm: 'trouve',
    },
    'Often used idiomatically to express opinions: "Comment trouvez-vous... ?" (How do you find... ?)'
  ),
  buildErVerb(
    'travailler',
    'travailler',
    'to work',
    'A1',
    19,
    {
      fr: 'Elle travaille dans une grande entreprise internationale.',
      en: 'She works in a large international company.',
      verbForm: 'travaille',
    },
    'Pronounced with liquid [j] sound (tra-va-ye).'
  ),
  buildErVerb(
    'chercher',
    'chercher',
    'to look for / seek',
    'A1',
    20,
    {
      fr: 'Que cherchez-vous dans ce tiroir ?',
      en: 'What are you looking for in this drawer?',
      verbForm: 'cherchez',
    },
    'Direct object without preposition "for": chercher un emploi (to look FOR a job).'
  ),
  buildErVerb(
    'penser',
    'penser',
    'to think',
    'A1',
    21,
    {
      fr: 'Je pense que tu as tout à fait raison.',
      en: 'I think that you are completely right.',
      verbForm: 'pense',
    },
    'Penser à (to think about someone/something) vs Penser de (to have an opinion of).'
  ),
  buildErVerb(
    'demander',
    'demander',
    'to ask / request',
    'A1',
    22,
    {
      fr: 'Ils demandent l’addition au serveur.',
      en: 'They ask the waiter for the bill.',
      verbForm: 'demandent',
    },
    'False friend warning: demander means "to ask", NOT "to demand" (which is exiger).'
  ),
];

// Regular 2nd group (-ir) verbs
const IR_VERBS: Verb[] = [
  buildIrRegularVerb(
    'finir',
    'finir',
    'to finish / end',
    'A1',
    23,
    {
      fr: 'Nous finissons notre projet cet après-midi.',
      en: 'We are finishing our project this afternoon.',
      verbForm: 'finissons',
    },
    'Archetype of the 2nd group: characterized by "-iss-" in plural forms (nous finissons, vous finissez).'
  ),
  buildIrRegularVerb(
    'choisir',
    'choisir',
    'to choose / select',
    'A1',
    24,
    {
      fr: 'Tu choisis quel plat sur le menu ?',
      en: 'Which dish are you choosing from the menu?',
      verbForm: 'choisis',
    },
    'Regular 2nd group with "-iss-" infix: nous choisissons, ils choisissent.'
  ),
  buildIrRegularVerb(
    'reussir',
    'réussir',
    'to succeed / pass (an exam)',
    'A2',
    25,
    {
      fr: 'Elle réussit toujours tous ses examens avec brio.',
      en: 'She always passes all her exams with flying colors.',
      verbForm: 'réussit',
    },
    'Use "réussir à + infinitive" for managing to do something.'
  ),
  buildIrRegularVerb(
    'reflechir',
    'réfléchir',
    'to reflect / think over',
    'A2',
    26,
    {
      fr: 'Laissez-moi réfléchir un instant à votre proposition.',
      en: 'Let me think for a moment about your proposal.',
      verbForm: 'réfléchir',
    },
    'Usually paired with preposition "à": réfléchir à une question.'
  ),
  buildIrRegularVerb(
    'grandir',
    'grandir',
    'to grow / grow up',
    'A2',
    27,
    {
      fr: 'Les enfants grandissent si vite !',
      en: 'Children grow up so fast!',
      verbForm: 'grandissent',
    },
    'Regular 2nd group derived from adjective "grand".'
  ),
];

// Additional 3rd group irregular verbs
const ADDITIONAL_IRREGULARS: Verb[] = [
  {
    id: 'devoir',
    infinitive: 'devoir',
    english: 'to have to / must / owe',
    group: 3,
    auxiliary: 'avoir',
    regular: false,
    level: 'A1',
    frequencyRank: 28,
    pastParticiple: 'dû',
    presentParticiple: 'devant',
    tip: 'Circumflex on masculine past participle: dû (to distinguish from preposition du). Conditionnel "devrais" expresses "should".',
    example: {
      fr: 'Vous devriez vous reposer un peu.',
      en: 'You should rest a little.',
      verbForm: 'devriez',
    },
    conjugations: {
      present: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je dois', stem: 'doi', ending: 's' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu dois', stem: 'doi', ending: 's' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il doit', stem: 'doi', ending: 't' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous devons', stem: 'dev', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous devez', stem: 'dev', ending: 'ez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils doivent', stem: 'doiv', ending: 'ent' },
      ],
      imparfait: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je devais', stem: 'dev', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu devais', stem: 'dev', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il devait', stem: 'dev', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous devions', stem: 'dev', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous deviez', stem: 'dev', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils devaient', stem: 'dev', ending: 'aient' },
      ],
      passeCompose: [
        { pronoun: "j'", pronounDisplay: "j'", form: "j'ai dû", stem: 'ai', ending: 'dû' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu as dû', stem: 'as', ending: 'dû' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il a dû', stem: 'a', ending: 'dû' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous avons dû', stem: 'avons', ending: 'dû' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous avez dû', stem: 'avez', ending: 'dû' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils ont dû', stem: 'ont', ending: 'dû' },
      ],
      futurSimple: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je devrai', stem: 'devr', ending: 'ai' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu devras', stem: 'devr', ending: 'as' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il devra', stem: 'devr', ending: 'a' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous devrons', stem: 'devr', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous devrez', stem: 'devr', ending: 'ez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils devront', stem: 'devr', ending: 'ont' },
      ],
      conditionnel: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je devrais', stem: 'devr', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu devrais', stem: 'devr', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il devrait', stem: 'devr', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous devrions', stem: 'devr', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous devriez', stem: 'devr', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils devraient', stem: 'devr', ending: 'aient' },
      ],
      subjonctif: [
        { pronoun: 'que je', pronounDisplay: 'que je', form: 'que je doive', stem: 'doiv', ending: 'e' },
        { pronoun: 'que tu', pronounDisplay: 'que tu', form: 'que tu doives', stem: 'doiv', ending: 'es' },
        { pronoun: "qu'il", pronounDisplay: "qu'il / elle", form: "qu'il doive", stem: 'doiv', ending: 'e' },
        { pronoun: 'que nous', pronounDisplay: 'que nous', form: 'que nous devions', stem: 'dev', ending: 'ions' },
        { pronoun: 'que vous', pronounDisplay: 'que vous', form: 'que vous deviez', stem: 'dev', ending: 'iez' },
        { pronoun: "qu'ils", pronounDisplay: "qu'ils / elles", form: "qu'ils doivent", stem: 'doiv', ending: 'ent' },
      ],
      imperatif: [
        { pronoun: 'tu', pronounDisplay: '(tu)', form: 'dois', stem: 'doi', ending: 's' },
        { pronoun: 'nous', pronounDisplay: '(nous)', form: 'devons', stem: 'dev', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: '(vous)', form: 'devez', stem: 'dev', ending: 'ez' },
      ],
    },
  },
  {
    id: 'voir',
    infinitive: 'voir',
    english: 'to see',
    group: 3,
    auxiliary: 'avoir',
    regular: false,
    level: 'A1',
    frequencyRank: 29,
    pastParticiple: 'vu',
    presentParticiple: 'voyant',
    tip: 'Future/conditional stem has double "rr": je verrai, je verrais.',
    example: {
      fr: 'Je vois la tour Eiffel depuis ma fenêtre.',
      en: 'I see the Eiffel Tower from my window.',
      verbForm: 'vois',
    },
    conjugations: {
      present: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je vois', stem: 'voi', ending: 's' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu vois', stem: 'voi', ending: 's' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il voit', stem: 'voi', ending: 't' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous voyons', stem: 'voy', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous voyez', stem: 'voy', ending: 'ez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils voient', stem: 'voi', ending: 'ent' },
      ],
      imparfait: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je voyais', stem: 'voy', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu voyais', stem: 'voy', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il voyait', stem: 'voy', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous voyions', stem: 'voy', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous voyiez', stem: 'voy', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils voyaient', stem: 'voy', ending: 'aient' },
      ],
      passeCompose: [
        { pronoun: "j'", pronounDisplay: "j'", form: "j'ai vu", stem: 'ai', ending: 'vu' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu as vu', stem: 'as', ending: 'vu' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il a vu', stem: 'a', ending: 'vu' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous avons vu', stem: 'avons', ending: 'vu' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous avez vu', stem: 'avez', ending: 'vu' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils ont vu', stem: 'ont', ending: 'vu' },
      ],
      futurSimple: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je verrai', stem: 'verr', ending: 'ai' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu verras', stem: 'verr', ending: 'as' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il verra', stem: 'verr', ending: 'a' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous verrons', stem: 'verr', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous verrez', stem: 'verr', ending: 'ez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils verront', stem: 'verr', ending: 'ont' },
      ],
      conditionnel: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je verrais', stem: 'verr', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu verrais', stem: 'verr', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il verrait', stem: 'verr', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous verrions', stem: 'verr', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous verriez', stem: 'verr', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils verraient', stem: 'verr', ending: 'aient' },
      ],
      subjonctif: [
        { pronoun: 'que je', pronounDisplay: 'que je', form: 'que je voie', stem: 'voi', ending: 'e' },
        { pronoun: 'que tu', pronounDisplay: 'que tu', form: 'que tu voies', stem: 'voi', ending: 'es' },
        { pronoun: "qu'il", pronounDisplay: "qu'il / elle", form: "qu'il voie", stem: 'voi', ending: 'e' },
        { pronoun: 'que nous', pronounDisplay: 'que nous', form: 'que nous voyions', stem: 'voy', ending: 'ions' },
        { pronoun: 'que vous', pronounDisplay: 'que vous', form: 'que vous voyiez', stem: 'voy', ending: 'iez' },
        { pronoun: "qu'ils", pronounDisplay: "qu'ils / elles", form: "qu'ils voient", stem: 'voi', ending: 'ent' },
      ],
      imperatif: [
        { pronoun: 'tu', pronounDisplay: '(tu)', form: 'vois', stem: 'voi', ending: 's' },
        { pronoun: 'nous', pronounDisplay: '(nous)', form: 'voyons', stem: 'voy', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: '(vous)', form: 'voyez', stem: 'voy', ending: 'ez' },
      ],
    },
  },
  {
    id: 'dire',
    infinitive: 'dire',
    english: 'to say / tell',
    group: 3,
    auxiliary: 'avoir',
    regular: false,
    level: 'A1',
    frequencyRank: 30,
    pastParticiple: 'dit',
    presentParticiple: 'disant',
    tip: 'Irregular "vous dites" (one of only three verbs ending in -tes in vous form, along with être and faire).',
    example: {
      fr: 'Qu’est-ce que vous dites ?',
      en: 'What are you saying?',
      verbForm: 'dites',
    },
    conjugations: {
      present: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je dis', stem: 'di', ending: 's' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu dis', stem: 'di', ending: 's' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il dit', stem: 'di', ending: 't' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous disons', stem: 'dis', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous dites', stem: 'di', ending: 'tes' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils disent', stem: 'dis', ending: 'ent' },
      ],
      imparfait: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je disais', stem: 'dis', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu disais', stem: 'dis', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il disait', stem: 'dis', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous disions', stem: 'dis', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous disiez', stem: 'dis', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils disaient', stem: 'dis', ending: 'aient' },
      ],
      passeCompose: [
        { pronoun: "j'", pronounDisplay: "j'", form: "j'ai dit", stem: 'ai', ending: 'dit' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu as dit', stem: 'as', ending: 'dit' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il a dit', stem: 'a', ending: 'dit' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous avons dit', stem: 'avons', ending: 'dit' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous avez dit', stem: 'avez', ending: 'dit' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils ont dit', stem: 'ont', ending: 'dit' },
      ],
      futurSimple: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je dirai', stem: 'dir', ending: 'ai' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu diras', stem: 'dir', ending: 'as' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il dira', stem: 'dir', ending: 'a' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous dirons', stem: 'dir', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous direz', stem: 'dir', ending: 'ez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils diront', stem: 'dir', ending: 'ont' },
      ],
      conditionnel: [
        { pronoun: 'je', pronounDisplay: 'je', form: 'je dirais', stem: 'dir', ending: 'ais' },
        { pronoun: 'tu', pronounDisplay: 'tu', form: 'tu dirais', stem: 'dir', ending: 'ais' },
        { pronoun: 'il', pronounDisplay: 'il / elle / on', form: 'il dirait', stem: 'dir', ending: 'ait' },
        { pronoun: 'nous', pronounDisplay: 'nous', form: 'nous dirions', stem: 'dir', ending: 'ions' },
        { pronoun: 'vous', pronounDisplay: 'vous', form: 'vous diriez', stem: 'dir', ending: 'iez' },
        { pronoun: 'ils', pronounDisplay: 'ils / elles', form: 'ils diraient', stem: 'dir', ending: 'aient' },
      ],
      subjonctif: [
        { pronoun: 'que je', pronounDisplay: 'que je', form: 'que je dise', stem: 'dis', ending: 'e' },
        { pronoun: 'que tu', pronounDisplay: 'que tu', form: 'que tu dises', stem: 'dis', ending: 'es' },
        { pronoun: "qu'il", pronounDisplay: "qu'il / elle", form: "qu'il dise", stem: 'dis', ending: 'e' },
        { pronoun: 'que nous', pronounDisplay: 'que nous', form: 'que nous disions', stem: 'dis', ending: 'ions' },
        { pronoun: 'que vous', pronounDisplay: 'que vous', form: 'que vous disiez', stem: 'dis', ending: 'iez' },
        { pronoun: "qu'ils", pronounDisplay: "qu'ils / elles", form: "qu'ils disent", stem: 'dis', ending: 'ent' },
      ],
      imperatif: [
        { pronoun: 'tu', pronounDisplay: '(tu)', form: 'dis', stem: 'di', ending: 's' },
        { pronoun: 'nous', pronounDisplay: '(nous)', form: 'disons', stem: 'dis', ending: 'ons' },
        { pronoun: 'vous', pronounDisplay: '(vous)', form: 'dites', stem: 'di', ending: 'tes' },
      ],
    },
  },
];

export const ALL_VERBS: Verb[] = [
  ...IRREGULAR_VERBS,
  ...ADDITIONAL_IRREGULARS,
  ...ER_VERBS,
  ...IR_VERBS,
].sort((a, b) => a.frequencyRank - b.frequencyRank);

export const VERBS_BY_ID = new Map<string, Verb>(
  ALL_VERBS.map((verb) => [verb.id, verb])
);
