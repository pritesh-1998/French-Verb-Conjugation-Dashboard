import React, { useState, useEffect } from 'react';
import { MatchQuestion, MatchPair } from '../../types';
import { speakFrench } from '../../utils/speech';
import { formatSpokenConjugation } from '../../utils/frenchFormatting';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Link as LinkIcon,
  Sparkles,
  Trophy,
  AlertCircle,
} from 'lucide-react';

interface QuizMatchModeProps {
  question: MatchQuestion;
  onMatchCompleted: (verbId: string, mistakesCount: number) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizMatchMode: React.FC<QuizMatchModeProps> = ({
  question,
  onMatchCompleted,
  onNextQuestion,
  isLastQuestion,
  questionNumber,
  totalQuestions,
}) => {
  // Matched pair IDs
  const [matchedPronounIds, setMatchedPronounIds] = useState<string[]>([]);
  const [selectedPronounId, setSelectedPronounId] = useState<string | null>(null);
  const [shuffledForms, setShuffledForms] = useState<MatchPair[]>([]);
  const [mistakeBanner, setMistakeBanner] = useState<{
    pronounDisplay: string;
    chosenForm: string;
    correctForm: string;
    belongsTo: string;
  } | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isAllMatched, setIsAllMatched] = useState(false);

  // Initialize and shuffle right side on question change
  useEffect(() => {
    setMatchedPronounIds([]);
    setSelectedPronounId(null);
    setMistakeBanner(null);
    setMistakeCount(0);
    setIsAllMatched(false);

    // Shuffle forms
    const shuffled = [...question.pairs].sort(() => Math.random() - 0.5);
    setShuffledForms(shuffled);
  }, [question.id]);

  // Handle pronoun click
  const handleSelectPronoun = (pair: MatchPair) => {
    if (matchedPronounIds.includes(pair.id) || isAllMatched) return;
    setMistakeBanner(null);
    setSelectedPronounId(pair.id);
  };

  // Handle conjugated form click
  const handleSelectForm = (formPair: MatchPair) => {
    if (matchedPronounIds.includes(formPair.id) || isAllMatched) return;
    if (!selectedPronounId) {
      // If no pronoun selected yet, prompt user
      return;
    }

    const targetPronounPair = question.pairs.find((p) => p.id === selectedPronounId);
    if (!targetPronounPair) return;

    if (targetPronounPair.id === formPair.id) {
      // Correct match!
      const newMatched = [...matchedPronounIds, formPair.id];
      setMatchedPronounIds(newMatched);
      setSelectedPronounId(null);
      setMistakeBanner(null);
      speakFrench(formatSpokenConjugation(targetPronounPair.pronounDisplay, formPair.conjugatedForm));

      if (newMatched.length === question.pairs.length) {
        setIsAllMatched(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        onMatchCompleted(question.verb.id, mistakeCount);
      }
    } else {
      // Incorrect match!
      setMistakeCount((prev) => prev + 1);
      const rightfulPair = question.pairs.find((p) => p.id === formPair.id);

      setMistakeBanner({
        pronounDisplay: targetPronounPair.pronounDisplay,
        chosenForm: formPair.conjugatedForm,
        correctForm: targetPronounPair.conjugatedForm,
        belongsTo: rightfulPair ? rightfulPair.pronounDisplay : '',
      });

      speakFrench(formatSpokenConjugation(targetPronounPair.pronounDisplay, targetPronounPair.conjugatedForm));
      setSelectedPronounId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Verb Header */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700">
                Verb {questionNumber} of {totalQuestions}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800">
                {question.tenseName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-stone-100 text-stone-600">
                Matching
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950">
                {question.verb.infinitive}
              </h2>
              <span className="text-stone-500 italic text-sm sm:text-base">
                "{question.verb.english}"
              </span>
              <button
                type="button"
                onClick={() => speakFrench(question.verb.infinitive)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                title="Listen to verb"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-600">
            <div>Pairs matched: <strong className="text-emerald-700 font-mono text-sm">{matchedPronounIds.length} / {question.pairs.length}</strong></div>
            {mistakeCount > 0 && (
              <div className="text-rose-600 font-medium">Mistakes: {mistakeCount}</div>
            )}
          </div>
        </div>

        <p className="text-xs text-stone-600 mt-3 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            Click a subject pronoun on the left, then select its matching conjugated form on the right.
          </span>
        </p>
      </div>

      {/* Mistake Auto-Correction Banner */}
      {mistakeBanner && (
        <div
          id="match-mistake-correction-banner"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-150 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-rose-950 mb-1 flex items-center justify-between">
                <span>Match Correction:</span>
                <button
                  type="button"
                  onClick={() => speakFrench(formatSpokenConjugation(mistakeBanner.pronounDisplay, mistakeBanner.correctForm))}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-rose-600" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-rose-900 leading-relaxed">
                You attempted to match <strong className="underline decoration-rose-400">{mistakeBanner.pronounDisplay}</strong> with <span className="font-mono font-bold line-through text-rose-800">{mistakeBanner.chosenForm}</span>.
                {mistakeBanner.belongsTo && (
                  <span> Notice that <em>"{mistakeBanner.chosenForm}"</em> belongs to <strong>{mistakeBanner.belongsTo}</strong>.</span>
                )}
                {' '}For <strong>{mistakeBanner.pronounDisplay}</strong>, the correct form is{' '}
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                  {mistakeBanner.correctForm}
                </strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Matching Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Column: Pronouns */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
            Subject Pronouns
          </div>
          {question.pairs.map((pair) => {
            const isMatched = matchedPronounIds.includes(pair.id);
            const isSelected = selectedPronounId === pair.id;

            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched || isAllMatched}
                onClick={() => handleSelectPronoun(pair)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-default opacity-85'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/30 font-semibold shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-400 text-stone-800 shadow-2xs'
                }`}
              >
                <span className="font-medium text-xs sm:text-sm">
                  {pair.pronounDisplay}
                </span>

                {isMatched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isSelected ? (
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                ) : (
                  <span className="w-3 h-3 rounded-full border border-stone-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Shuffled Conjugations */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
            Conjugated Forms
          </div>
          {shuffledForms.map((pair) => {
            const isMatched = matchedPronounIds.includes(pair.id);

            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched || isAllMatched}
                onClick={() => handleSelectForm(pair)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold cursor-default opacity-85'
                    : selectedPronounId
                    ? 'bg-white border-stone-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-stone-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 opacity-90'
                }`}
              >
                <span className="font-mono text-xs sm:text-sm">
                  {pair.conjugatedForm}
                </span>

                {isMatched && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakFrench(formatSpokenConjugation(pair.pronounDisplay, pair.conjugatedForm));
                      }}
                      className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion & Next Button */}
      {isAllMatched && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <div className="font-bold text-emerald-950 text-sm sm:text-base">
                All pairs matched successfully!
              </div>
              <div className="text-xs text-emerald-800">
                +{question.pairs.length * 50} points awarded
              </div>
            </div>
          </div>

          <button
            id="next-match-verb-btn"
            type="button"
            onClick={onNextQuestion}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
          >
            <span>{isLastQuestion ? 'View Final Results' : 'Next Verb'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
