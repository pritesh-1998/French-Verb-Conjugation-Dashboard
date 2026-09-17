import React, { useState, useRef, useEffect } from 'react';
import { FullTableQuestion, ConjugationForm } from '../../types';
import { speakFrench } from '../../utils/speech';
import {
  formatSpokenConjugation,
  getIsolatedVerbForm,
  getStemAndEnding,
} from '../../utils/frenchFormatting';
import { AccentKeyboard } from '../AccentKeyboard';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Trophy,
} from 'lucide-react';

interface RowEvaluation {
  pronoun: string;
  pronounDisplay: string;
  expectedForm: string;
  userForm: string;
  isCorrect: boolean;
  stem?: string;
  ending?: string;
}

interface QuizFullTableModeProps {
  question: FullTableQuestion;
  onTableEvaluated: (
    verbId: string,
    allCorrect: boolean,
    correctCount: number,
    evaluations: RowEvaluation[]
  ) => void;
  onNextVerb: () => void;
  isLastVerb: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizFullTableMode: React.FC<QuizFullTableModeProps> = ({
  question,
  onTableEvaluated,
  onNextVerb,
  isLastVerb,
  questionNumber,
  totalQuestions,
}) => {
  // Store user inputs for each pronoun index (0..5)
  const [userInputs, setUserInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<RowEvaluation[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on new question/verb
  useEffect(() => {
    setUserInputs(['', '', '', '', '', '']);
    setIsValidated(false);
    setEvaluations([]);
    setCorrectCount(0);
    setActiveInputIndex(0);

    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [question.id]);

  // Handle keyboard shortcut for Enter to validate or advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isValidated) {
          e.preventDefault();
          onNextVerb();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isValidated, onNextVerb]);

  const handleInputChange = (index: number, val: string) => {
    if (isValidated) return;
    const next = [...userInputs];
    next[index] = val;
    setUserInputs(next);
  };

  const handleInsertAccent = (char: string) => {
    if (isValidated) return;
    const currentVal = userInputs[activeInputIndex] || '';
    handleInputChange(activeInputIndex, currentVal + char);
    inputRefs.current[activeInputIndex]?.focus();
  };

  const handleValidateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidated) return;

    const forms = question.forms;
    let correctSum = 0;
    const evals: RowEvaluation[] = forms.map((formItem, idx) => {
      const userInput = (userInputs[idx] || '').trim();
      const cleanUser = userInput.toLowerCase().replace(/\s+/g, ' ');
      const cleanExpected = formItem.form.toLowerCase().replace(/\s+/g, ' ');

      // Check match: exact (with or without pronoun prefix)
      const isolatedExpected = getIsolatedVerbForm(formItem.form, formItem.pronoun).toLowerCase();
      const isExact = cleanUser === cleanExpected;
      const isStrippedMatch = cleanUser === isolatedExpected;
      const isCorrect = isExact || isStrippedMatch;

      if (isCorrect) correctSum++;

      return {
        pronoun: formItem.pronoun,
        pronounDisplay: formItem.pronounDisplay,
        expectedForm: formItem.form,
        userForm: userInput,
        isCorrect,
        stem: formItem.stem,
        ending: formItem.ending,
      };
    });

    setEvaluations(evals);
    setCorrectCount(correctSum);
    setIsValidated(true);

    const isAllCorrect = correctSum === forms.length;
    if (isAllCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    onTableEvaluated(question.verb.id, isAllCorrect, correctSum, evals);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Target Verb Header Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700">
                Verb {questionNumber} of {totalQuestions}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800">
                {question.tenseName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-stone-100 text-stone-600">
                {question.verb.group === 1
                  ? '1st Group (-er)'
                  : question.verb.group === 2
                  ? '2nd Group (-ir)'
                  : '3rd Group (Irregular)'}
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

          <div className="text-left sm:text-right text-xs text-stone-500">
            <div>Auxiliary: <strong className="text-stone-800">{question.verb.auxiliary}</strong></div>
            <div>Past participle: <strong className="text-stone-800">{question.verb.pastParticiple}</strong></div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-stone-600 mt-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            Complete all 6 forms of the verb in the <strong>{question.tenseName}</strong>. Press Tab or Enter to move between rows.
          </span>
        </p>
      </div>

      {/* Conjugation Form Rows Table */}
      <form onSubmit={handleValidateTable} className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="space-y-3 mb-6">
          {question.forms.map((formItem, idx) => {
            const evaluation = isValidated ? evaluations[idx] : null;
            const isRowCorrect = evaluation ? evaluation.isCorrect : null;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  isRowCorrect === true
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : isRowCorrect === false
                    ? 'bg-rose-50/70 border-rose-300'
                    : activeInputIndex === idx
                    ? 'bg-stone-50 border-stone-400 ring-1 ring-stone-400/30'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Pronoun label */}
                  <div className="w-32 shrink-0 font-medium text-xs sm:text-sm text-stone-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                    <span>{formItem.pronounDisplay}</span>
                  </div>

                  {/* Input field or Results representation */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      id={`table-input-${question.id}-${idx}`}
                      type="text"
                      disabled={isValidated}
                      value={userInputs[idx] || ''}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      onFocus={() => setActiveInputIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isValidated) {
                          e.preventDefault();
                          if (idx < 5) {
                            inputRefs.current[idx + 1]?.focus();
                          } else {
                            handleValidateTable(e);
                          }
                        }
                      }}
                      placeholder={`Form for ${formItem.pronoun}...`}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border transition-all ${
                        isValidated
                          ? isRowCorrect
                            ? 'bg-emerald-100/50 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-rose-100/50 border-rose-400 text-rose-950 line-through'
                          : 'bg-white border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600'
                      }`}
                    />

                    {/* Audio pronunciation button */}
                    <button
                      type="button"
                      onClick={() => speakFrench(formatSpokenConjugation(formItem.pronounDisplay, formItem.form))}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer shrink-0"
                      title="Listen to correct form"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Automatic Mistake Correction Detail */}
                {isValidated && isRowCorrect === false && (
                  <div className="mt-2 pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mistake:</span>
                      </span>
                      <span className="font-mono text-rose-800 line-through">
                        {userInputs[idx] || '— (unfilled)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Exact correction:</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-950">
                        {getIsolatedVerbForm(formItem.form, formItem.pronoun)}
                      </span>
                      {formItem.ending && (
                        <span className="text-[10px] text-emerald-700 font-medium">
                          (ending -{formItem.ending})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Accent Keyboard (Active during editing) */}
        {!isValidated && (
          <div className="mb-6 pt-4 border-t border-stone-100">
            <AccentKeyboard onInsert={handleInsertAccent} />
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
          {isValidated ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              {correctCount === 6 ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>100% Perfect Table! +300 points</span>
                </div>
              ) : (
                <div className="text-stone-700">
                  Result: <strong className="text-stone-950">{correctCount} / 6</strong> correct (+{correctCount * 50} pts)
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-stone-500">
              Fill in all 6 pronouns, then click Submit Table
            </div>
          )}

          <div>
            {!isValidated ? (
              <button
                id="validate-full-table-btn"
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-950 text-white hover:bg-stone-800 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                Submit Conjugation Table
              </button>
            ) : (
              <button
                id="next-verb-table-btn"
                type="button"
                onClick={onNextVerb}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                <span>{isLastVerb ? 'View Final Results' : 'Next Verb'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
