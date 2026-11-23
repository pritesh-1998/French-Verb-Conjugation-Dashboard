import React, { useState, useRef, useEffect } from 'react';
import { ViewTab, UserStats, Verb } from '../types';
import { Flame, Award, BookOpen, Layers, HelpCircle, LayoutDashboard, Search, X, Sparkles, Volume2, ArrowRight, Bookmark, Dumbbell } from 'lucide-react';
import { speakFrench } from '../utils/speech';
import { conjugateVerbFromLibrary, TOTAL_EXTERNAL_VERBS_COUNT } from '../utils/conjugator';
import type { VerbSearchResults } from '../hooks/useVerbSearch';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  stats: UserStats;
  searchQuery: string;
  searchResults: VerbSearchResults;
  onSearchChange: (q: string) => void;
  allVerbs?: Verb[];
  onSelectVerb?: (verb: Verb) => void;
  favoriteCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  stats,
  searchQuery,
  searchResults,
  onSearchChange,
  allVerbs = [],
  onSelectVerb,
  favoriteCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  // Search across all 7,014 French verbs using the external library & curated database
  // Results come from the shared, debounced search in App (useVerbSearch).
  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const infinitiveMatches = searchResults.infinitives;
    const conjugatedMatches = searchResults.conjugated;
    return [
      ...conjugatedMatches.map((match) => ({
        id: match.id,
        infinitive: match.infinitive,
        english: match.english,
        group: 3 as 1 | 2 | 3,
        auxiliary: 'avoir' as 'avoir' | 'être',
        isCurated: false,
        conjugatedForm: match.conjugatedForm,
        tenseName: match.tenseName,
      })),
      ...infinitiveMatches.map((match) => ({ ...match, conjugatedForm: undefined, tenseName: undefined })),
    ].slice(0, 10);
  }, [searchQuery, searchResults]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard events in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const item = suggestions[highlightedIndex] || suggestions[0];
        if (item && onSelectVerb) {
          const fullVerb = conjugateVerbFromLibrary(item.infinitive);
          onSelectVerb(fullVerb);
          setIsOpen(false);
        }
      } else if (searchQuery.trim()) {
        // Words and sentences are handled by the Practice search page.
        onSelectTab('practice');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (infinitive: string) => {
    if (onSelectVerb) {
      const fullVerb = conjugateVerbFromLibrary(infinitive);
      onSelectVerb(fullVerb);
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper tier: Brand and Stats */}
        <div className="flex items-center justify-between py-3.5 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            {/* Tricolore French Flag Accent */}
            <div className="flex h-7 w-1.5 rounded-full overflow-hidden shadow-xs">
              <div className="w-1/3 bg-blue-600 h-full" />
              <div className="w-1/3 bg-white h-full border-y border-stone-200" />
              <div className="w-1/3 bg-red-600 h-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  French Verb Master
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-200/80 text-stone-700 tracking-wide uppercase">
                  Studio
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-2xs"
              title="Consecutive daily study streak"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{stats.streak} {stats.streak === 1 ? 'day' : 'days'}</span>
            </div>

            {/* Total Practiced & Accuracy */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium shadow-2xs"
              title="Overall conjugation accuracy"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Score:</span>
              <strong className="font-semibold text-stone-900">{stats.totalAnswered}</strong>
              {stats.totalAnswered > 0 && (
                <span className="text-stone-500 font-mono text-[11px]">
                  ({accuracy}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lower tier: Navigation and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2">
          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('passe-compose')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'passe-compose'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Passé Composé</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 text-white">
                Worksheet
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'library'
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'favorites'
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentTab === 'favorites' ? 'fill-stone-950 text-stone-950' : 'text-amber-500 fill-amber-500/20'}`} />
              <span>Favorites</span>
              {favoriteCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    currentTab === 'favorites'
                      ? 'bg-stone-950 text-amber-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {favoriteCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'quiz'
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'flashcards'
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'rules'
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <span className="font-serif font-bold text-xs">§</span>
              <span>Rules</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('practice')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'practice'
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-indigo-500" />
              <span>Practice</span>
            </button>
          </nav>

          {/* Quick Filter & Global Verb Search with Auto-Conjugation on Enter */}
          <div ref={containerRef} className="relative w-full sm:w-88">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-header-verb-search"
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search any French verb (7,000+ library)..."
              className="w-full pl-9 pr-14 py-1.5 bg-white rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all shadow-2xs"
            />

            {/* Clear or Enter badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setIsOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 rounded border border-stone-200" title="Press Enter to conjugate">
                ↵
              </kbd>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
              <div
                id="header-verb-search-dropdown"
                className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-50 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3 py-2 bg-stone-50 text-[11px] font-semibold text-stone-500 flex items-center justify-between">
                  <span>Press Enter ↵ to view full conjugation</span>
                  <span>{suggestions.length} results</span>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {suggestions.map((verb, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <div
                        key={verb.id}
                        onClick={() => handleSelect(verb.infinitive)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isHighlighted ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-stone-900">
                                {verb.infinitive}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-stone-100 text-stone-600">
                                {verb.group === 1 ? '1st' : verb.group === 2 ? '2nd' : '3rd'} gr.
                              </span>
                              {verb.auxiliary === 'être' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-50 text-amber-800 border border-amber-200">
                                  être
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 truncate italic">
                              "{verb.english}"
                            </div>
                            {verb.conjugatedForm && verb.tenseName && (
                              <div className="text-[11px] font-mono text-indigo-700 mt-0.5">
                                {verb.conjugatedForm} · {verb.tenseName}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakFrench(verb.infinitive);
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
                            title="Listen pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-medium text-indigo-600 flex items-center gap-0.5">
                            <span>Conjugate</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
