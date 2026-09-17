import React, { useState, useMemo } from 'react';
import { Verb, VerbProgress, VerbGroup, AuxiliaryVerb } from '../types';
import { getVerbMasteryStatus } from '../utils/storage';
import { speakFrench } from '../utils/speech';
import { getIsolatedVerbForm } from '../utils/frenchFormatting';
import { Search, Volume2, Bookmark, CheckCircle2, ChevronRight, Filter, Sparkles, Database, BookOpen, ArrowRight } from 'lucide-react';
import { searchAnyFrenchVerb, conjugateVerbFromLibrary, TOTAL_EXTERNAL_VERBS_COUNT } from '../utils/conjugator';

interface VerbLibraryProps {
  verbs: Verb[];
  progress: Record<string, VerbProgress>;
  onSelectVerb: (verb: Verb) => void;
  onToggleBookmark: (verbId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const VerbLibrary: React.FC<VerbLibraryProps> = ({
  verbs,
  progress,
  onSelectVerb,
  onToggleBookmark,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'all' | VerbGroup>('all');
  const [selectedAuxiliary, setSelectedAuxiliary] = useState<'all' | AuxiliaryVerb>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'mastered' | 'learning' | 'struggling' | 'unstudied' | 'bookmarked'
  >('all');
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'curated' | 'external'>('curated');

  // Filter curated verbs
  const filteredCuratedVerbs = useMemo(() => {
    return verbs.filter((v) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchInf = v.infinitive.toLowerCase().includes(q);
        const matchEng = v.english.toLowerCase().includes(q);
        const matchPp = v.pastParticiple.toLowerCase().includes(q);
        if (!matchInf && !matchEng && !matchPp) return false;
      }

      // Group filter
      if (selectedGroup !== 'all' && v.group !== selectedGroup) return false;

      // Auxiliary filter
      if (selectedAuxiliary !== 'all' && v.auxiliary !== selectedAuxiliary) return false;

      // Status filter
      if (selectedStatus === 'bookmarked') {
        if (!progress[v.id]?.bookmarked) return false;
      } else if (selectedStatus !== 'all') {
        const status = getVerbMasteryStatus(progress[v.id]);
        if (status !== selectedStatus) return false;
      }

      return true;
    });
  }, [verbs, progress, searchQuery, selectedGroup, selectedAuxiliary, selectedStatus]);

  // Search external library (7,014 verbs)
  const externalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Suggest interesting advanced verbs when no query
      return [
        'résoudre', 'peindre', 'craindre', 'vaincre', 'cueillir',
        'conduire', 'courir', 'vivre', 'paraître', 'traduire', 'plaire', 'croire'
      ].map((inf) => {
        const v = conjugateVerbFromLibrary(inf);
        return {
          id: v.id,
          infinitive: v.infinitive,
          english: v.english,
          group: v.group,
          auxiliary: v.auxiliary,
          isCurated: false,
        };
      });
    }
    return searchAnyFrenchVerb(searchQuery, 18);
  }, [searchQuery]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakFrench(text);
  };

  const handleSelectExternal = (infinitive: string) => {
    const full = conjugateVerbFromLibrary(infinitive);
    onSelectVerb(full);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>{TOTAL_EXTERNAL_VERBS_COUNT.toLocaleString()} Verbs Library</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              French Verb Directory & Conjugation Library
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Explore essential curated verbs or search and conjugate any French verb across all 7 tenses & moods.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search any French verb (e.g. être, résoudre)..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
            />
          </div>
        </div>

        {/* View Switcher: Curated Essentials vs Full 7,000+ Verbs */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setActiveDirectoryTab('curated')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeDirectoryTab === 'curated'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Core Verbs ({verbs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDirectoryTab('external')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeDirectoryTab === 'external'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore 7,000+ Verbs Database</span>
          </button>
        </div>

        {/* Filters (only for curated tab) */}
        {activeDirectoryTab === 'curated' && (
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Group pills */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(1)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 1
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1st (-er)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(2)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 2
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2nd (-ir)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(3)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 3
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3rd (Irregular)
              </button>
            </div>

            {/* Auxiliary pills */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedAuxiliary('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedAuxiliary === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Aux: All
              </button>
              <button
                type="button"
                onClick={() => setSelectedAuxiliary('avoir')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedAuxiliary === 'avoir'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Avoir
              </button>
              <button
                type="button"
                onClick={() => setSelectedAuxiliary('être')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedAuxiliary === 'être'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Être
              </button>
            </div>

            {/* Status selector */}
            <select
              value={selectedStatus}
              aria-label="Filter by mastery status"
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as
                    | 'all'
                    | 'mastered'
                    | 'learning'
                    | 'struggling'
                    | 'unstudied'
                    | 'bookmarked'
                )
              }
              className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              <option value="all">All Statuses</option>
              <option value="mastered">✓ Mastered</option>
              <option value="learning">⏳ Learning</option>
              <option value="struggling">⚠️ Needs Practice</option>
              <option value="unstudied">⚪ Not Started</option>
              <option value="bookmarked">⭐ Bookmarked Only</option>
            </select>

            <span className="ml-auto text-stone-600 font-mono text-xs">
              {filteredCuratedVerbs.length} verb{filteredCuratedVerbs.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* External 7,000+ Library Browser View */}
      {activeDirectoryTab === 'external' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              {searchQuery.trim()
                ? `Results for "${searchQuery}" in 7,000+ verb database`
                : 'Featured & irregular French verbs from 7,000+ database'}
            </span>
            <span>{externalSearchResults.length} verbs shown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalSearchResults.map((verb) => (
              <div
                key={verb.id}
                onClick={() => handleSelectExternal(verb.infinitive)}
                className="bg-white rounded-xl border border-stone-200 hover:border-indigo-400 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-serif text-stone-900 group-hover:text-indigo-600 transition-colors">
                        {verb.infinitive}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => handleSpeak(e, verb.infinitive)}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      7k Library
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 font-serif italic mt-1">
                    "{verb.english}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                      {verb.group === 1 ? '1st group (-er)' : verb.group === 2 ? '2nd group (-ir)' : '3rd group (irreg)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                      Aux: {verb.auxiliary}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span className="text-stone-500 text-[11px] font-normal">Click to conjugate all 7 tenses</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Tables</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {searchQuery.trim() && (
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-indigo-950">Looking for a specific verb? </span>
                <span className="text-indigo-800">You can conjugate any French infinitive in the search bar above.</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectExternal(searchQuery.trim())}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Conjugate "{searchQuery.trim()}" now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Curated Core Verbs Grid */}
      {activeDirectoryTab === 'curated' && (
        <>
          {filteredCuratedVerbs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
              <p className="text-stone-500 font-medium text-sm">
                No verbs matched your filters in the curated essentials list.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setSelectedGroup('all');
                    setSelectedAuxiliary('all');
                    setSelectedStatus('all');
                  }}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setActiveDirectoryTab('external')}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Search in 7,000+ Verb Database
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCuratedVerbs.map((verb) => {
                const verbProgress = progress[verb.id];
                const status = getVerbMasteryStatus(verbProgress);
                const isBookmarked = !!verbProgress?.bookmarked;
                const presentSnippets = verb.conjugations.present?.slice(0, 3) || [];

                return (
                  <div
                    key={verb.id}
                    onClick={() => onSelectVerb(verb)}
                    className="bg-white rounded-xl border border-stone-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative"
                  >
                    {/* Header row */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            #{verb.frequencyRank}
                          </span>
                          <h3 className="text-xl font-bold font-serif text-stone-900 group-hover:text-indigo-600 transition-colors">
                            {verb.infinitive}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => handleSpeak(e, verb.infinitive)}
                            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            title="Listen to verb"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(verb.id);
                          }}
                          className={`p-1 rounded-full transition-colors ${
                            isBookmarked ? 'text-amber-500' : 'text-stone-300 hover:text-stone-600'
                          }`}
                          title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                        "{verb.english}"
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          {verb.group === 1 ? '1st group' : verb.group === 2 ? '2nd group' : '3rd group'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          Aux: {verb.auxiliary}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          Part: {verb.pastParticiple}
                        </span>
                      </div>

                      {/* Present sample rows */}
                      <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-1 text-xs font-mono">
                        {presentSnippets.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-stone-600">
                            <span className="text-stone-400">{item.pronounDisplay}</span>
                            <span className="font-semibold text-stone-800">{getIsolatedVerbForm(item.form, item.pronoun)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer status & inspect trigger */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        {status === 'mastered' && (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mastered
                          </span>
                        )}
                        {status === 'learning' && (
                          <span className="font-medium text-amber-700">
                            ⏳ Learning
                          </span>
                        )}
                        {status === 'struggling' && (
                          <span className="font-medium text-rose-700">
                            ⚠️ Needs Practice
                          </span>
                        )}
                        {status === 'unstudied' && (
                          <span className="text-stone-400">Not started</span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Conjugations</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

