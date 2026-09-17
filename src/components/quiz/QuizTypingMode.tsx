import React, { useState, useRef, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import { speakFrench } from '../../utils/speech';
import {
  formatSpokenConjugation,
  getIsolatedVerbForm,
} from '../../utils/frenchFormatting';
import { AccentKeyboard } from '../AccentKeyboard';
import { QuizAutoCorrectionBanner } from './QuizAutoCorrectionBanner';
import {
  Volume2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';

interface QuizTypingModeProps {
  question: QuizQuestion;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
  isAnswered: boolean;
  isCorrect: boolean;
  userAnswer: string;
  pointsEarned: number;
  streak: number;
  isLastQuestion: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizTypingMode: React.FC<QuizTypingModeProps> = ({
  question,
  onSubmitAnswer,
  onNextQuestion,
  isAnswered,
  isCorrect,
  userAnswer,
  pointsEarned,
  streak,
  isLastQuestion,
  questionNumber,
  totalQuestions,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input and focus on question change
  useEffect(() => {
    setTypedInput('');
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [question.id]);

  // Handle Enter to proceed when answered
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !typedInput.trim()) return;
    onSubmitAnswer(typedInput.trim());
  };

  const handleInsertAccent = (char: string) => {
    if (isAnswered) return;
    setTypedInput((prev) => prev + char);
    inputRef.current?.focus();
  };

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

        {/* Challenge Target Pronoun */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-1">
              Target Pronoun
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

        {/* Context Example if available */}
        {question.contextSentence && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
            <span className="font-semibold text-stone-900">Context: </span>
            <span>"{question.contextSentence.before} "</span>
            <span className="font-mono font-bold text-indigo-700">______</span>
            <span>" {question.contextSentence.after}"</span>
            <div className="text-stone-500 italic mt-0.5">
              "{question.contextSentence.translation}"
            </div>
          </div>
        )}
      </div>

      {/* Typing Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
        <div className="mb-4">
          <label
            htmlFor="quiz-typing-input"
            className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"
          >
            Your Answer:
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                id="quiz-typing-input"
                ref={inputRef}
                type="text"
                disabled={isAnswered}
                value={isAnswered ? userAnswer : typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={`Type the form for "${question.pronounDisplay}"...`}
                className={`w-full px-4 py-3 rounded-2xl text-base font-mono border transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-rose-50 border-rose-400 text-rose-950 font-medium'
                    : 'bg-white border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600'
                }`}
              />
            </div>

            {!isAnswered ? (
              <button
                id="submit-typing-answer-btn"
                type="submit"
                disabled={!typedInput.trim()}
                className={`px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                  typedInput.trim()
                    ? 'bg-stone-950 text-white hover:bg-stone-800 hover:translate-y-[-1px]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            ) : null}
          </div>
        </div>

        {/* Accent Keyboard Toolbar */}
        {!isAnswered && (
          <div className="pt-2 border-t border-stone-100">
            <AccentKeyboard onInsert={handleInsertAccent} />
          </div>
        )}

        {/* Success Feedback Banner */}
        {isAnswered && isCorrect && (
          <div
            id="quiz-correct-banner"
            className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                  <span>Perfect! Correct answer</span>
                  <span className="text-xs font-mono font-semibold text-emerald-700">
                    (+{pointsEarned} pts)
                  </span>
                </div>
                <div className="font-mono text-sm text-emerald-900">
                  {question.pronounDisplay} <strong>{getIsolatedVerbForm(question.correctAnswer, question.pronoun)}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakFrench(formatSpokenConjugation(question.pronounDisplay, question.correctAnswer))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Listen</span>
            </button>
          </div>
        )}

        {/* Automatic Mistake Correction Banner */}
        {isAnswered && !isCorrect && (
          <QuizAutoCorrectionBanner
            userAnswer={userAnswer}
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
              id="next-typing-question-btn"
              type="button"
              onClick={onNextQuestion}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
            >
              <span>{isLastQuestion ? 'View Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
