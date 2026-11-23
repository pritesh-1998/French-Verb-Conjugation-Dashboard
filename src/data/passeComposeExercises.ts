export interface TimeSentence {
  timeMarker: string; // e.g. "Hier,", "Présentement,", "Demain,"
  subject: string; // e.g. "elle", "il", "André"
  verbForm: string; // e.g. "a regardé", "regarde", "va regarder"
  predicate: string; // e.g. "la télévision avec sa fille"
  fullSentence: string; // e.g. "Hier, elle a regardé la télévision avec sa fille."
}

export interface PasseComposeExercise {
  id: string;
  verbInfinitive: string;
  verbEnglish: string;
  auxiliary: 'avoir' | 'être';
  pastParticiple: string;
  category: 'worksheet-sample' | 'avoir-regular' | 'etre-movement' | 'irregular-participle' | 'reflexive';
  ruleTip: string; // Explaining why avoir/être or participle form
  
  // Three-time triad like the worksheet in the image
  past: TimeSentence;
  present: TimeSentence;
  futureProche: TimeSentence;

  // Single-sentence fill-in-the-blank drill
  fillInTheBlank: {
    promptSentence: string; // "Hier, elle [BLANK] (regarder) la télévision avec sa fille."
    beforeBlank: string; // "Hier, elle "
    verbInfinitiveHint: string; // "regarder"
    afterBlank: string; // " la télévision avec sa fille."
    correctAnswer: string; // "a regardé"
    acceptedAnswers: string[]; // ["a regardé", "a regarde"]
    explanation: string;
  };
}

