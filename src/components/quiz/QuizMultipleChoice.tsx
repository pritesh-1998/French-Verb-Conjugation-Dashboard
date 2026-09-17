import React, { useEffect } from 'react';
import { QuizQuestion } from '../../types';
import { speakFrench } from '../../utils/speech';
import {
  formatSpokenConjugation,
  getIsolatedVerbForm,
} from '../../utils/frenchFormatting';
import { QuizAutoCorrectionBanner } from './QuizAutoCorrectionBanner';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface QuizMultipleChoiceProps {
  question: QuizQuestion;
  onSelectOption: (option: string) => void;
  onNextQuestion: () => void;
  isAnswered: boolean;
  selectedOption: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  streak: number;
  isLastQuestion: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizMultipleChoice: React.FC<QuizMultipleChoiceProps> = ({
  question,
  onSelectOption,
  onNextQuestion,
  isAnswered,
  selectedOption,
  isCorrect,
  pointsEarned,
  streak,
  isLastQuestion,
  questionNumber,
  totalQuestions,
}) => {
  // Handle Enter key to proceed when answered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isAnswered) {
        e.preventDefault();
        onNextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onNextQuestion]);

  // Find stem and ending from target verb forms if available
  const currentForms = question.verb.conjugations[question.tenseId] || [];
  const matchedFormItem = currentForms.find(
    (f) => f.pronoun.toLowerCase() === question.pronoun.toLowerCase()
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Target Verb Prompt Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700">
                Question {questionNumber} of {totalQuestions}
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
                title="Listen to infinitive"
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

        {/* Target Pronoun Prompt */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-1">
              Choose the correct form for:
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-extrabold text-indigo-950 flex items-center gap-3">
              <span>{question.pronounDisplay}</span>
              <span className="text-stone-300 font-sans font-light">➔</span>
              <span className="font-mono text-stone-400 text-lg sm:text-xl font-normal">
                [ {question.tenseName} ]
              </span>
            </div>
          </div>

          {streak >= 2 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Streak x{streak >= 5 ? '1.5' : streak >= 3 ? '1.3' : '1.1'} !</span>
            </div>
          )}
        </div>
      </div>

      {/* Multiple Choice Options Grid */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
          Options:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isThisCorrect =
              option.toLowerCase() === question.correctAnswer.toLowerCase();

            let btnClass = 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-900';
            if (isAnswered) {
              if (isThisCorrect) {
                btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs';
              } else if (isSelected) {
                btnClass = 'bg-rose-100 border-rose-500 text-rose-950 line-through';
              } else {
                btnClass = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => onSelectOption(option)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between font-mono text-sm sm:text-base transition-all cursor-pointer ${btnClass}`}
              >
                <span>{option}</span>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {isAnswered && isCorrect && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-emerald-950 text-sm">
                  Excellent! Correct answer (+{pointsEarned} pts)
                </div>
                <div className="font-mono text-xs text-emerald-800">
                  {question.pronounDisplay} <strong>{getIsolatedVerbForm(question.correctAnswer, question.pronoun)}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakFrench(formatSpokenConjugation(question.pronounDisplay, question.correctAnswer))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Listen</span>
            </button>
          </div>
        )}

        {/* Automatic Mistake Correction Banner */}
        {isAnswered && !isCorrect && selectedOption && (
          <QuizAutoCorrectionBanner
            userAnswer={selectedOption}
            correctAnswer={question.correctAnswer}
            verbInfinitive={question.verb.infinitive}
            pronounDisplay={question.pronounDisplay}
            tenseName={question.tenseName}
            stem={matchedFormItem?.stem}
            ending={matchedFormItem?.ending}
            ruleTip={question.verb.tip}
          />
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end">
            <button
              id="next-mc-question-btn"
              type="button"
              onClick={onNextQuestion}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
            >
              <span>{isLastQuestion ? 'View Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
