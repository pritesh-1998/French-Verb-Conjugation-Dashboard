import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PASSE_COMPOSE_EXERCISES, PasseComposeExercise } from '../data/passeComposeExercises';
import { speakFrench } from '../utils/speech';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Volume2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Lightbulb,
  Award,
  Clock,
  Flame,
} from 'lucide-react';

interface PasseComposePracticeProps {
  onCompleteExercise?: () => void;
}

type Mode = 'fill-blank' | 'worksheet';
type CategoryFilter = 'all' | 'worksheet-sample' | 'etre-movement' | 'irregular-participle' | 'avoir-regular';

const FRENCH_ACCENTS = ['é', 'è', 'ê', 'à', 'ç', 'î', 'ù', 'ô', "'"];

export const PasseComposePractice: React.FC<PasseComposePracticeProps> = ({
  onCompleteExercise,
}) => {
  const [activeMode, setActiveMode] = useState<Mode>('worksheet');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // User input states
  const [inputVal, setInputVal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'all') return PASSE_COMPOSE_EXERCISES;
    return PASSE_COMPOSE_EXERCISES.filter((ex) => ex.category === selectedCategory);
  }, [selectedCategory]);

  const currentExercise: PasseComposeExercise = useMemo(() => {
    return filteredExercises[currentIndex] || filteredExercises[0];
  }, [filteredExercises, currentIndex]);

  // Reset input when exercise changes
  useEffect(() => {
    setInputVal('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    // Auto focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }, [currentIndex, selectedCategory, activeMode]);

  // Insert accent character at cursor
  const handleInsertAccent = (char: string) => {
    if (!inputRef.current) {
      setInputVal((prev) => prev + char);
      return;
    }
    const input = inputRef.current;
    const start = input.selectionStart || inputVal.length;
    const end = input.selectionEnd || inputVal.length;
    const updated = inputVal.substring(0, start) + char + inputVal.substring(end);
    setInputVal(updated);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  const normalizeForCheck = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[’']/g, "'");
  };

  const handleCheckAnswer = () => {
    if (!inputVal.trim() || isSubmitted) return;

    const userNorm = normalizeForCheck(inputVal);

    let match = false;
    if (activeMode === 'fill-blank') {
      const correctNorm = normalizeForCheck(currentExercise.fillInTheBlank.correctAnswer);
      const acceptedNorms = currentExercise.fillInTheBlank.acceptedAnswers.map(normalizeForCheck);
      match = userNorm === correctNorm || acceptedNorms.includes(userNorm);
    } else {
      // Worksheet mode: user fills the verb or full sentence without marker
      const fullVerb = normalizeForCheck(currentExercise.past.verbForm);
      const fullPredicate = normalizeForCheck(
        `${currentExercise.past.subject} ${currentExercise.past.verbForm} ${currentExercise.past.predicate}`
      );
      const fullWithMarker = normalizeForCheck(currentExercise.past.fullSentence);

      match =
        userNorm === fullVerb ||
        userNorm === fullPredicate ||
        userNorm === fullWithMarker ||
        userNorm === normalizeForCheck(`${currentExercise.past.verbForm} ${currentExercise.past.predicate}`) ||
        currentExercise.fillInTheBlank.acceptedAnswers.map(normalizeForCheck).includes(userNorm);
    }

    setIsSubmitted(true);
    setIsCorrect(match);

    if (match) {
      setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setStreak((prev) => prev + 1);
      // Play audio of the correct French sentence
      speakFrench(currentExercise.past.fullSentence);
      if (onCompleteExercise) onCompleteExercise();
    } else {
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
      setStreak(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isSubmitted) {
        handleCheckAnswer();
      } else {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredExercises.length - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Spacious, Calming Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
              Pratique du Passé Composé
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">
              Exercice de transformation temporelle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Passé Composé & Triade Temporelle
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Entraînez-vous à conjuguer avec <em>avoir</em> ou <em>être</em>, maîtrisez les accords du participe passé et transformez les phrases du présent au passé composé.
          </p>
        </div>

        {/* Score & Streak Counters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[11px] text-stone-400 block font-medium">Réussite</span>
            <span className="text-sm font-bold text-stone-800 font-mono">
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[11px] text-amber-700 block font-medium flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> Série
            </span>
            <span className="text-sm font-bold text-amber-900 font-mono">
              {streak}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Mode & Category Bar (No Clutter) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
        {/* Practice Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('worksheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'worksheet'
                ? 'bg-white text-stone-950 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Feuille d'exercice (Comme la photo)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('fill-blank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'fill-blank'
                ? 'bg-white text-stone-950 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Remplir le blanc (Auxiliaire + Participe)
          </button>
        </div>

        {/* Filter by Category */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tous ({PASSE_COMPOSE_EXERCISES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('worksheet-sample');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'worksheet-sample'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Exemples de la photo (7)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('etre-movement');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'etre-movement'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Maison d'Être & Accords
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('irregular-participle');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'irregular-participle'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Participes Irréguliers
          </button>
        </div>
      </div>

      {/* Exercise Card with Generous Spacing */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Card Header: Exercise Number & Verb metadata */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center text-xs font-bold font-mono">
              {currentIndex + 1}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-stone-900">
                  Verbe : <span className="text-indigo-600 underline decoration-indigo-200">{currentExercise.verbInfinitive}</span>
                </h2>
                <span className="text-xs text-stone-400">({currentExercise.verbEnglish})</span>
                <button
                  type="button"
                  onClick={() => speakFrench(currentExercise.verbInfinitive)}
                  className="p-1 text-stone-400 hover:text-indigo-600 rounded cursor-pointer"
                  title="Prononcer l'infinitif"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Auxiliaire : <strong className="font-semibold text-stone-700">{currentExercise.auxiliary.toUpperCase()}</strong> • Participe passé : <strong className="font-semibold text-stone-700">{currentExercise.pastParticiple}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{filteredExercises.length}</span>
          </div>
        </div>

        {/* WORK SHEET MODE: Mirroring the paper worksheet in the photo */}
        {activeMode === 'worksheet' ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <span className="font-medium">
                Activité : Transformez la phrase au <strong>passé composé</strong> (avec <em>Hier</em> ou l'expression du passé).
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1 text-amber-800 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Masquer l’indice' : 'Indice'}</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1 animate-in fade-in">
                <p className="font-semibold text-stone-900">Règle de conjugaison :</p>
                <p>{currentExercise.ruleTip}</p>
              </div>
            )}

            {/* The 3 Lines (Past, Present, Future) like the worksheet */}
            <div className="bg-stone-50/80 rounded-2xl border border-stone-200/90 p-5 space-y-4 font-mono text-xs sm:text-sm">
              {/* LINE 1: HIER (PASSÉ COMPOSÉ) - THE TARGET */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 bg-white p-3.5 rounded-xl border-2 border-dashed border-amber-300 shadow-2xs">
                <span className="w-36 shrink-0 font-bold text-amber-900 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentExercise.past.timeMarker} :</span>
                </span>

                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-stone-800">
                    {currentExercise.past.subject}
                  </span>

                  {/* Input blank for the verb form */}
                  <div className="relative inline-block min-w-40 flex-1 max-w-xs">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isSubmitted && isCorrect}
                      placeholder={currentExercise.verbInfinitive}
                      className={`w-full px-3 py-1.5 rounded-lg border text-sm font-mono font-bold transition-all focus:outline-hidden ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                          : 'bg-white border-amber-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900'
                      }`}
                    />
                  </div>

                  <span className="text-stone-700">
                    {currentExercise.past.predicate}.
                  </span>

                  <button
                    type="button"
                    onClick={() => speakFrench(currentExercise.past.fullSentence)}
                    className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer ml-auto"
                    title="Écouter la phrase"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* LINE 2: PRÉSENTEMENT (PRÉSENT) - GIVEN REFERENCE */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 bg-white/70 p-3 rounded-xl border border-stone-200">
                <span className="w-36 shrink-0 font-medium text-stone-500 font-sans text-xs uppercase tracking-wider">
                  {currentExercise.present.timeMarker} :
                </span>
                <span className="text-stone-700 flex-1">
                  <strong>{currentExercise.present.subject}</strong>{' '}
                  <span className="font-bold text-stone-900 bg-stone-100 px-1 py-0.5 rounded">
                    {currentExercise.present.verbForm}
                  </span>{' '}
                  {currentExercise.present.predicate}.
                </span>
                <button
                  type="button"
                  onClick={() => speakFrench(currentExercise.present.fullSentence)}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Écouter la phrase"
                >
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>

              {/* LINE 3: DEMAIN (FUTUR PROCHE) - GIVEN REFERENCE */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 bg-white/70 p-3 rounded-xl border border-stone-200">
                <span className="w-36 shrink-0 font-medium text-stone-500 font-sans text-xs uppercase tracking-wider">
                  {currentExercise.futureProche.timeMarker} :
                </span>
                <span className="text-stone-700 flex-1">
                  <strong>{currentExercise.futureProche.subject}</strong>{' '}
                  <span className="font-bold text-stone-900 bg-stone-100 px-1 py-0.5 rounded">
                    {currentExercise.futureProche.verbForm}
                  </span>{' '}
                  {currentExercise.futureProche.predicate}.
                </span>
                <button
                  type="button"
                  onClick={() => speakFrench(currentExercise.futureProche.fullSentence)}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Écouter la phrase"
                >
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE FILL-IN-THE-BLANK MODE */
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col gap-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Complétez avec le passé composé :
              </span>

              <div className="flex flex-wrap items-baseline gap-2 text-base sm:text-lg font-serif text-stone-900">
                <span>{currentExercise.fillInTheBlank.beforeBlank}</span>

                <div className="inline-block min-w-44 max-w-xs">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitted && isCorrect}
                    placeholder={`( ${currentExercise.fillInTheBlank.verbInfinitiveHint} )`}
                    className={`w-full px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all focus:outline-hidden ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                        : 'bg-white border-stone-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>

                <span>{currentExercise.fillInTheBlank.afterBlank}</span>

                <button
                  type="button"
                  onClick={() => speakFrench(currentExercise.past.fullSentence)}
                  className="p-1 rounded text-stone-400 hover:text-indigo-600 cursor-pointer ml-auto"
                  title="Écouter la phrase entière"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accent Keyboard Helper Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-medium text-stone-400 mr-1">Accents :</span>
          {FRENCH_ACCENTS.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleInsertAccent(char)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-xs font-mono font-bold text-stone-700 border border-stone-200 transition-colors cursor-pointer active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Feedback Section */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {isCorrect ? 'Excellent ! Bonne réponse.' : 'Pas tout à fait.'}
                </p>
                <p className="font-mono">
                  Réponse attendue : <strong className="underline">{currentExercise.past.verbForm}</strong>
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  {currentExercise.fillInTheBlank.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputVal(currentExercise.past.verbForm);
                setIsSubmitted(true);
                setIsCorrect(true);
              }}
              className="px-2.5 py-2 text-xs font-medium text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Voir la réponse
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!inputVal.trim()}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                  inputVal.trim()
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 active:scale-98 shadow-amber-500/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>Vérifier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <span>Phrase Suivante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Concise Helper Guide: Passé Composé at a Glance (Calm, not congested) */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-3 text-xs text-stone-600">
        <div className="flex items-center gap-2 font-bold font-serif text-stone-800 text-sm">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Rappel : Comment former le Passé Composé</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <strong className="text-stone-900 block mb-1">1. Auxiliaire AVOIR (90% des verbes)</strong>
            <span>Sujet + <strong>ai / as / a / avons / avez / ont</strong> + participe passé. Pas d'accord avec le sujet (ex: <em>elle a mangé</em>, <em>ils ont regardé</em>).</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <strong className="text-stone-900 block mb-1">2. Auxiliaire ÊTRE (Maison d'Être + Réfléchis)</strong>
            <span>Sujet + <strong>suis / es / est / sommes / êtes / sont</strong> + accord en genre (+e) et en nombre (+s) avec le sujet (ex: <em>elle est arrivée</em>, <em>André est resté</em>).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
