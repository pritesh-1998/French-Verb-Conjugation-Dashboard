import React from 'react';
import { Verb, UserStats, VerbProgress } from '../types';
import { StatsBanner } from './StatsBanner';
import { VerbOfTheDay } from './VerbOfTheDay';
import { speakFrench } from '../utils/speech';
import { getAllFavoriteVerbs } from '../utils/conjugator';
import { ArrowRight, Volume2, Sparkles, Bookmark, CheckCircle2, Clock } from 'lucide-react';

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
  onPracticePasseCompose?: () => void;
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
  onPracticePasseCompose,
}) => {
  // Top 6 most essential verbs
  const topVerbs = allVerbs.slice(0, 6);

  // Bookmarked verbs (including dynamic 7,000+ library favorites)
  const bookmarkedVerbs = React.useMemo(() => {
    return getAllFavoriteVerbs(progress);
  }, [progress]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Stats */}
      <StatsBanner
        stats={stats}
        progress={progress}
        allVerbs={allVerbs}
        onStartQuiz={onStartQuiz}
        onViewLibrary={onViewLibrary}
        onReviewStruggling={onReviewStruggling}
        onOpenFlashcards={onOpenFlashcards}
        onPracticePasseCompose={onPracticePasseCompose}
      />

      {/* Featured: Passé Composé Worksheet Practice Spotlight */}
      {onPracticePasseCompose && (
        <div className="bg-gradient-to-r from-indigo-900 to-stone-900 rounded-2xl p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Nouveau : Pratique du Passé Composé</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              Transformez les phrases au Passé Composé
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Exercice à trous interactif basé sur votre feuille d'exercices : maîtrisez <em>Hier / Présentement / Demain</em>, la Maison d'Être et les participes passés.
            </p>
          </div>

          <button
            type="button"
            onClick={onPracticePasseCompose}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
          >
            <span>Commencer l'exercice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Verb of the Day */}
      <VerbOfTheDay
        verb={verbOfTheDay}
        onOpenVerb={onSelectVerb}
        isBookmarked={!!progress[verbOfTheDay.id]?.bookmarked}
        onToggleBookmark={onToggleBookmark}
      />

      {/* High-Frequency Core Verbs Section (Decongested, clean cards) */}
      <section className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
              Pillar French Verbs
            </h3>
            <p className="text-xs text-stone-500">
              The fundamental verbs representing over 50% of spoken French communication.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewLibrary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-indigo-600 cursor-pointer"
          >
            <span>View all {allVerbs.length}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topVerbs.map((verb) => {
            const verbProgress = progress[verb.id];
            const isBookmarked = !!verbProgress?.bookmarked;

            return (
              <div
                key={verb.id}
                onClick={() => onSelectVerb(verb)}
                className="bg-white rounded-xl border border-stone-200/90 hover:border-indigo-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                        #{verb.frequencyRank}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold font-serif text-stone-900 group-hover:text-indigo-600 transition-colors">
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
                    <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                      "{verb.english}"
                    </p>
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
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="capitalize">Auxiliaire : <strong>{verb.auxiliary}</strong></span>
                  <span className="text-indigo-600 font-medium group-hover:underline">
                    Conjugations →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookmarked Section if any */}
      {bookmarkedVerbs.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                Your Favorites ({bookmarkedVerbs.length})
              </h3>
            </div>
            {onViewFavorites && (
              <button
                type="button"
                onClick={onViewFavorites}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View all favorites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {bookmarkedVerbs.slice(0, 10).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVerb(v)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="font-semibold">{v.infinitive}</span>
                <span className="text-stone-400 font-normal">({v.english})</span>
              </button>
            ))}
            {bookmarkedVerbs.length > 10 && (
              <button
                type="button"
                onClick={onViewFavorites}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold"
              >
                +{bookmarkedVerbs.length - 10} more
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
