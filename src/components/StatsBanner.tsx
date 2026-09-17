import React from 'react';
import { UserStats, VerbProgress, Verb } from '../types';
import { getVerbMasteryStatus } from '../utils/storage';
import { CheckCircle2, BookOpen, Flame, Target, ArrowRight, Play, RefreshCw, Layers } from 'lucide-react';

interface StatsBannerProps {
  stats: UserStats;
  progress: Record<string, VerbProgress>;
  allVerbs: Verb[];
  onStartQuiz: () => void;
  onViewLibrary: () => void;
  onReviewStruggling: () => void;
  onOpenFlashcards?: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  progress,
  allVerbs,
  onStartQuiz,
  onViewLibrary,
  onReviewStruggling,
  onOpenFlashcards,
}) => {
  // Compute distribution
  let masteredCount = 0;
  let learningCount = 0;
  let strugglingCount = 0;
  let unstudiedCount = 0;

  allVerbs.forEach((v) => {
    const status = getVerbMasteryStatus(progress[v.id]);
    if (status === 'mastered') masteredCount++;
    else if (status === 'learning') learningCount++;
    else if (status === 'struggling') strugglingCount++;
    else unstudiedCount++;
  });

  const totalVerbs = allVerbs.length;
  const masteryPercentage = totalVerbs > 0 ? Math.round((masteredCount / totalVerbs) * 100) : 0;
  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  return (
    <section className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 md:p-8 overflow-hidden relative">
      {/* Subtle French-inspired architectural watermark */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-stone-100/50 pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Learning Progress
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
              Conjugation Mastery Overview
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Track mastery over high-frequency French verbs, irregular auxiliaries, and verb groups.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="stats-start-quiz-btn"
              type="button"
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer hover:translate-y-[-1px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Practice Quiz</span>
            </button>
            {onOpenFlashcards && (
              <button
                id="stats-open-flashcards-btn"
                type="button"
                onClick={onOpenFlashcards}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-700" />
                <span>Flashcards (Present Tense)</span>
              </button>
            )}
            {strugglingCount > 0 && (
              <button
                id="stats-review-struggling-btn"
                type="button"
                onClick={onReviewStruggling}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-rose-600" />
                <span>Review ({strugglingCount} to review)</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Metrics Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Mastered */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Mastered Verbs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-950 font-serif">
                {masteredCount}{' '}
                <span className="text-xs font-normal text-emerald-700 font-sans">
                  / {totalVerbs} ({masteryPercentage}%)
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                High accuracy across multiple tenses
              </p>
            </div>
          </div>

          {/* Tile 2: Streak */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
              <span>Active Streak</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-amber-950 font-serif">
                {stats.streak}{' '}
                <span className="text-xs font-normal text-amber-700 font-sans">
                  {stats.streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Daily continuous practice habit
              </p>
            </div>
          </div>

          {/* Tile 3: Total Answered */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
              <span>Practiced Forms</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-blue-950 font-serif">
                {stats.totalAnswered}
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Conjugations solved in drills & cards
              </p>
            </div>
          </div>

          {/* Tile 4: Accuracy */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-800 text-xs font-semibold">
              <span>Accuracy Rate</span>
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-purple-950 font-serif">
                {stats.totalAnswered > 0 ? `${accuracy}%` : '—'}
              </div>
              <p className="text-[11px] text-purple-700 mt-1">
                {stats.totalCorrect} / {stats.totalAnswered} correct
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Verb Mastery Distribution</span>
            <button
              type="button"
              onClick={onViewLibrary}
              className="inline-flex items-center gap-1 text-xs text-stone-800 hover:text-indigo-600 font-semibold transition-colors cursor-pointer"
            >
              <span>View full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stacked Bar */}
          <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
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
              title={`Needs Practice: ${strugglingCount}`}
            />
            <div
              style={{ width: `${(unstudiedCount / totalVerbs) * 100}%` }}
              className="bg-stone-200 h-full transition-all duration-500"
              title={`Unstudied: ${unstudiedCount}`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Mastered ({masteredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Learning ({learningCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Needs Review ({strugglingCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>Unstudied ({unstudiedCount})</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
