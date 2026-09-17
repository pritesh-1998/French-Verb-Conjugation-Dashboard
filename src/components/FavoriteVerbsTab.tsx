import React, { useState, useMemo } from 'react';
import { Verb, VerbProgress, VerbGroup } from '../types';
import { getVerbMasteryStatus } from '../utils/storage';
import { speakFrench } from '../utils/speech';
import { getIsolatedVerbForm, getStemAndEnding } from '../utils/frenchFormatting';
import { getAllFavoriteVerbs } from '../utils/conjugator';
import { AddVerbsDialog } from './AddVerbsDialog';
import {
  Bookmark,
  BookmarkPlus,
  Search,
  Volume2,
  Filter,
  Sparkles,
  HelpCircle,
  Layers,
  CheckCircle2,
  Trash2,
  Plus,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface FavoriteVerbsTabProps {
  progress: Record<string, VerbProgress>;
  onSelectVerb: (verb: Verb) => void;
  onToggleBookmark: (verbId: string) => void;
  onStartQuizWithFavorites: () => void;
  onOpenFlashcardsWithFavorites: () => void;
  onBrowseLibrary: () => void;
  onBatchVerbsAdded: (newVerbs: Verb[]) => void;
}

export const FavoriteVerbsTab: React.FC<FavoriteVerbsTabProps> = ({
  progress,
  onSelectVerb,
  onToggleBookmark,
  onStartQuizWithFavorites,
  onOpenFlashcardsWithFavorites,
  onBrowseLibrary,
  onBatchVerbsAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'all' | VerbGroup>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'infinitive' | 'mastery' | 'group'>('infinitive');

  // Dynamically load all favorited/bookmarked verbs
  const favoriteVerbs = useMemo(() => {
    return getAllFavoriteVerbs(progress);
  }, [progress]);

  // Filtered and sorted verbs
  const filteredVerbs = useMemo(() => {
    return favoriteVerbs
      .filter((v) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchInf = v.infinitive.toLowerCase().includes(q);
          const matchEng = v.english.toLowerCase().includes(q);
          if (!matchInf && !matchEng) return false;
        }

        // Group filter
        if (selectedGroup !== 'all' && v.group !== selectedGroup) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'infinitive') {
          return a.infinitive.localeCompare(b.infinitive, 'fr');
        }
        if (sortBy === 'group') {
          return a.group - b.group || a.infinitive.localeCompare(b.infinitive, 'fr');
        }
        if (sortBy === 'mastery') {
          const statusOrder: Record<string, number> = {
            struggling: 0,
            learning: 1,
            unstudied: 2,
            mastered: 3,
          };
          const statusA = getVerbMasteryStatus(progress[a.id]);
          const statusB = getVerbMasteryStatus(progress[b.id]);
          return (statusOrder[statusA] ?? 9) - (statusOrder[statusB] ?? 9);
        }
        return 0;
      });
  }, [favoriteVerbs, searchQuery, selectedGroup, sortBy, progress]);

  // Quick stats
  const masteryCounts = useMemo(() => {
    const counts = { mastered: 0, learning: 0, struggling: 0, unstudied: 0 };
    favoriteVerbs.forEach((v) => {
      const status = getVerbMasteryStatus(progress[v.id]);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [favoriteVerbs, progress]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                <Bookmark className="w-5 h-5 fill-amber-500 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
                    Favorite Verbs
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200/80">
                    {favoriteVerbs.length} {favoriteVerbs.length === 1 ? 'verb' : 'verbs'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Your bookmarked collection for targeted practice drills, quizzes, and conjugation review.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* The requested "+ Add Verbs" button opening the dialogue box */}
            <button
              type="button"
              onClick={() => setIsAddDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 font-bold text-xs shadow-xs transition-all cursor-pointer shadow-amber-500/10"
              title="Add verbs by typing a comma-separated list"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>+ Add Verbs (Comma List)</span>
            </button>

            {favoriteVerbs.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onStartQuizWithFavorites}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                  title="Quiz your favorite verbs"
                >
                  <HelpCircle className="w-4 h-4 text-rose-400" />
                  <span>Quiz Favorites</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenFlashcardsWithFavorites}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs border border-stone-200 transition-colors cursor-pointer"
                  title="Flashcards of favorite verbs"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Flashcards</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Strip if favorites exist */}
        {favoriteVerbs.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-600">
            <span className="font-semibold text-stone-700">Mastery Breakdown:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Mastered: <strong>{masteryCounts.mastered}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Learning: <strong>{masteryCounts.learning}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Struggling: <strong>{masteryCounts.struggling}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span>Unstudied: <strong>{masteryCounts.unstudied}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Group Filter, Sorting */}
      {favoriteVerbs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by French or English..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Group Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedGroup === 'all'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Groups ({favoriteVerbs.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedGroup === 1
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              1er (-er)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedGroup === 2
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              2e (-ir)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedGroup === 3
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              3e (Irrégulier)
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 shrink-0">
            <span className="hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-stone-800 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="infinitive">Alphabetical (A-Z)</option>
              <option value="mastery">Mastery (Needs Review First)</option>
              <option value="group">Verb Group</option>
            </select>
          </div>
        </div>
      )}

      {/* Verbs List / Grid */}
      {filteredVerbs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVerbs.map((verb) => {
            const mastery = getVerbMasteryStatus(progress[verb.id]);
            const presentForms = verb.conjugations?.present || [];

            return (
              <div
                key={verb.id}
                onClick={() => onSelectVerb(verb)}
                className="bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  {/* Card Header: Infinitive + English + Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-serif text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors truncate">
                          {verb.infinitive}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakFrench(verb.infinitive);
                          }}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                          title={`Listen to "${verb.infinitive}"`}
                        >
                          <Volume2 className="w-4 h-4 text-indigo-600" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {verb.english}
                      </p>
                    </div>

                    {/* Bookmark toggle button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(verb.id);
                      }}
                      className="p-2 rounded-xl text-amber-500 bg-amber-50 hover:bg-rose-50 hover:text-rose-600 border border-amber-200 hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500 group-hover:fill-rose-500" />
                    </button>
                  </div>

                  {/* Badges: Group & Auxiliary & Mastery */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {verb.group === 1 ? '1er groupe' : verb.group === 2 ? '2e groupe' : '3e groupe'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      Aux: {verb.auxiliary}
                    </span>

                    {/* Mastery pill */}
                    {mastery === 'mastered' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Mastered</span>
                      </span>
                    )}
                    {mastery === 'learning' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        Learning
                      </span>
                    )}
                    {mastery === 'struggling' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        Needs Review
                      </span>
                    )}
                    {mastery === 'unstudied' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-500">
                        Unstudied
                      </span>
                    )}
                  </div>

                  {/* Present tense snippet (6 forms) */}
                  <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    {presentForms.slice(0, 6).map((item, idx) => {
                      const split = getStemAndEnding(item);
                      const isolated = getIsolatedVerbForm(item.form, item.pronoun);

                      return (
                        <div key={idx} className="flex items-center justify-between text-stone-600 font-mono text-[11px] py-0.5">
                          <span className="text-stone-400 truncate pr-1">
                            {item.pronounDisplay.split('/')[0]}
                          </span>
                          <span className="font-semibold text-stone-800 truncate">
                            {split ? (
                              <>
                                <span>{split.stem}</span>
                                <span className="text-indigo-600 font-extrabold underline decoration-indigo-300">
                                  {split.ending}
                                </span>
                              </>
                            ) : (
                              isolated
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-[11px]">Click to inspect 7 tenses</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-700 group-hover:text-amber-800">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : favoriteVerbs.length > 0 ? (
        /* Search has no results */
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
          <p className="text-stone-600 text-sm">
            No favorite verbs match your search "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('all');
            }}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Empty State: No favorites yet */
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-10 text-center max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <Bookmark className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Your Favorites List is Empty
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
              Build your custom study deck by typing or pasting a comma-separated list of verbs, or by clicking the bookmark icon on any verb in the library.
            </p>
          </div>

          {/* Large Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 font-bold text-sm shadow-xs transition-all cursor-pointer shadow-amber-500/10"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>+ Add Verbs by Comma List</span>
            </button>

            <button
              type="button"
              onClick={onBrowseLibrary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm border border-stone-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse 7,000+ Verb Library</span>
            </button>
          </div>

          {/* Quick suggestions to populate instantly */}
          <div className="pt-6 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Or quick-add a curated set:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddDialogOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 text-xs font-medium transition-colors cursor-pointer"
              >
                + Top 10 French Essentials (être, avoir, aller, faire...)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddDialogOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 text-xs font-medium transition-colors cursor-pointer"
              >
                + Movement Verbs (aller, venir, partir, sortir...)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Box for adding comma-separated verbs */}
      <AddVerbsDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        progress={progress}
        onVerbsAdded={(newVerbs) => {
          onBatchVerbsAdded(newVerbs);
        }}
      />
    </div>
  );
};
