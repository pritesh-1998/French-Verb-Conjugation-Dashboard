import React from 'react';
import { QuizResult, Verb } from '../../types';
import { speakFrench } from '../../utils/speech';
import { formatSpokenConjugation } from '../../utils/frenchFormatting';
import {
  Trophy,
  Flame,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  Target,
} from 'lucide-react';

interface QuizResultsProps {
  results: QuizResult[];
  score: number;
  highestStreak: number;
  onRetryMistakes?: () => void;
  onNewQuiz: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  results,
  score,
  highestStreak,
  onRetryMistakes,
  onNewQuiz,
}) => {
  const totalItems = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const mistakes = results.filter((r) => !r.isCorrect);

  const getGrade = () => {
    if (accuracy >= 95) return { label: 'A+', color: 'text-emerald-600', sub: 'Outstanding mastery!' };
    if (accuracy >= 85) return { label: 'A', color: 'text-indigo-600', sub: 'Very well mastered!' };
    if (accuracy >= 70) return { label: 'B', color: 'text-blue-600', sub: 'Solid understanding.' };
    if (accuracy >= 50) return { label: 'C', color: 'text-amber-600', sub: 'On the right track, keep going!' };
    return { label: 'D', color: 'text-rose-600', sub: 'Daily practice recommended.' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Score and Grade Banner */}
      <div className="rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-indigo-950 p-6 sm:p-8 text-white shadow-xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-4">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Practice Session Summary</span>
        </div>

        <div className="flex flex-col items-center justify-center my-2">
          <span className={`text-6xl sm:text-7xl font-serif font-extrabold ${grade.color}`}>
            {grade.label}
          </span>
          <p className="text-sm sm:text-base font-medium text-stone-200 mt-1">
            {grade.sub}
          </p>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 uppercase tracking-wide">Accuracy</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {accuracy}%
            </div>
            <div className="text-[10px] text-stone-400">{correctCount} / {totalItems} correct</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 uppercase tracking-wide">Points Earned</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-0.5">
              +{score}
            </div>
            <div className="text-[10px] text-stone-400">Session score</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3">
            <div className="text-[11px] text-stone-400 uppercase tracking-wide">Best Streak</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{highestStreak}</span>
            </div>
            <div className="text-[10px] text-stone-400">In a row</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {mistakes.length > 0 && onRetryMistakes && (
          <button
            id="retry-quiz-mistakes-btn"
            type="button"
            onClick={onRetryMistakes}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice {mistakes.length} Mistake{mistakes.length > 1 ? 's' : ''}</span>
          </button>
        )}

        <button
          id="new-custom-quiz-btn"
          type="button"
          onClick={onNewQuiz}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
        >
          <Sliders className="w-4 h-4" />
          <span>New Practice Quiz</span>
        </button>
      </div>

      {/* Mistakes Review List */}
      {mistakes.length > 0 ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-stone-900">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Mistakes Review & Corrections ({mistakes.length})</span>
            </div>
            <span className="text-xs text-stone-500">
              Review correct conjugations below
            </span>
          </div>

          <div className="space-y-3">
            {mistakes.map((m, idx) => {
              const q = m.question;
              const pronoun = 'pronounDisplay' in q ? q.pronounDisplay : '';
              const correct = 'correctAnswer' in q ? q.correctAnswer : m.details || '';

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {m.verb.infinitive}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                        {m.tenseName}
                      </span>
                      <span className="text-stone-500 italic">
                        "{m.verb.english}"
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-stone-600">
                        Pronoun: <strong className="text-stone-900">{pronoun || '—'}</strong>
                      </span>
                      <span className="text-rose-700">
                        Your answer: <span className="line-through font-mono">{m.userAnswer || '(empty)'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-2 rounded-xl border border-rose-200 self-start sm:self-auto">
                    <span className="text-emerald-800 font-semibold">
                      Correct:
                    </span>
                    <strong className="font-mono text-emerald-950">
                      {correct}
                    </strong>
                    <button
                      type="button"
                      onClick={() => speakFrench(formatSpokenConjugation(pronoun, correct))}
                      className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center text-emerald-950">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-serif">Perfect Score, No Mistakes!</h3>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto mt-1">
            All your answers were completely accurate. Your mastery of French verb endings and stems is shining!
          </p>
        </div>
      )}
    </div>
  );
};
