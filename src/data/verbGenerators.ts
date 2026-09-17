import { Verb, ConjugationForm, TenseId } from '../types';

const PRONOUNS = [
  { p: 'je', d: 'je' },
  { p: 'tu', d: 'tu' },
  { p: 'il', d: 'il / elle / on' },
  { p: 'nous', d: 'nous' },
  { p: 'vous', d: 'vous' },
  { p: 'ils', d: 'ils / elles' },
];

function startsWithVowel(word: string): boolean {
  return /^[aeiouhéèêëàâîïôûùœ]/i.test(word);
}

// Helper to build 1st group (-er) conjugations programmatically
export function buildErVerb(
  id: string,
  infinitive: string,
  english: string,
  level: 'A1' | 'A2' | 'B1',
  frequencyRank: number,
  example: { fr: string; en: string; verbForm: string },
  tip?: string
): Verb {
  const stem = infinitive.slice(0, -2);
  const j = startsWithVowel(infinitive) ? "j'" : "je";

  const present: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${stem}e`, stem, ending: 'e' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${stem}es`, stem, ending: 'es' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${stem}e`, stem, ending: 'e' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${stem}ons`, stem, ending: 'ons' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${stem}ez`, stem, ending: 'ez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${stem}ent`, stem, ending: 'ent' },
  ];

  const imparfait: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${stem}ais`, stem, ending: 'ais' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${stem}ais`, stem, ending: 'ais' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${stem}ait`, stem, ending: 'ait' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${stem}ions`, stem, ending: 'ions' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${stem}iez`, stem, ending: 'iez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${stem}aient`, stem, ending: 'aient' },
  ];

  const pp = `${stem}é`;
  const passeCompose: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `j'ai ${pp}`, stem: 'ai', ending: pp },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu as ${pp}`, stem: 'as', ending: pp },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il a ${pp}`, stem: 'a', ending: pp },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous avons ${pp}`, stem: 'avons', ending: pp },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous avez ${pp}`, stem: 'avez', ending: pp },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ont ${pp}`, stem: 'ont', ending: pp },
  ];

  const futurSimple: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${infinitive}ai`, stem: infinitive, ending: 'ai' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${infinitive}as`, stem: infinitive, ending: 'as' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${infinitive}a`, stem: infinitive, ending: 'a' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${infinitive}ons`, stem: infinitive, ending: 'ons' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${infinitive}ez`, stem: infinitive, ending: 'ez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${infinitive}ont`, stem: infinitive, ending: 'ont' },
  ];

  const conditionnel: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${infinitive}ais`, stem: infinitive, ending: 'ais' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${infinitive}ais`, stem: infinitive, ending: 'ais' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${infinitive}ait`, stem: infinitive, ending: 'ait' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${infinitive}ions`, stem: infinitive, ending: 'ions' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${infinitive}iez`, stem: infinitive, ending: 'iez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${infinitive}aient`, stem: infinitive, ending: 'aient' },
  ];

  const subjonctif: ConjugationForm[] = [
    { pronoun: 'que je', pronounDisplay: "que je / j'", form: `que ${j === "j'" ? "j'" : "je "}${stem}e`, stem, ending: 'e' },
    { pronoun: 'que tu', pronounDisplay: 'que tu', form: `que tu ${stem}es`, stem, ending: 'es' },
    { pronoun: "qu'il", pronounDisplay: "qu'il / elle", form: `qu'il ${stem}e`, stem, ending: 'e' },
    { pronoun: 'que nous', pronounDisplay: 'que nous', form: `que nous ${stem}ions`, stem, ending: 'ions' },
    { pronoun: 'que vous', pronounDisplay: 'que vous', form: `que vous ${stem}iez`, stem, ending: 'iez' },
    { pronoun: "qu'ils", pronounDisplay: "qu'ils / elles", form: `qu'ils ${stem}ent`, stem, ending: 'ent' },
  ];

  const imperatif: ConjugationForm[] = [
    { pronoun: 'tu', pronounDisplay: '(tu)', form: `${stem}e`, stem, ending: 'e' },
    { pronoun: 'nous', pronounDisplay: '(nous)', form: `${stem}ons`, stem, ending: 'ons' },
    { pronoun: 'vous', pronounDisplay: '(vous)', form: `${stem}ez`, stem, ending: 'ez' },
  ];

  return {
    id,
    infinitive,
    english,
    group: 1,
    auxiliary: 'avoir',
    regular: true,
    level,
    frequencyRank,
    pastParticiple: pp,
    presentParticiple: `${stem}ant`,
    conjugations: {
      present,
      imparfait,
      passeCompose,
      futurSimple,
      conditionnel,
      subjonctif,
      imperatif,
    },
    example,
    tip: tip || 'Regular 1st group (-er) verb. Drop -er to find the stem.',
  };
}

