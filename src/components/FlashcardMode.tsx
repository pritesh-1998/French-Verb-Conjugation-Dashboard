import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Verb, VerbProgress, VerbGroup } from '../types';
import { speakFrench, stopSpeech, preloadFrenchAudio } from '../utils/speech';
import {
  getIsolatedVerbForm,
  getStemAndEnding,
  formatSpokenConjugation,
} from '../utils/frenchFormatting';
import { getVerbMasteryStatus } from '../utils/storage';
import {
  Volume2,
  Shuffle,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Search,
  Grid,
  CreditCard,
  Play,
  Square,
} from 'lucide-react';

interface FlashcardModeProps {
  allVerbs: Verb[];
  onRecordAttempt: (verbId: string, isCorrect: boolean) => void;
  progress?: Record<string, VerbProgress>;
  onToggleBookmark?: (verbId: string) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  allVerbs,
  onRecordAttempt,
  progress = {},
  onToggleBookmark,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'all' | VerbGroup | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered deck of verbs
  const deck = useMemo(() => {
    return allVerbs.filter((verb) => {
      // Group / Bookmark filter
      if (selectedGroup === 'bookmarked') {
        if (!progress[verb.id]?.bookmarked) return false;
      } else if (selectedGroup !== 'all') {
        if (verb.group !== selectedGroup) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchInf = verb.infinitive.toLowerCase().includes(q);
        const matchEng = verb.english.toLowerCase().includes(q);
        if (!matchInf && !matchEng) return false;
      }

      return true;
    });
  }, [allVerbs, selectedGroup, searchQuery, progress]);

