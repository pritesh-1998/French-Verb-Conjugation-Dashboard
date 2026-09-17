export interface RuleSection {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  tableHeaders: string[];
  tableRows: { label: string; cells: string[]; note?: string }[];
  keyTakeaway: string;
}

export const GRAMMAR_RULES: RuleSection[] = [
  {
    id: 'regular-er',
    title: '1st Group (-ER) Regular Conjugation',
    subtitle: 'Over 80% of all French verbs (parler, aimer, regarder)',
    badge: '1er Groupe',
    summary:
      'Remove the -er ending to obtain the radical (stem), then add the regular endings according to the grammatical person.',
    tableHeaders: ['Tense', 'Je / J’', 'Tu', 'Il / Elle / On', 'Nous', 'Vous', 'Ils / Elles'],
    tableRows: [
      {
        label: 'Présent',
        cells: ['-e', '-es', '-e', '-ons', '-ez', '-ent (silent)'],
        note: 'Silent endings: -e, -es, -e, -ent are pronounced identically!',
      },
      {
        label: 'Imparfait',
        cells: ['-ais', '-ais', '-ait', '-ions', '-iez', '-aient'],
        note: 'The -ais, -ait, -aient are all pronounced [ɛ].',
      },
      {
        label: 'Passé Composé',
        cells: ['ai -é', 'as -é', 'a -é', 'avons -é', 'avez -é', 'ont -é'],
        note: 'Auxiliary avoir + past participle ending in -é (e.g., parlé).',
      },
      {
        label: 'Futur Simple',
        cells: ['-erai', '-eras', '-era', '-erons', '-erez', '-eront'],
        note: 'Infinitive + avoir endings (-ai, -as, -a, -ons, -ez, -ont).',
      },
      {
        label: 'Conditionnel',
        cells: ['-erais', '-erais', '-erait', '-erions', '-eriez', '-eraient'],
        note: 'Future stem + Imperfect endings.',
      },
      {
        label: 'Subjonctif',
        cells: ['-e', '-es', '-e', '-ions', '-iez', '-ent'],
        note: 'Triggered after expressions of obligation, doubt, desire (il faut que...).',
      },
    ],
    keyTakeaway:
      'Spelling nuances: Verbs ending in -ger add an "e" before "a/o" (mangeons). Verbs in -cer take a cedilla "ç" before "a/o" (commençons).',
  },
  {
    id: 'regular-ir',
    title: '2nd Group (-IR) Regular Conjugation',
    subtitle: 'Verbs featuring the "-iss-" infix (finir, choisir, réussir)',
    badge: '2ème Groupe',
    summary:
      'Recognized by their present participle ending in "-issant" and the plural forms carrying "-iss-".',
    tableHeaders: ['Tense', 'Je', 'Tu', 'Il / Elle / On', 'Nous', 'Vous', 'Ils / Elles'],
    tableRows: [
      {
        label: 'Présent',
        cells: ['-is', '-is', '-it', '-issons', '-issez', '-issent'],
        note: 'Singular: -is, -is, -it. Plural adds the famous -iss- sound.',
      },
      {
        label: 'Imparfait',
        cells: ['-issais', '-issais', '-issait', '-issions', '-issiez', '-issaient'],
        note: 'All imperfect forms carry -iss-.',
      },
      {
        label: 'Passé Composé',
        cells: ['ai -i', 'as -i', 'a -i', 'avons -i', 'avez -i', 'ont -i'],
        note: 'Past participle ends in -i (fini, choisi, réussi).',
      },
      {
        label: 'Futur Simple',
        cells: ['-irai', '-iras', '-ira', '-irons', '-irez', '-iront'],
        note: 'Full infinitive + future endings.',
      },
      {
        label: 'Conditionnel',
        cells: ['-irais', '-irais', '-irait', '-irions', '-iriez', '-iraient'],
        note: 'Full infinitive + imperfect endings.',
      },
    ],
    keyTakeaway:
      'Warning: Not all -ir verbs belong to the 2nd group! Verbs like partir, sortir, venir are 3rd group irregulars (partant, not partissant).',
  },
  {
    id: 'auxiliary-etre',
    title: 'Passé Composé: Avoir vs. Être',
    subtitle: 'The 17 movement/change verbs + All reflexive verbs',
    badge: 'Auxiliaires',
    summary:
      'Most verbs take AVOIR. But verbs of movement/state change take ÊTRE and REQUIRE agreement with the grammatical subject in gender and number!',
    tableHeaders: ['Letter', 'Verb (Infinitive)', 'Past Participle', 'English Meaning', 'Example Agreement'],
    tableRows: [
      { label: 'D', cells: ['Devenir', 'devenu(e)(s)', 'To become', 'Elle est devenue médecin.'] },
      { label: 'R', cells: ['Revenir', 'revenu(e)(s)', 'To come back', 'Ils sont revenus hier.'] },
      { label: 'M', cells: ['Monter', 'monté(e)(s)', 'To go up / climb', 'Elle est montée au sommet.'] },
      { label: 'R', cells: ['Rester', 'resté(e)(s)', 'To stay / remain', 'Nous sommes restés chez nous.'] },
      { label: 'S', cells: ['Sortir', 'sorti(e)(s)', 'To go out', 'Elles sont sorties ensemble.'] },
      { label: 'V', cells: ['Venir', 'venu(e)(s)', 'To come', 'Elle est venue en train.'] },
      { label: 'A', cells: ['Aller', 'allé(e)(s)', 'To go', 'Elles sont allées au cinéma.'] },
      { label: 'N', cells: ['Naître', 'né(e)(s)', 'To be born', 'Il est né en France.'] },
      { label: 'D', cells: ['Descendre', 'descendu(e)(s)', 'To go down', 'Ils sont descendus du bus.'] },
      { label: 'E', cells: ['Entrer', 'entré(e)(s)', 'To enter', 'Elle est entrée dans la pièce.'] },
      { label: 'R', cells: ['Rentrer', 'rentré(e)(s)', 'To return home', 'Je suis rentrée tard.'] },
      { label: 'T', cells: ['Tomber', 'tombé(e)(s)', 'To fall', 'La feuille est tombée.'] },
      { label: 'R', cells: ['Retourner', 'retourné(e)(s)', 'To return (turn back)', 'Il est retourné là-bas.'] },
      { label: 'A', cells: ['Arriver', 'arrivé(e)(s)', 'To arrive', 'Le train est arrivé.'] },
      { label: 'M', cells: ['Mourir', 'mort(e)(s)', 'To die', 'L’auteur est mort en 1900.'] },
      { label: 'P', cells: ['Partir', 'parti(e)(s)', 'To leave', 'Elle est partie tôt.'] },
      { label: 'P', cells: ['Passer (par)', 'passé(e)(s)', 'To pass by', 'Nous sommes passés par Paris.'] },
    ],
    keyTakeaway:
      'Mnemonic: Remember "DR & MRS VANDERTRAMP". When conjugated with ÊTRE, always add -e for feminine and -s for plural!',
  },
  {
    id: 'subjunctive-rules',
    title: 'Subjonctif Présent: Triggers & Formation',
    subtitle: 'The mood of subjectivity, necessity, emotion, and doubt',
    badge: 'Mode Subjonctif',
    summary:
      'Formed from the 3rd person plural (ils) present stem + endings: -e, -es, -e, -ions, -iez, -ent. Used whenever the main clause expresses WEIRD: Wishes, Emotions, Impersonal statements, Requests, or Doubt.',
    tableHeaders: ['Trigger Category', 'French Structure', 'English Meaning', 'Subjunctive Example'],
    tableRows: [
      { label: 'Necessity', cells: ['Il faut que...', 'It is necessary that...', 'Il faut que tu fasses tes devoirs.'] },
      { label: 'Wish / Desire', cells: ['Je veux que...', 'I want that...', 'Je veux que vous veniez demain.'] },
      { label: 'Emotion', cells: ['Je suis content que...', 'I am happy that...', 'Je suis ravi que tu sois là.'] },
      { label: 'Doubt', cells: ['Je doute que...', 'I doubt that...', 'Je doute qu’il vienne ce soir.'] },
      { label: 'Possibility', cells: ['Il est possible que...', 'It is possible that...', 'Il est possible qu’il pleuve.'] },
      { label: 'Fear', cells: ['J’ai peur que...', 'I am afraid that...', 'J’ai peur qu’il ne sache pas la vérité.'] },
    ],
    keyTakeaway:
      'Notice: verbs of certainty (Je pense que, Je sais que, Il est certain que) use the INDICATIVE, not the subjunctive!',
  },
];