// Helper to build 2nd group (-ir regular) conjugations programmatically
export function buildIrRegularVerb(
  id: string,
  infinitive: string,
  english: string,
  level: 'A1' | 'A2' | 'B1',
  frequencyRank: number,
  example: { fr: string; en: string; verbForm: string },
  tip?: string
): Verb {
  const stem = infinitive.slice(0, -2);
  const j = startsWithVowel(infinitive) ? "j'" : "je";

  const present: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${stem}is`, stem, ending: 'is' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${stem}is`, stem, ending: 'is' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${stem}it`, stem, ending: 'it' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${stem}issons`, stem, ending: 'issons' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${stem}issez`, stem, ending: 'issez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${stem}issent`, stem, ending: 'issent' },
  ];

  const imparfait: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${stem}issais`, stem, ending: 'issais' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${stem}issais`, stem, ending: 'issais' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${stem}issait`, stem, ending: 'issait' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${stem}issions`, stem, ending: 'issions' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${stem}issiez`, stem, ending: 'issiez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${stem}issaient`, stem, ending: 'issaient' },
  ];

  const pp = `${stem}i`;
  const passeCompose: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `j'ai ${pp}`, stem: 'ai', ending: pp },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu as ${pp}`, stem: 'as', ending: pp },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il a ${pp}`, stem: 'a', ending: pp },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous avons ${pp}`, stem: 'avons', ending: pp },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous avez ${pp}`, stem: 'avez', ending: pp },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ont ${pp}`, stem: 'ont', ending: pp },
  ];

  const futurSimple: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${infinitive}ai`, stem: infinitive, ending: 'ai' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${infinitive}as`, stem: infinitive, ending: 'as' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${infinitive}a`, stem: infinitive, ending: 'a' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${infinitive}ons`, stem: infinitive, ending: 'ons' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${infinitive}ez`, stem: infinitive, ending: 'ez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${infinitive}ont`, stem: infinitive, ending: 'ont' },
  ];

  const conditionnel: ConjugationForm[] = [
    { pronoun: j, pronounDisplay: j, form: `${j === "j'" ? "j'" : "je "}${infinitive}ais`, stem: infinitive, ending: 'ais' },
    { pronoun: 'tu', pronounDisplay: 'tu', form: `tu ${infinitive}ais`, stem: infinitive, ending: 'ais' },
    { pronoun: 'il', pronounDisplay: 'il / elle / on', form: `il ${infinitive}ait`, stem: infinitive, ending: 'ait' },
    { pronoun: 'nous', pronounDisplay: 'nous', form: `nous ${infinitive}ions`, stem: infinitive, ending: 'ions' },
    { pronoun: 'vous', pronounDisplay: 'vous', form: `vous ${infinitive}iez`, stem: infinitive, ending: 'iez' },
    { pronoun: 'ils', pronounDisplay: 'ils / elles', form: `ils ${infinitive}aient`, stem: infinitive, ending: 'aient' },
  ];

  const subjonctif: ConjugationForm[] = [
    { pronoun: 'que je', pronounDisplay: "que je / j'", form: `que ${j === "j'" ? "j'" : "je "}${stem}isse`, stem, ending: 'isse' },
    { pronoun: 'que tu', pronounDisplay: 'que tu', form: `que tu ${stem}isses`, stem, ending: 'isses' },
    { pronoun: "qu'il", pronounDisplay: "qu'il / elle", form: `qu'il ${stem}isse`, stem, ending: 'isse' },
    { pronoun: 'que nous', pronounDisplay: 'que nous', form: `que nous ${stem}issions`, stem, ending: 'issions' },
    { pronoun: 'que vous', pronounDisplay: 'que vous', form: `que vous ${stem}issiez`, stem, ending: 'issiez' },
    { pronoun: "qu'ils", pronounDisplay: "qu'ils / elles", form: `qu'ils ${stem}issent`, stem, ending: 'issent' },
  ];

  const imperatif: ConjugationForm[] = [
    { pronoun: 'tu', pronounDisplay: '(tu)', form: `${stem}is`, stem, ending: 'is' },
    { pronoun: 'nous', pronounDisplay: '(nous)', form: `${stem}issons`, stem, ending: 'issons' },
    { pronoun: 'vous', pronounDisplay: '(vous)', form: `${stem}issez`, stem, ending: 'issez' },
  ];

  return {
    id,
    infinitive,
    english,
    group: 2,
    auxiliary: 'avoir',
    regular: true,
    level,
    frequencyRank,
    pastParticiple: pp,
    presentParticiple: `${stem}issant`,
    conjugations: {
      present,
      imparfait,
      passeCompose,
      futurSimple,
      conditionnel,
      subjonctif,
      imperatif,
    },
    example,
    tip: tip || 'Regular 2nd group (-ir) verb with "-iss-" infix in plural forms.',
  };
}
