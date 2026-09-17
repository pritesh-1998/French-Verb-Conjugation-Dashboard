import React, { useState } from 'react';
import { Verb, TenseId, QuizType, VerbPoolType, VerbProgress } from '../../types';
import { TENSES } from '../../data/tenses';
import { searchAnyFrenchVerb, conjugateVerbFromLibrary, TOTAL_EXTERNAL_VERBS_COUNT } from '../../utils/conjugator';
import {
  ListFilter,
  Layers,
  Sparkles,
  Play,
  Star,
  BookOpen,
  Keyboard,
  HelpCircle,
  Link as LinkIcon,
  TableProperties,
  Check,
  AlertCircle,
  Search,
  Globe2,
  X,
} from 'lucide-react';

interface QuizSetupProps {
  allVerbs: Verb[];
  progress?: Record<string, VerbProgress>;
  selectedPoolType: VerbPoolType;
  setSelectedPoolType: (p: VerbPoolType) => void;
  customPoolGroups: number[];
  setCustomPoolGroups: (groups: number[]) => void;
  customPoolOnlyFavorites: boolean;
  setCustomPoolOnlyFavorites: (onlyFav: boolean) => void;
  quizType: QuizType;
  setQuizType: (t: QuizType) => void;
  selectedTenses: TenseId[];
  onToggleTense: (id: TenseId) => void;
  questionCount: number;
  setQuestionCount: (c: number) => void;
  onStartQuiz: () => void;
  computedPoolCount: number;
  specificVerb?: Verb | null;
  onSelectSpecificVerb?: (verb: Verb | null) => void;
  allFavoritesCount?: number;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({
  allVerbs,
  progress = {},
  selectedPoolType,
  setSelectedPoolType,
  customPoolGroups,
  setCustomPoolGroups,
  customPoolOnlyFavorites,
  setCustomPoolOnlyFavorites,
  quizType,
  setQuizType,
  selectedTenses,
  onToggleTense,
  questionCount,
  setQuestionCount,
  onStartQuiz,
  computedPoolCount,
  specificVerb,
  onSelectSpecificVerb,
  allFavoritesCount = 0,
}) => {
  const favoriteCount = allFavoritesCount || allVerbs.filter((v) => progress[v.id]?.bookmarked).length;
  const group1Count = allVerbs.filter((v) => v.group === 1).length;
  const group2Count = allVerbs.filter((v) => v.group === 2).length;
  const group3Count = allVerbs.filter((v) => v.group === 3).length;

  const [verbSearchQuery, setVerbSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchAnyFrenchVerb>>([]);

  const handleSearchChange = (query: string) => {
    setVerbSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchAnyFrenchVerb(query, 6);
    setSearchResults(results);
  };

  const handlePickSpecificVerb = (infinitive: string) => {
    try {
      const conjugated = conjugateVerbFromLibrary(infinitive);
      if (onSelectSpecificVerb) {
        onSelectSpecificVerb(conjugated);
      }
      setSelectedPoolType('specific');
      setVerbSearchQuery('');
      setSearchResults([]);
    } catch {
      // ignore
    }
  };

  const toggleCustomGroup = (group: number) => {
    if (customPoolGroups.includes(group)) {
      if (customPoolGroups.length > 1) {
        setCustomPoolGroups(customPoolGroups.filter((g) => g !== group));
      }
    } else {
      setCustomPoolGroups([...customPoolGroups, group]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-linear-to-br from-stone-900 via-stone-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Conjugation Workshop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white mb-2">
            Configure Your Conjugation Quiz
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Target your favorite verbs, filter by groups, practice a specific verb from 7,000+ verbs, and test with immediate mistake auto-correction.
          </p>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Verb Selection Pool */}
        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm sm:text-base">
                <ListFilter className="w-4 h-4 text-indigo-600" />
                <span>1. Verb Pool Selection</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 font-mono font-bold text-stone-700">
                {computedPoolCount} eligible verbs
              </span>
            </div>

            {/* Verb pool options */}
            <div className="space-y-2 mb-4">
              {/* All Curated */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('all')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'all'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'all'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'all' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Curated Core Verbs</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      35 highest-frequency verbs of daily conversation
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-mono">{allVerbs.length}</span>
              </button>

              {/* Favorites Only */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('favorites')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'favorites'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'favorites'
                        ? 'border-amber-600 bg-amber-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'favorites' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>Starred Favorites Only</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Practice only verbs you have starred in library or flashcards
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-mono font-semibold">{favoriteCount}</span>
              </button>

              {/* 1st Group (-er) */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('group1')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'group1'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'group1'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'group1' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">1st Group Regular (-er)</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      e.g. parler, aimer, chanter, habiter
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-mono">{group1Count}</span>
              </button>

              {/* 2nd Group (-ir) */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('group2')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'group2'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'group2'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'group2' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">2nd Group (-ir / -issons)</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      e.g. finir, choisir, réussir, obéir
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-mono">{group2Count}</span>
              </button>

              {/* 3rd Group (Irréguliers) */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('group3')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'group3'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'group3'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'group3' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">3rd Group & Irregulars</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      e.g. être, avoir, aller, faire, prendre, pouvoir
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-mono">{group3Count}</span>
              </button>

              {/* Custom Mix */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('custom')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'custom'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'custom' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Custom Mix (Groups & Favorites)</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Combine selected groups and optionally filter to favorites
                    </div>
                  </div>
                </div>
              </button>

              {/* Full 7,000+ Library */}
              <button
                type="button"
                onClick={() => setSelectedPoolType('library7000')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPoolType === 'library7000'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-semibold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPoolType === 'library7000'
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPoolType === 'library7000' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Expanded 7,000+ Verbs Library</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Draw random verbs across the entire French dictionary
                    </div>
                  </div>
                </div>
                <span className="text-xs text-teal-700 font-mono font-semibold">
                  {TOTAL_EXTERNAL_VERBS_COUNT.toLocaleString()}
                </span>
              </button>
            </div>

            {/* Custom Multi-select Sub-panel */}
            {selectedPoolType === 'custom' && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 mb-4 animate-in fade-in duration-150">
                <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wide">
                  Groups included in the mix:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCustomGroup(1)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      customPoolGroups.includes(1)
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    1st gr. (-er)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCustomGroup(2)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      customPoolGroups.includes(2)
                        ? 'bg-blue-100 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    2nd gr. (-ir)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCustomGroup(3)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      customPoolGroups.includes(3)
                        ? 'bg-purple-100 border-purple-300 text-purple-900 font-semibold'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    3rd gr. (Irreg.)
                  </button>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={customPoolOnlyFavorites}
                    onChange={(e) => setCustomPoolOnlyFavorites(e.target.checked)}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Restrict these groups to <strong>Starred Favorites</strong> only</span>
                </label>
              </div>
            )}

            {/* Drill a Specific Verb from 7,000+ Library */}
            <div className="pt-3 border-t border-stone-200/80">
              <div className="text-xs font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Practice a Specific Verb</span>
                </span>
                {specificVerb && selectedPoolType === 'specific' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                    Active: {specificVerb.infinitive}
                  </span>
                )}
              </div>

              {specificVerb && selectedPoolType === 'specific' ? (
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-950 font-serif">
                      {specificVerb.infinitive}
                    </span>
                    <span className="text-xs text-indigo-700 italic ml-2">
                      "{specificVerb.english}"
                    </span>
                    <div className="text-[10px] text-indigo-600 mt-0.5">
                      Group {specificVerb.group} • Auxiliary: {specificVerb.auxiliary}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectSpecificVerb) onSelectSpecificVerb(null);
                      setSelectedPoolType('all');
                    }}
                    className="p-1 rounded-lg text-indigo-400 hover:text-indigo-800 cursor-pointer"
                    title="Clear selected verb"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      value={verbSearchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search any verb (e.g. résoudre, chanter, pouvoir)..."
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-stone-200 p-1.5 z-20 max-h-48 overflow-y-auto space-y-1">
                      {searchResults.map((res) => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => handlePickSpecificVerb(res.infinitive)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-indigo-50 flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <div>
                            <span className="font-semibold text-stone-900 group-hover:text-indigo-700 font-serif">
                              {res.infinitive}
                            </span>
                            <span className="text-stone-400 italic ml-1.5 text-[11px]">
                              "{res.english}"
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            Gr. {res.group}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Empty Favorites Warning */}
            {selectedPoolType === 'favorites' && favoriteCount === 0 && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>You don't have any bookmarked verbs yet.</strong>
                  <p className="mt-0.5 text-amber-800">
                    Bookmark verbs by clicking the star (★) in the verb library or flashcards, or select a group above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Quiz Type & Format */}
        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm sm:text-base">
                <TableProperties className="w-4 h-4 text-indigo-600" />
                <span>2. Quiz Practice Mode</span>
              </div>
            </div>

            {/* 4 Quiz Types */}
            <div className="space-y-2.5 mb-5">
              {/* Full Table */}
              <button
                type="button"
                onClick={() => setQuizType('full-table')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  quizType === 'full-table'
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      quizType === 'full-table'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <TableProperties className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        Full Table (All 6 Pronouns)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Fill in all 6 pronoun conjugations for one verb, get instant auto-correction with highlighted mistakes, then move to the next verb.
                    </p>
                  </div>
                </div>
              </button>

              {/* Typing */}
              <button
                type="button"
                onClick={() => setQuizType('typing')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  quizType === 'typing'
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      quizType === 'typing' ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                      Single Form Typing
                    </span>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Type the exact conjugated form for a given pronoun with built-in French accent keys and automatic correction feedback.
                    </p>
                  </div>
                </div>
              </button>

              {/* Multiple Choice */}
              <button
                type="button"
                onClick={() => setQuizType('multiple-choice')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  quizType === 'multiple-choice'
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      quizType === 'multiple-choice'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                      Multiple Choice
                    </span>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Select the correct conjugation among 4 options with grammatical hints and distractor analysis.
                    </p>
                  </div>
                </div>
              </button>

              {/* Match The Following */}
              <button
                type="button"
                onClick={() => setQuizType('match')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  quizType === 'match'
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      quizType === 'match' ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        Match Pairs (Pronoun to Conjugation)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                        Interactive
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Link each subject pronoun with its corresponding conjugated verb form. Real-time feedback and sound effects.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tense and Question Count Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenses Multi-select (takes 2 cols) */}
        <div className="md:col-span-2 rounded-2xl bg-white p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-900 font-semibold text-sm sm:text-base">
              3. Tenses to Practice
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {selectedTenses.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TENSES.map((t) => {
              const active = selectedTenses.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onToggleTense(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    active
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>
                    {t.nameEn} ({t.nameFr})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question / Verb Count (takes 1 col) */}
        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-stone-900 font-semibold text-sm sm:text-base mb-3">
              4. Number of Questions / Tables
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    questionCount === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            id="start-quiz-configured-btn"
            type="button"
            disabled={computedPoolCount === 0 || selectedTenses.length === 0}
            onClick={onStartQuiz}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              computedPoolCount === 0 || selectedTenses.length === 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-stone-950 text-white hover:bg-stone-800 hover:translate-y-[-1px]'
            }`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              Start Practice Session ({questionCount}{' '}
              {quizType === 'full-table' ? 'tables' : 'questions'})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
