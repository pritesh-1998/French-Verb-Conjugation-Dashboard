export type TenseId =
  | 'present'
  | 'imparfait'
  | 'passeCompose'
  | 'futurSimple'
  | 'conditionnel'
  | 'subjonctif'
  | 'imperatif';

export type VerbGroup = 1 | 2 | 3;
export type AuxiliaryVerb = 'avoir' | 'être';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface ConjugationForm {
  pronoun: string; // e.g. "je" or "j'"
  pronounDisplay: string; // e.g. "je" / "il / elle / on"
  form: string; // e.g. "parle", "suis", "ai parlé"
  stem?: string; // e.g. "parl"
  ending?: string; // e.g. "e"
}

export interface Verb {
  id: string;
  infinitive: string;
  english: string;
  group: VerbGroup;
  auxiliary: AuxiliaryVerb;
  regular: boolean;
  level: CEFRLevel;
  frequencyRank: number;
  pastParticiple: string;
  presentParticiple: string;
  conjugations: Record<TenseId, ConjugationForm[]>;
  example: {
    fr: string;
    en: string;
    verbForm: string;
  };
  tip?: string;
  commonPreposition?: string; // e.g. "parler à / de", "commencer à"
}

export interface TenseMeta {
  id: TenseId;
  nameFr: string;
  nameEn: string;
  description: string;
  formula: string;
  badgeColor: string;
}

export interface VerbProgress {
  verbId: string;
  correct: number;
  incorrect: number;
  lastPracticed?: string;
  bookmarked?: boolean;
}

export interface UserStats {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalAnswered: number;
  totalCorrect: number;
  completedDrillCount: number;
}

export type QuizType = 'typing' | 'multiple-choice' | 'full-table' | 'match';

export type VerbPoolType =
  | 'all'
  | 'favorites'
  | 'group1'
  | 'group2'
  | 'group3'
  | 'custom'
  | 'library7000'
  | 'specific';

export interface QuizQuestion {
  id: string;
  verb: Verb;
  tenseId: TenseId;
  tenseName: string;
  pronoun: string;
  pronounDisplay: string;
  correctAnswer: string;
  options: string[];
  contextSentence?: {
    before: string;
    after: string;
    translation: string;
  };
}

export interface FullTableQuestion {
  id: string;
  verb: Verb;
  tenseId: TenseId;
  tenseName: string;
  forms: ConjugationForm[];
}

export interface MatchPair {
  id: string;
  pronoun: string;
  pronounDisplay: string;
  conjugatedForm: string;
  audioText: string;
}

export interface MatchQuestion {
  id: string;
  verb: Verb;
  tenseId: TenseId;
  tenseName: string;
  pairs: MatchPair[];
}

export interface QuizResult {
  question: QuizQuestion | FullTableQuestion | MatchQuestion;
  userAnswer: string;
  isCorrect: boolean;
  verb: Verb;
  tenseName: string;
  details?: string;
}

export type ViewTab = 'dashboard' | 'library' | 'favorites' | 'quiz' | 'flashcards' | 'rules';