  // Adjust current index if deck length shrinks
  useEffect(() => {
    if (currentIndex >= deck.length && deck.length > 0) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [deck.length, currentIndex]);

  // Stop sequential audio playback on unmount or card change
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex]);

  const currentVerb = deck[currentIndex];
  const currentProgress = currentVerb ? progress[currentVerb.id] : undefined;
  const isCurrentBookmarked = !!currentProgress?.bookmarked;
  const currentMastery = getVerbMasteryStatus(currentProgress);

  // Present tense forms for all 6 pronouns
  const presentConjugations = useMemo(() => {
    if (!currentVerb) return [];
    return currentVerb.conjugations.present || [];
  }, [currentVerb]);

  // Preload authentic French audio for the active card
  useEffect(() => {
    if (currentVerb) {
      const forms = (currentVerb.conjugations?.present || []).map(
        (it) => formatSpokenConjugation(it.pronounDisplay, it.form)
      );
      preloadFrenchAudio([currentVerb.infinitive, ...forms]);
    }
  }, [currentVerb]);

  // Flip card
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    if (!isFlipped && currentVerb) {
      // Announce infinitive or first form lightly
      speakFrench(currentVerb.infinitive);
    }
  };

  // Next card
  const handleNext = () => {
    stopSequence();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  };

  // Previous card
  const handlePrevious = () => {
    stopSequence();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : deck.length - 1));
  };

  // Shuffle deck
  const handleShuffle = () => {
    stopSequence();
    setIsFlipped(false);
    if (deck.length > 1) {
      const nextIdx = Math.floor(Math.random() * deck.length);
      setCurrentIndex(nextIdx === currentIndex ? (nextIdx + 1) % deck.length : nextIdx);
    }
  };

  // Mark answer confidence and advance
  const handleMarkConfidence = (isMastered: boolean) => {
    if (currentVerb) {
      onRecordAttempt(currentVerb.id, isMastered);
    }
    handleNext();
  };

  // Stop sequential speech
  const stopSequence = () => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlayingAll(false);
    stopSpeech();
  };

  // Play all 6 present tense conjugations in sequence
  const handlePlayAllPresent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAll) {
      stopSequence();
      return;
    }

    if (!presentConjugations.length) return;

    setIsPlayingAll(true);
    let step = 0;

    const playNext = () => {
      if (step >= presentConjugations.length) {
        setIsPlayingAll(false);
        return;
      }

      const item = presentConjugations[step];
      const spokenText = formatSpokenConjugation(item.pronounDisplay, item.form);
      speakFrench(spokenText, 0.95);
      step++;

      playTimerRef.current = setTimeout(playNext, 1400);
    };

    playNext();
  };

  return (
    <div id="flashcard-module" className="max-w-4xl mx-auto space-y-6">
      {/* Title and Intro */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Digital Flashcards</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-stone-900">
              Present Tense Conjugations : All Pronouns
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Front: infinitive verb and meaning. Back: complete present tense conjugations for all pronouns (je, tu, il/elle/on, nous, vous, ils/elles).
            </p>
          </div>

          {/* View mode toggle: Single Focused Card vs Full Grid */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              id="flashcard-view-single-btn"
              type="button"
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Focus Card</span>
            </button>
            <button
              id="flashcard-view-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View ({deck.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-600">Filter by group:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup('all');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({allVerbs.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(1);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
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
                onClick={() => {
                  setSelectedGroup(2);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
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
                onClick={() => {
                  setSelectedGroup(3);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGroup === 3
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3rd (Irregular)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup('bookmarked');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedGroup === 'bookmarked'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="flashcard-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="Search verb..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
            />
          </div>
        </div>
      </div>

      {deck.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
          <p className="text-stone-600 font-medium text-sm">
            No verbs match the selected criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === 'single' ? (
        /* SINGLE FOCUSED FLASHCARD VIEW */
        <div className="space-y-4">
          {/* Deck Navigation Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800 font-mono">
                Card {currentIndex + 1} / {deck.length}
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-500 font-medium">
                {Math.round(((currentIndex + 1) / deck.length) * 100)}% of deck
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="flashcard-shuffle-btn"
                type="button"
                onClick={handleShuffle}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                title="Shuffle cards"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              <div className="h-4 w-px bg-stone-200" />

              <button
                id="flashcard-prev-btn"
                type="button"
                onClick={handlePrevious}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="flashcard-next-btn"
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Next card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Progress Bar */}
          <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* THE DIGITAL FLASHCARD */}
          <div
            id="flashcard-active-card"
            onClick={handleFlip}
            className="cursor-pointer select-none perspective-1000 group"
          >
            <div
              className={`w-full min-h-[440px] sm:min-h-[460px] rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-md border flex flex-col justify-between relative overflow-hidden ${
                isFlipped
                  ? 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 border-stone-800'
                  : 'bg-white text-stone-900 border-stone-200/90 hover:border-indigo-300 hover:shadow-lg'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between gap-2 border-b pb-4 border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      isFlipped
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {isFlipped ? 'BACK: Present Indicative' : 'FRONT: Infinitive'}
                  </span>

                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      isFlipped ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {currentVerb.group === 1
                      ? '1st group (-er)'
                      : currentVerb.group === 2
                      ? '2nd group (-ir)'
                      : '3rd group (irregular)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleBookmark && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(currentVerb.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isCurrentBookmarked
                          ? 'text-amber-400 bg-amber-500/10'
                          : isFlipped
                          ? 'text-stone-500 hover:text-stone-300'
                          : 'text-stone-300 hover:text-stone-600'
                      }`}
                      title={isCurrentBookmarked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-amber-400' : ''}`}
                      />
                    </button>
                  )}

                  <span
                    className={`text-xs flex items-center gap-1 font-medium ${
                      isFlipped ? 'text-indigo-300' : 'text-stone-400'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                    <span className="hidden sm:inline">Click to flip</span>
                  </span>
                </div>
              </div>

              {/* Card Center Content */}
              {!isFlipped ? (
                /* RECTO: INFINITIVE SIDE */
                <div className="my-auto py-10 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">
                    <span>Auxiliary: {currentVerb.auxiliary}</span>
                    <span>•</span>
                    <span>Past Participle: {currentVerb.pastParticiple}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <h3 className="text-5xl sm:text-6xl font-bold font-serif tracking-tight text-stone-950">
                      {currentVerb.infinitive}
                    </h3>
                    <button
                      id="flashcard-speak-infinitive-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakFrench(currentVerb.infinitive);
                      }}
                      className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      title="Pronounce infinitive"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xl sm:text-2xl text-stone-600 font-serif italic max-w-md mx-auto">
                    "{currentVerb.english}"
                  </p>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>
                        Click card to reveal present tense conjugations for all 6 pronouns
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* VERSO: PRESENT TENSE CONJUGATIONS FOR ALL 6 PRONOUNS */
                <div className="my-auto py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        Full Conjugation • Present Tense
                      </div>
                      <h4 className="text-2xl font-bold font-serif text-white">
                        {currentVerb.infinitive}{' '}
                        <span className="text-sm font-normal text-stone-400 font-sans italic">
                          ("{currentVerb.english}")
                        </span>
                      </h4>
                    </div>

                    <button
                      id="flashcard-speak-all-btn"
                      type="button"
                      onClick={handlePlayAllPresent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPlayingAll
                          ? 'bg-rose-600 text-white hover:bg-rose-500'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                      title="Listen to all present forms in succession"
                    >
                      {isPlayingAll ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Listen to all</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 6 Pronouns Grid: je, tu, il/elle/on, nous, vous, ils/elles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {presentConjugations.map((item, idx) => {
                      const split = getStemAndEnding(item);
                      const isolatedForm = getIsolatedVerbForm(item.form, item.pronoun);
                      const spokenPhrase = formatSpokenConjugation(item.pronounDisplay, item.form);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-200"
                        >
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-xs font-semibold text-stone-400 w-24 shrink-0">
                              {item.pronounDisplay}
                            </span>
                            <span className="text-base font-bold text-white tracking-wide">
                              {split ? (
                                <>
                                  <span>{split.stem}</span>
                                  <span className="text-indigo-400 font-extrabold underline decoration-indigo-500/40">
                                    {split.ending}
                                  </span>
                                </>
                              ) : (
                                <span>{isolatedForm}</span>
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakFrench(spokenPhrase);
                            }}
                            className="p-1 rounded-lg text-stone-400 hover:text-indigo-300 hover:bg-stone-700/80 transition-colors shrink-0 cursor-pointer"
                            title={`Listen to "${spokenPhrase}"`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Context sentence & Tip */}
                  <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/40 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-stone-200 font-serif italic">
                          « {currentVerb.example.fr} »
                        </p>
                        <p className="text-stone-400 text-[11px] mt-0.5">
                          {currentVerb.example.en}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakFrench(currentVerb.example.fr);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
                        title="Listen to example sentence"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {currentVerb.tip && (
                      <p className="text-[11px] text-amber-300 pt-1.5 border-t border-stone-700/50">
                        Memory Tip: {currentVerb.tip}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Card Bottom Row */}
              <div className="border-t pt-4 border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className={isFlipped ? 'text-stone-400' : 'text-stone-500'}>
                  Mastery Status:{' '}
                  <strong className="font-semibold text-stone-700 dark:text-stone-300">
                    {currentMastery === 'mastered'
                      ? '✓ Mastered'
                      : currentMastery === 'learning'
                      ? '⏳ Learning'
                      : currentMastery === 'struggling'
                      ? '⚠️ Needs Review'
                      : '⚪ Not Studied'}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className={`px-3 py-1 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    isFlipped
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'View Front (Infinitive)' : 'View Back (6 Pronouns)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Confidence Rating Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              id="flashcard-mark-review-btn"
              type="button"
              onClick={() => handleMarkConfidence(false)}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Needs Review</span>
            </button>

            <button
              id="flashcard-flip-action-btn"
              type="button"
              onClick={handleFlip}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-stone-600" />
              <span>{isFlipped ? 'Flip to Front' : 'Flip to Back'}</span>
            </button>

            <button
              id="flashcard-mark-mastered-btn"
              type="button"
              onClick={() => handleMarkConfidence(true)}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Mastered!</span>
            </button>
          </div>
        </div>
      ) : (
        /* GRID VIEW: ALL CARDS IN DECK */
        <div className="space-y-4">
          <div className="text-xs text-stone-500 font-medium">
            Click any card to view its complete present tense conjugations.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deck.map((verb, idx) => {
              const presentForms = verb.conjugations.present || [];
              const isBm = !!progress[verb.id]?.bookmarked;

              return (
                <GridFlashcardCard
                  key={verb.id}
                  verb={verb}
                  index={idx}
                  presentForms={presentForms}
                  isBookmarked={isBm}
                  onToggleBookmark={onToggleBookmark}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* Mini card component for Grid View */
interface GridFlashcardCardProps {
  verb: Verb;
  index: number;
  presentForms: Verb['conjugations']['present'];
  isBookmarked: boolean;
  onToggleBookmark?: (id: string) => void;
}

const GridFlashcardCard: React.FC<GridFlashcardCardProps> = ({
  verb,
  index,
  presentForms,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={`rounded-2xl p-5 border transition-all cursor-pointer min-h-[300px] flex flex-col justify-between select-none ${
        flipped
          ? 'bg-stone-900 text-white border-stone-800 shadow-md'
          : 'bg-white text-stone-900 border-stone-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
              flipped ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600'
            }`}
          >
            #{index + 1} • {verb.group === 1 ? '1st' : verb.group === 2 ? '2nd' : '3rd'} gr.
          </span>

          <div className="flex items-center gap-1.5">
            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(verb.id);
                }}
                className={`p-1 rounded ${
                  isBookmarked ? 'text-amber-400' : 'text-stone-300 hover:text-stone-600'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speakFrench(verb.infinitive);
              }}
              className={`p-1 rounded ${
                flipped
                  ? 'text-stone-400 hover:text-white'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!flipped ? (
          <div className="mt-8 text-center space-y-2">
            <h4 className="text-3xl font-bold font-serif text-stone-950">
              {verb.infinitive}
            </h4>
            <p className="text-sm text-stone-500 font-serif italic">
              "{verb.english}"
            </p>
            <div className="pt-4 text-[11px] text-stone-400">
              Auxiliary {verb.auxiliary} • Participle: {verb.pastParticiple}
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Present Indicative
            </div>
            {presentForms.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-stone-800/80 text-stone-200"
              >
                <span className="text-stone-400 text-[11px]">{item.pronounDisplay}</span>
                <span className="font-semibold text-white">
                  {getIsolatedVerbForm(item.form, item.pronoun)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
        <span className={flipped ? 'text-stone-400' : 'text-stone-500'}>
          {flipped ? 'Back (6 pronouns)' : 'Front (Infinitive)'}
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
          <RotateCw className="w-3 h-3" />
          <span>Flip</span>
        </span>
      </div>
    </div>
  );
};