export const PASSE_COMPOSE_EXERCISES: PasseComposeExercise[] = [
  // 1. From Worksheet Photo Item #1
  {
    id: 'ws-1',
    verbInfinitive: 'regarder',
    verbEnglish: 'to watch',
    auxiliary: 'avoir',
    pastParticiple: 'regardé',
    category: 'worksheet-sample',
    ruleTip: "Le verbe 'regarder' utilise l'auxiliaire 'avoir'. Participe passé régulier en -é.",
    past: {
      timeMarker: 'Hier',
      subject: 'elle',
      verbForm: 'a regardé',
      predicate: 'la télévision avec sa fille',
      fullSentence: 'Hier, elle a regardé la télévision avec sa fille.',
    },
    present: {
      timeMarker: 'Présentement',
      subject: 'elle',
      verbForm: 'regarde',
      predicate: 'la télévision avec sa fille',
      fullSentence: 'Présentement, elle regarde la télévision avec sa fille.',
    },
    futureProche: {
      timeMarker: 'Demain',
      subject: 'elle',
      verbForm: 'va regarder',
      predicate: 'la télévision avec sa fille',
      fullSentence: 'Demain, elle va regarder la télévision avec sa fille.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier, elle _____ (regarder) la télévision avec sa fille.',
      beforeBlank: 'Hier, elle ',
      verbInfinitiveHint: 'regarder',
      afterBlank: ' la télévision avec sa fille.',
      correctAnswer: 'a regardé',
      acceptedAnswers: ['a regardé', 'a regarde'],
      explanation: "Sujet 'elle' + auxiliaire 'a' (avoir au présent) + participe passé 'regardé'.",
    },
  },

  // 2. From Worksheet Photo Item #2
  {
    id: 'ws-2',
    verbInfinitive: 'téléphoner',
    verbEnglish: 'to call / phone',
    auxiliary: 'avoir',
    pastParticiple: 'téléphoné',
    category: 'worksheet-sample',
    ruleTip: "Le verbe 'téléphoner' utilise l'auxiliaire 'avoir'. Participe passé régulier en -é.",
    past: {
      timeMarker: 'Hier',
      subject: 'il',
      verbForm: 'a téléphoné',
      predicate: 'à la directrice de la garderie',
      fullSentence: 'Hier, il a téléphoné à la directrice de la garderie.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'il',
      verbForm: 'téléphone',
      predicate: 'à la directrice de la garderie',
      fullSentence: 'En ce moment, il téléphone à la directrice de la garderie.',
    },
    futureProche: {
      timeMarker: 'Demain',
      subject: 'il',
      verbForm: 'va téléphoner',
      predicate: 'à la directrice de la garderie',
      fullSentence: 'Demain, il va téléphoner à la directrice de la garderie.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier, il _____ (téléphoner) à la directrice de la garderie.',
      beforeBlank: 'Hier, il ',
      verbInfinitiveHint: 'téléphoner',
      afterBlank: ' à la directrice de la garderie.',
      correctAnswer: 'a téléphoné',
      acceptedAnswers: ['a téléphoné', 'a telephone'],
      explanation: "Sujet 'il' + auxiliaire 'a' (avoir) + participe passé 'téléphoné'.",
    },
  },

  // 3. From Worksheet Photo Item #3
  {
    id: 'ws-3',
    verbInfinitive: 'chercher',
    verbEnglish: 'to look for / search',
    auxiliary: 'avoir',
    pastParticiple: 'cherché',
    category: 'worksheet-sample',
    ruleTip: "Le verbe 'chercher' utilise l'auxiliaire 'avoir'. Avec 'vous', l'auxiliaire est 'avez'.",
    past: {
      timeMarker: 'La semaine passée',
      subject: 'vous',
      verbForm: 'avez cherché',
      predicate: 'un emploi',
      fullSentence: 'La semaine passée, vous avez cherché un emploi.',
    },
    present: {
      timeMarker: 'Présentement',
      subject: 'vous',
      verbForm: 'cherchez',
      predicate: 'un emploi',
      fullSentence: 'Présentement, vous cherchez un emploi.',
    },
    futureProche: {
      timeMarker: 'Le mois prochain',
      subject: 'vous',
      verbForm: 'allez chercher',
      predicate: 'un emploi',
      fullSentence: 'Le mois prochain, vous allez chercher un emploi.',
    },
    fillInTheBlank: {
      promptSentence: 'La semaine passée, vous _____ (chercher) un emploi.',
      beforeBlank: 'La semaine passée, vous ',
      verbInfinitiveHint: 'chercher',
      afterBlank: ' un emploi.',
      correctAnswer: 'avez cherché',
      acceptedAnswers: ['avez cherché', 'avez cherche'],
      explanation: "Sujet 'vous' + auxiliaire 'avez' (avoir au présent) + participe passé 'cherché'.",
    },
  },

  // 4. From Worksheet Photo Item #4
  {
    id: 'ws-4',
    verbInfinitive: 'arrêter',
    verbEnglish: 'to stop / quit',
    auxiliary: 'avoir',
    pastParticiple: 'arrêté',
    category: 'worksheet-sample',
    ruleTip: "Élision devant voyelle : 'je' devient 'j''. Auxiliaire 'ai' + 'arrêté'.",
    past: {
      timeMarker: "L'année passée",
      subject: "j'",
      verbForm: 'ai arrêté',
      predicate: 'de fumer',
      fullSentence: "L'année passée, j'ai arrêté de fumer.",
    },
    present: {
      timeMarker: 'Cette année',
      subject: "j'",
      verbForm: 'arrête',
      predicate: 'de fumer',
      fullSentence: "Cette année, j'arrête de fumer.",
    },
    futureProche: {
      timeMarker: "L'année prochaine",
      subject: 'je',
      verbForm: 'vais arrêter',
      predicate: 'de fumer',
      fullSentence: "L'année prochaine, je vais arrêter de fumer.",
    },
    fillInTheBlank: {
      promptSentence: "L'année passée, j' _____ (arrêter) de fumer.",
      beforeBlank: "L'année passée, j'",
      verbInfinitiveHint: 'arrêter',
      afterBlank: ' de fumer.',
      correctAnswer: 'ai arrêté',
      acceptedAnswers: ['ai arrêté', 'ai arrete', "j'ai arrêté", "j'ai arrete"],
      explanation: "Élision avec 'j'' + auxiliaire 'ai' (avoir) + participe passé 'arrêté'.",
    },
  },

  // 5. From Worksheet Photo Item #5
  {
    id: 'ws-5',
    verbInfinitive: 'arriver',
    verbEnglish: 'to arrive',
    auxiliary: 'être',
    pastParticiple: 'arrivé',
    category: 'worksheet-sample',
    ruleTip: "ATTENTION ÊTRE : 'arriver' est un verbe de mouvement (Maison d'Être). L'auxiliaire est 'être' !",
    past: {
      timeMarker: 'Hier',
      subject: 'il',
      verbForm: 'est arrivé',
      predicate: 'à dix heures',
      fullSentence: 'Hier, il est arrivé à dix heures.',
    },
    present: {
      timeMarker: "Aujourd'hui",
      subject: 'il',
      verbForm: 'arrive',
      predicate: 'à dix heures',
      fullSentence: "Aujourd'hui, il arrive à dix heures.",
    },
    futureProche: {
      timeMarker: 'Demain',
      subject: 'il',
      verbForm: 'va arriver',
      predicate: 'à dix heures',
      fullSentence: 'Demain, il va arriver à dix heures.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier, il _____ (arriver) à dix heures.',
      beforeBlank: 'Hier, il ',
      verbInfinitiveHint: 'arriver',
      afterBlank: ' à dix heures.',
      correctAnswer: 'est arrivé',
      acceptedAnswers: ['est arrivé', 'est arrive'],
      explanation: "Le verbe 'arriver' se conjugue avec ÊTRE ! 'il' + 'est' + participe 'arrivé'.",
    },
  },

  // 6. From Worksheet Photo Item #6
  {
    id: 'ws-6',
    verbInfinitive: 'manger',
    verbEnglish: 'to eat',
    auxiliary: 'avoir',
    pastParticiple: 'mangé',
    category: 'worksheet-sample',
    ruleTip: "Le verbe 'manger' utilise l'auxiliaire 'avoir'. Avec 'je', on écrit 'j'ai mangé'.",
    past: {
      timeMarker: 'Hier midi',
      subject: "j'",
      verbForm: 'ai mangé',
      predicate: 'au restaurant',
      fullSentence: "Hier midi, j'ai mangé au restaurant.",
    },
    present: {
      timeMarker: 'Ce midi',
      subject: 'je',
      verbForm: 'mange',
      predicate: 'au restaurant',
      fullSentence: 'Ce midi, je mange au restaurant.',
    },
    futureProche: {
      timeMarker: 'Demain midi',
      subject: 'je',
      verbForm: 'vais manger',
      predicate: 'au restaurant',
      fullSentence: 'Demain midi, je vais manger au restaurant.',
    },
    fillInTheBlank: {
      promptSentence: "Hier midi, j' _____ (manger) au restaurant.",
      beforeBlank: "Hier midi, j'",
      verbInfinitiveHint: 'manger',
      afterBlank: ' au restaurant.',
      correctAnswer: 'ai mangé',
      acceptedAnswers: ['ai mangé', 'ai mange', "j'ai mangé", "j'ai mange"],
      explanation: "Sujet 'j'' + auxiliaire 'ai' (avoir) + participe passé régulier 'mangé'.",
    },
  },

  // 7. From Worksheet Photo Item #7
  {
    id: 'ws-7',
    verbInfinitive: 'rester',
    verbEnglish: 'to stay',
    auxiliary: 'être',
    pastParticiple: 'resté',
    category: 'worksheet-sample',
    ruleTip: "ATTENTION ÊTRE : 'rester' fait partie des 14 verbes de la Maison d'Être (Dr & Mrs Vandertramp).",
    past: {
      timeMarker: 'Hier',
      subject: 'André',
      verbForm: 'est resté',
      predicate: 'à la maison',
      fullSentence: 'Hier, André est resté à la maison.',
    },
    present: {
      timeMarker: "Aujourd'hui",
      subject: 'André',
      verbForm: 'reste',
      predicate: 'à la maison',
      fullSentence: "Aujourd'hui, André reste à la maison.",
    },
    futureProche: {
      timeMarker: 'Demain',
      subject: 'André',
      verbForm: 'va rester',
      predicate: 'à la maison',
      fullSentence: 'Demain, André va rester à la maison.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier, André _____ (rester) à la maison.',
      beforeBlank: 'Hier, André ',
      verbInfinitiveHint: 'rester',
      afterBlank: ' à la maison.',
      correctAnswer: 'est resté',
      acceptedAnswers: ['est resté', 'est reste'],
      explanation: "Le verbe 'rester' se conjugue avec ÊTRE ! 'André' (il) + 'est' + participe 'resté'.",
    },
  },

  // 8. Être movement with feminine subject agreement
  {
    id: 'etre-1',
    verbInfinitive: 'partir',
    verbEnglish: 'to leave / depart',
    auxiliary: 'être',
    pastParticiple: 'parti',
    category: 'etre-movement',
    ruleTip: "Accord avec ÊTRE : le participe passé s'accorde en genre et en nombre avec le sujet. 'Sophie' (féminin singulier) -> 'partie' (+e).",
    past: {
      timeMarker: 'Hier matin',
      subject: 'Sophie',
      verbForm: 'est partie',
      predicate: 'en voyage',
      fullSentence: 'Hier matin, Sophie est partie en voyage.',
    },
    present: {
      timeMarker: "Aujourd'hui",
      subject: 'Sophie',
      verbForm: 'part',
      predicate: 'en voyage',
      fullSentence: "Aujourd'hui, Sophie part en voyage.",
    },
    futureProche: {
      timeMarker: 'Demain matin',
      subject: 'Sophie',
      verbForm: 'va partir',
      predicate: 'en voyage',
      fullSentence: 'Demain matin, Sophie va partir en voyage.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier matin, Sophie _____ (partir) en voyage.',
      beforeBlank: 'Hier matin, Sophie ',
      verbInfinitiveHint: 'partir',
      afterBlank: ' en voyage.',
      correctAnswer: 'est partie',
      acceptedAnswers: ['est partie'],
      explanation: "Avec l'auxiliaire 'être', le participe passé s'accorde avec le sujet : 'Sophie' est féminin, donc 'est partie' (+e).",
    },
  },

  // 9. Être movement with plural agreement
  {
    id: 'etre-2',
    verbInfinitive: 'aller',
    verbEnglish: 'to go',
    auxiliary: 'être',
    pastParticiple: 'allé',
    category: 'etre-movement',
    ruleTip: "Accord avec ÊTRE : 'ils' est masculin pluriel, donc le participe passé prend un 's' -> 'sont allés'.",
    past: {
      timeMarker: 'Hier après-midi',
      subject: 'ils',
      verbForm: 'sont allés',
      predicate: 'au parc',
      fullSentence: 'Hier après-midi, ils sont allés au parc.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'ils',
      verbForm: 'vont',
      predicate: 'au parc',
      fullSentence: 'En ce moment, ils vont au parc.',
    },
    futureProche: {
      timeMarker: 'Demain après-midi',
      subject: 'ils',
      verbForm: 'vont aller',
      predicate: 'au parc',
      fullSentence: 'Demain après-midi, ils vont aller au parc.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier après-midi, ils _____ (aller) au parc.',
      beforeBlank: 'Hier après-midi, ils ',
      verbInfinitiveHint: 'aller',
      afterBlank: ' au parc.',
      correctAnswer: 'sont allés',
      acceptedAnswers: ['sont allés', 'sont alles'],
      explanation: "Le verbe 'aller' se conjugue avec ÊTRE. Sujet 'ils' pluriel -> 'sont allés' (+s).",
    },
  },

  // 10. Irregular Participle: FAIRE (fait)
  {
    id: 'irreg-1',
    verbInfinitive: 'faire',
    verbEnglish: 'to do / make',
    auxiliary: 'avoir',
    pastParticiple: 'fait',
    category: 'irregular-participle',
    ruleTip: "Participe passé irrégulier de 'faire' : 'FAIT'. Utilise l'auxiliaire 'avoir'.",
    past: {
      timeMarker: 'Hier soir',
      subject: 'nous',
      verbForm: 'avons fait',
      predicate: 'les devoirs',
      fullSentence: 'Hier soir, nous avons fait les devoirs.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'nous',
      verbForm: 'faisons',
      predicate: 'les devoirs',
      fullSentence: 'En ce moment, nous faisons les devoirs.',
    },
    futureProche: {
      timeMarker: 'Demain soir',
      subject: 'nous',
      verbForm: 'allons faire',
      predicate: 'les devoirs',
      fullSentence: 'Demain soir, nous allons faire les devoirs.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier soir, nous _____ (faire) les devoirs.',
      beforeBlank: 'Hier soir, nous ',
      verbInfinitiveHint: 'faire',
      afterBlank: ' les devoirs.',
      correctAnswer: 'avons fait',
      acceptedAnswers: ['avons fait'],
      explanation: "Auxiliaire 'avons' + participe passé irrégulier 'fait' (faire -> fait).",
    },
  },

  // 11. Irregular Participle: PRENDRE (pris)
  {
    id: 'irreg-2',
    verbInfinitive: 'prendre',
    verbEnglish: 'to take',
    auxiliary: 'avoir',
    pastParticiple: 'pris',
    category: 'irregular-participle',
    ruleTip: "Participe passé irrégulier de 'prendre' : 'PRIS'. Utilise l'auxiliaire 'avoir'.",
    past: {
      timeMarker: 'Ce matin',
      subject: 'tu',
      verbForm: 'as pris',
      predicate: 'le train pour Paris',
      fullSentence: 'Ce matin, tu as pris le train pour Paris.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'tu',
      verbForm: 'prends',
      predicate: 'le train pour Paris',
      fullSentence: 'En ce moment, tu prends le train pour Paris.',
    },
    futureProche: {
      timeMarker: 'Demain matin',
      subject: 'tu',
      verbForm: 'vas prendre',
      predicate: 'le train pour Paris',
      fullSentence: 'Demain matin, tu vas prendre le train pour Paris.',
    },
    fillInTheBlank: {
      promptSentence: 'Ce matin, tu _____ (prendre) le train pour Paris.',
      beforeBlank: 'Ce matin, tu ',
      verbInfinitiveHint: 'prendre',
      afterBlank: ' le train pour Paris.',
      correctAnswer: 'as pris',
      acceptedAnswers: ['as pris'],
      explanation: "Sujet 'tu' + 'as' (avoir) + participe passé irrégulier 'pris'.",
    },
  },

  // 12. Irregular Participle: VOIR (vu)
  {
    id: 'irreg-3',
    verbInfinitive: 'voir',
    verbEnglish: 'to see',
    auxiliary: 'avoir',
    pastParticiple: 'vu',
    category: 'irregular-participle',
    ruleTip: "Participe passé irrégulier de 'voir' : 'VU'. Utilise l'auxiliaire 'avoir'.",
    past: {
      timeMarker: 'Le week-end passé',
      subject: "j'",
      verbForm: 'ai vu',
      predicate: 'un excellent film',
      fullSentence: "Le week-end passé, j'ai vu un excellent film.",
    },
    present: {
      timeMarker: "Aujourd'hui",
      subject: 'je',
      verbForm: 'vois',
      predicate: 'un excellent film',
      fullSentence: "Aujourd'hui, je vois un excellent film.",
    },
    futureProche: {
      timeMarker: 'Le week-end prochain',
      subject: 'je',
      verbForm: 'vais voir',
      predicate: 'un excellent film',
      fullSentence: 'Le week-end prochain, je vais voir un excellent film.',
    },
    fillInTheBlank: {
      promptSentence: "Le week-end passé, j' _____ (voir) un excellent film.",
      beforeBlank: "Le week-end passé, j'",
      verbInfinitiveHint: 'voir',
      afterBlank: ' un excellent film.',
      correctAnswer: 'ai vu',
      acceptedAnswers: ['ai vu', "j'ai vu"],
      explanation: "Auxiliaire 'ai' + participe passé irrégulier 'vu' (voir -> vu).",
    },
  },

  // 13. Movement verb: VENIR (venu / venue)
  {
    id: 'etre-3',
    verbInfinitive: 'venir',
    verbEnglish: 'to come',
    auxiliary: 'être',
    pastParticiple: 'venu',
    category: 'etre-movement',
    ruleTip: "ATTENTION ÊTRE : 'venir' utilise 'être'. Accord avec 'Claire' (féminin) -> 'venue'.",
    past: {
      timeMarker: 'Hier',
      subject: 'Claire',
      verbForm: 'est venue',
      predicate: 'me rendre visite',
      fullSentence: 'Hier, Claire est venue me rendre visite.',
    },
    present: {
      timeMarker: "Aujourd'hui",
      subject: 'Claire',
      verbForm: 'vient',
      predicate: 'me rendre visite',
      fullSentence: "Aujourd'hui, Claire vient me rendre visite.",
    },
    futureProche: {
      timeMarker: 'Demain',
      subject: 'Claire',
      verbForm: 'va venir',
      predicate: 'me rendre visite',
      fullSentence: 'Demain, Claire va venir me rendre visite.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier, Claire _____ (venir) me rendre visite.',
      beforeBlank: 'Hier, Claire ',
      verbInfinitiveHint: 'venir',
      afterBlank: ' me rendre visite.',
      correctAnswer: 'est venue',
      acceptedAnswers: ['est venue'],
      explanation: "Verbe 'venir' avec ÊTRE ! 'Claire' est féminin, donc accord avec un 'e' : 'est venue'.",
    },
  },

  // 14. Irregular Participle: METTRE (mis)
  {
    id: 'irreg-4',
    verbInfinitive: 'mettre',
    verbEnglish: 'to put / put on',
    auxiliary: 'avoir',
    pastParticiple: 'mis',
    category: 'irregular-participle',
    ruleTip: "Participe passé irrégulier de 'mettre' : 'MIS'.",
    past: {
      timeMarker: 'Ce matin',
      subject: 'il',
      verbForm: 'a mis',
      predicate: 'son manteau chaud',
      fullSentence: 'Ce matin, il a mis son manteau chaud.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'il',
      verbForm: 'met',
      predicate: 'son manteau chaud',
      fullSentence: 'En ce moment, il met son manteau chaud.',
    },
    futureProche: {
      timeMarker: 'Demain matin',
      subject: 'il',
      verbForm: 'va mettre',
      predicate: 'son manteau chaud',
      fullSentence: 'Demain matin, il va mettre son manteau chaud.',
    },
    fillInTheBlank: {
      promptSentence: 'Ce matin, il _____ (mettre) son manteau chaud.',
      beforeBlank: 'Ce matin, il ',
      verbInfinitiveHint: 'mettre',
      afterBlank: ' son manteau chaud.',
      correctAnswer: 'a mis',
      acceptedAnswers: ['a mis'],
      explanation: "Sujet 'il' + auxiliaire 'a' (avoir) + participe passé irrégulier 'mis'.",
    },
  },

  // 15. Movement verb: SORTIR (sorti)
  {
    id: 'etre-4',
    verbInfinitive: 'sortir',
    verbEnglish: 'to go out',
    auxiliary: 'être',
    pastParticiple: 'sorti',
    category: 'etre-movement',
    ruleTip: "Verbe de déplacement 'sortir' -> se conjugue avec ÊTRE pour exprimer le mouvement d'une personne.",
    past: {
      timeMarker: 'Hier soir',
      subject: 'Marc',
      verbForm: 'est sorti',
      predicate: 'avec ses amis',
      fullSentence: 'Hier soir, Marc est sorti avec ses amis.',
    },
    present: {
      timeMarker: 'Ce soir',
      subject: 'Marc',
      verbForm: 'sort',
      predicate: 'avec ses amis',
      fullSentence: 'Ce soir, Marc sort avec ses amis.',
    },
    futureProche: {
      timeMarker: 'Demain soir',
      subject: 'Marc',
      verbForm: 'va sortir',
      predicate: 'avec ses amis',
      fullSentence: 'Demain soir, Marc va sortir avec ses amis.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier soir, Marc _____ (sortir) avec ses amis.',
      beforeBlank: 'Hier soir, Marc ',
      verbInfinitiveHint: 'sortir',
      afterBlank: ' avec ses amis.',
      correctAnswer: 'est sorti',
      acceptedAnswers: ['est sorti'],
      explanation: "Le verbe de mouvement 'sortir' se conjugue avec ÊTRE : 'Marc' (il) + 'est sorti'.",
    },
  },

  // 16. Regular 2nd Group: FINIR (fini)
  {
    id: 'avoir-1',
    verbInfinitive: 'finir',
    verbEnglish: 'to finish',
    auxiliary: 'avoir',
    pastParticiple: 'fini',
    category: 'avoir-regular',
    ruleTip: "Les verbes du 2e groupe en -ir ont un participe passé régulier en -i (finir -> fini).",
    past: {
      timeMarker: 'Hier après-midi',
      subject: 'nous',
      verbForm: 'avons fini',
      predicate: 'notre projet',
      fullSentence: 'Hier après-midi, nous avons fini notre projet.',
    },
    present: {
      timeMarker: 'En ce moment',
      subject: 'nous',
      verbForm: 'finissons',
      predicate: 'notre projet',
      fullSentence: 'En ce moment, nous finissons notre projet.',
    },
    futureProche: {
      timeMarker: 'Demain après-midi',
      subject: 'nous',
      verbForm: 'allons finir',
      predicate: 'notre projet',
      fullSentence: 'Demain après-midi, nous allons finir notre projet.',
    },
    fillInTheBlank: {
      promptSentence: 'Hier après-midi, nous _____ (finir) notre projet.',
      beforeBlank: 'Hier après-midi, nous ',
      verbInfinitiveHint: 'finir',
      afterBlank: ' notre projet.',
      correctAnswer: 'avons fini',
      acceptedAnswers: ['avons fini'],
      explanation: "Sujet 'nous' + auxiliaire 'avons' (avoir) + participe passé en -i 'fini'.",
    },
  },
];
