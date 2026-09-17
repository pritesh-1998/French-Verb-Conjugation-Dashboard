import React from 'react';
import { UserStats, VerbProgress, Verb } from '../types';
import { StatsBanner } from './StatsBanner';
import { VerbOfTheDay } from './VerbOfTheDay';
import { speakFrench } from '../utils/speech';
import { getIsolatedVerbForm } from '../utils/frenchFormatting';
import { getAllFavoriteVerbs } from '../utils/conjugator';
import { ArrowRight, BookOpen, Volume2, Sparkles, CheckCircle2, Bookmark } from 'lucide-react';

interface DashboardOverviewProps {
  stats: UserStats;
  progress: Record<string, VerbProgress>;
  allVerbs: Verb[];
  verbOfTheDay: Verb;
  onSelectVerb: (verb: Verb) => void;
  onToggleBookmark: (verbId: string) => void;
  onStartQuiz: () => void;
  onViewLibrary: () => void;
  onReviewStruggling: () => void;
  onOpenFlashcards?: () => void;
  onViewFavorites?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  progress,
  allVerbs,
  verbOfTheDay,
  onSelectVerb,
  onToggleBookmark,
  onStartQuiz,
  onViewLibrary,
  onReviewStruggling,
  onOpenFlashcards,
  onViewFavorites,
}) => {
  // Top 6 most essential verbs
  const topVerbs = allVerbs.slice(0, 6);

  // Bookmarked verbs (including dynamic 7,000+ library favorites)
  const bookmarkedVerbs = React.useMemo(() => {
    return getAllFavoriteVerbs(progress);
  }, [progress]);

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <StatsBanner
        stats={stats}
        progress={progress}
        allVerbs={allVerbs}
        onStartQuiz={onStartQuiz}
        onViewLibrary={onViewLibrary}
        onReviewStruggling={onReviewStruggling}
        onOpenFlashcards={onOpenFlashcards}
      />

      {/* Verb of the Day */}
      <VerbOfTheDay
        verb={verbOfTheDay}
        onOpenVerb={onSelectVerb}
        isBookmarked={!!progress[verbOfTheDay.id]?.bookmarked}
        onToggleBookmark={onToggleBookmark}
      />

      {/* High-Frequency Core Verbs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Pillar Verbs of the French Language
            </h3>
            <p className="text-xs text-stone-500">
              The fundamental verbs representing over 50% of spoken French discourse.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewLibrary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 cursor-pointer"
          >
            <span>View all {allVerbs.length} verbs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topVerbs.map((verb) => {
            const verbProgress = progress[verb.id];
            const isBookmarked = !!verbProgress?.bookmarked;
            const present3 = verb.conjugations.present?.slice(0, 3) || [];

            return (
              <div
                key={verb.id}
                onClick={() => onSelectVerb(verb)}
                className="bg-white rounded-xl border border-stone-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        #{verb.frequencyRank}
                      </span>
                      <h4 className="text-lg font-bold font-serif text-stone-900 group-hover:text-indigo-600 transition-colors">
                        {verb.infinitive}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakFrench(verb.infinitive);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(verb.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isBookmarked ? 'text-amber-500' : 'text-stone-300 hover:text-stone-600'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                    "{verb.english}"
                  </p>

                  <div className="mt-3 py-2 px-2.5 rounded-lg bg-stone-50 border border-stone-100 space-y-1 text-xs font-mono">
                    {present3.map((f, i) => (
                      <div key={i} className="flex justify-between text-stone-600">
                        <span className="text-stone-400">{f.pronounDisplay}</span>
                        <span className="font-semibold text-stone-800">{getIsolatedVerbForm(f.form, f.pronoun)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Auxiliary {verb.auxiliary}</span>
                  <span className="text-indigo-600 font-semibold group-hover:underline">
                    Full table →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookmarked Section if any */}
      {bookmarkedVerbs.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Your Bookmarked Verbs ({bookmarkedVerbs.length})
              </h3>
            </div>
            {onViewFavorites && (
              <button
                type="button"
                onClick={onViewFavorites}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage in Favorites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {bookmarkedVerbs.map((bv) => (
              <button
                key={bv.id}
                type="button"
                onClick={() => onSelectVerb(bv)}
                className="px-3 py-1.5 bg-white hover:bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs font-medium text-stone-800 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <span className="font-serif font-bold text-stone-900">{bv.infinitive}</span>
                <span className="text-stone-400">({bv.english})</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
