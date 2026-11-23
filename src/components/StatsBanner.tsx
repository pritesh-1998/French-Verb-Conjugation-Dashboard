import React from 'react';
import { UserStats, VerbProgress, Verb } from '../types';
import { getVerbMasteryStatus } from '../utils/storage';
import { CheckCircle2, BookOpen, Flame, Target, ArrowRight, Play, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  stats: UserStats;
  progress: Record<string, VerbProgress>;
  allVerbs: Verb[];
  onStartQuiz: () => void;
  onViewLibrary: () => void;
  onReviewStruggling: () => void;
  onOpenFlashcards?: () => void;
  onPracticePasseCompose?: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  progress,
  allVerbs,
  onStartQuiz,
  onViewLibrary,
  onReviewStruggling,
  onOpenFlashcards,
  onPracticePasseCompose,
}) => {
  // Compute distribution
  let masteredCount = 0;
  let learningCount = 0;
  let strugglingCount = 0;

  allVerbs.forEach((v) => {
    const status = getVerbMasteryStatus(progress[v.id]);
    if (status === 'mastered') masteredCount++;
    else if (status === 'learning') learningCount++;
    else if (status === 'struggling') strugglingCount++;
  });

  const totalVerbs = allVerbs.length;
  const masteryPercentage = totalVerbs > 0 ? Math.round((masteredCount / totalVerbs) * 100) : 0;
  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  return (
    <section className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
      {/* Top row: Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Conjugation Studio
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Welcome back to your French practice
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {masteredCount} of {totalVerbs} core verbs mastered ({masteryPercentage}%) across past, present, and future.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onPracticePasseCompose && (
            <button
              type="button"
              onClick={onPracticePasseCompose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pratique Passé Composé</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Quiz</span>
          </button>

          {onOpenFlashcards && (
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-all cursor-pointer"
            >
              <span>Flashcards</span>
            </button>
          )}
        </div>
      </div>

      {/* Key 3 Metrics on a calm, clean bar */}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-stone-100">
        <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mb-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Streak</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-stone-900 font-mono">
            {stats.streak} <span className="text-xs font-normal text-stone-500">{stats.streak === 1 ? 'day' : 'days'}</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mastered</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-stone-900 font-mono">
            {masteredCount} <span className="text-xs font-normal text-stone-500">/ {totalVerbs}</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mb-1">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Accuracy</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-stone-900 font-mono">
            {stats.totalAnswered > 0 ? `${accuracy}%` : '—'}
          </span>
        </div>
      </div>

      {/* Sleek, simple progress bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>Mastery Progress</span>
          <button
            type="button"
            onClick={onViewLibrary}
            className="text-stone-700 hover:text-indigo-600 font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(masteredCount / totalVerbs) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Mastered: ${masteredCount}`}
          />
          <div
            style={{ width: `${(learningCount / totalVerbs) * 100}%` }}
            className="bg-amber-400 h-full transition-all duration-500"
            title={`Learning: ${learningCount}`}
          />
          <div
            style={{ width: `${(strugglingCount / totalVerbs) * 100}%` }}
            className="bg-rose-400 h-full transition-all duration-500"
            title={`Needs Review: ${strugglingCount}`}
          />
        </div>
      </div>
    </section>
  );
};
