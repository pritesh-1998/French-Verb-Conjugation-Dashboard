import { TenseId, TenseMeta } from '../types';

export const TENSES: TenseMeta[] = [
  {
    id: 'present',
    nameFr: 'Présent',
    nameEn: 'Present Tense',
    description: 'Ongoing actions, habitual facts, and immediate universal truths.',
    formula: 'Stem + regular group endings (-e/-is/-s)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'passeCompose',
    nameFr: 'Passé Composé',
    nameEn: 'Compound Past',
    description: 'Completed actions in the past with defined start and end points.',
    formula: 'Auxiliary (avoir/être) + Past Participle',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'imparfait',
    nameFr: 'Imparfait',
    nameEn: 'Imperfect',
    description: 'Past habits, background descriptions, weather, and ongoing past actions.',
    formula: 'Nous stem of present + -ais, -ais, -ait, -ions, -iez, -aient',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'futurSimple',
    nameFr: 'Futur Simple',
    nameEn: 'Simple Future',
    description: 'Actions that will happen, plans, predictions, and conditions.',
    formula: 'Infinitive (or irregular root) + -ai, -as, -a, -ons, -ez, -ont',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'conditionnel',
    nameFr: 'Conditionnel Présent',
    nameEn: 'Conditional',
    description: 'Hypotheticals, polite requests, desires, and advice ("would/could").',
    formula: 'Future stem + Imperfect endings (-ais, -ions, etc.)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'subjonctif',
    nameFr: 'Subjonctif Présent',
    nameEn: 'Present Subjunctive',
    description: 'Necessity, doubt, emotion, will, and desire after "que".',
    formula: 'Ils stem of present + -e, -es, -e, -ions, -iez, -ent',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'imperatif',
    nameFr: 'Impératif',
    nameEn: 'Imperative',
    description: 'Direct commands, requests, and instructions for tu, nous, and vous.',
    formula: 'Present without pronouns (drop -s for tu in -er verbs)',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
  },
];

export const TENSE_MAP = new Map<TenseId, TenseMeta>(
  TENSES.map((tense) => [tense.id, tense])
);
