import React, { useState, useEffect, useMemo } from 'react';
import { ViewTab, Verb, UserStats, VerbProgress } from './types';
import { ALL_VERBS } from './data/allVerbs';
import {
  loadUserStats,
  loadVerbProgress,
  recordVerbAttempt,
  toggleBookmarkVerb,
  incrementDrillCount,
  getVerbMasteryStatus,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { VerbLibrary } from './components/VerbLibrary';
import { FavoriteVerbsTab } from './components/FavoriteVerbsTab';
import { QuizMode } from './components/QuizMode';
import { FlashcardMode } from './components/FlashcardMode';
import { GrammarRules } from './components/GrammarRules';
import { VerbDetailModal } from './components/VerbDetailModal';
import { PracticeDashboard } from './components/PracticeDashboard';
import { DashboardFrenchSearch } from './components/DashboardFrenchSearch';
import { useVerbSearch } from './hooks/useVerbSearch';
import { warmFrenchFormIndex } from './utils/conjugator';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null);
  const [quizFilterVerbIds, setQuizFilterVerbIds] = useState<string[] | undefined>(undefined);

  const searchResults = useVerbSearch(searchQuery);

  // Build the conjugated-form search index in the background once the page is idle.
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(() => void warmFrenchFormIndex());
    else window.setTimeout(() => void warmFrenchFormIndex(), 500);
  }, []);

  // Persistence state
  const [stats, setStats] = useState<UserStats>(() => loadUserStats());
  const [progress, setProgress] = useState<Record<string, VerbProgress>>(() =>
    loadVerbProgress()
  );

  // Compute Verb of the day based on day of year
  const verbOfTheDay = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return ALL_VERBS[dayOfYear % ALL_VERBS.length] || ALL_VERBS[0];
  }, []);

  const handleRecordAttempt = (verbId: string, isCorrect: boolean) => {
    const { updatedProgress, updatedStats } = recordVerbAttempt(verbId, isCorrect);
    setProgress(updatedProgress);
    setStats(updatedStats);
  };

  const handleToggleBookmark = (verbId: string) => {
    const updated = toggleBookmarkVerb(verbId);
    setProgress(updated);
  };

  const favoriteCount = useMemo(() => {
    return (Object.values(progress) as VerbProgress[]).filter((p) => p.bookmarked).length;
  }, [progress]);

  const handleStartGeneralQuiz = () => {
    setQuizFilterVerbIds(undefined);
    setCurrentTab('quiz');
  };

  const handleStartFavoritesQuiz = () => {
    const favoriteIds = Object.keys(progress).filter((id) => progress[id]?.bookmarked);
    setQuizFilterVerbIds(favoriteIds.length > 0 ? favoriteIds : undefined);
    setCurrentTab('quiz');
  };

  const handleOpenFavoritesFlashcards = () => {
    setCurrentTab('flashcards');
  };

  const handleBatchVerbsAdded = () => {
    const updated = loadVerbProgress();
    setProgress(updated);
  };

  const handleReviewStruggling = () => {
    const strugglingIds = ALL_VERBS.filter(
      (v) => getVerbMasteryStatus(progress[v.id]) === 'struggling'
    ).map((v) => v.id);

    setQuizFilterVerbIds(strugglingIds.length > 0 ? strugglingIds : undefined);
    setCurrentTab('quiz');
  };

  const handleFinishQuiz = () => {
    const updatedStats = incrementDrillCount();
    setStats(updatedStats);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'library' && tab !== 'practice') setSearchQuery('');
        }}
        stats={stats}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'dashboard' && currentTab !== 'library' && currentTab !== 'practice' && q.trim()) {
            setCurrentTab('library');
          }
        }}
        allVerbs={ALL_VERBS}
        onSelectVerb={(v) => setSelectedVerb(v)}
        favoriteCount={favoriteCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardFrenchSearch
              searchQuery={searchQuery}
              searchResults={searchResults}
              onSearchChange={setSearchQuery}
              onSelectVerb={(v) => setSelectedVerb(v)}
              onOpenPractice={() => setCurrentTab('practice')}
            />
            <DashboardOverview
              stats={stats}
              progress={progress}
              allVerbs={ALL_VERBS}
              verbOfTheDay={verbOfTheDay}
              onSelectVerb={(v) => setSelectedVerb(v)}
              onToggleBookmark={handleToggleBookmark}
              onStartQuiz={handleStartGeneralQuiz}
              onViewLibrary={() => setCurrentTab('library')}
              onReviewStruggling={handleReviewStruggling}
              onOpenFlashcards={() => setCurrentTab('flashcards')}
              onViewFavorites={() => setCurrentTab('favorites')}
            />
          </div>
        )}

        {currentTab === 'library' && (
          <VerbLibrary
            verbs={ALL_VERBS}
            progress={progress}
            onSelectVerb={(v) => setSelectedVerb(v)}
            onToggleBookmark={handleToggleBookmark}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoriteVerbsTab
            progress={progress}
            onSelectVerb={(v) => setSelectedVerb(v)}
            onToggleBookmark={handleToggleBookmark}
            onStartQuizWithFavorites={handleStartFavoritesQuiz}
            onOpenFlashcardsWithFavorites={handleOpenFavoritesFlashcards}
            onBrowseLibrary={() => setCurrentTab('library')}
            onBatchVerbsAdded={handleBatchVerbsAdded}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizMode
            allVerbs={ALL_VERBS}
            progress={progress}
            onRecordAttempt={handleRecordAttempt}
            onFinishQuiz={handleFinishQuiz}
            initialFilterVerbIds={quizFilterVerbIds}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardMode
            allVerbs={ALL_VERBS}
            onRecordAttempt={handleRecordAttempt}
            progress={progress}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'rules' && <GrammarRules />}
        {currentTab === 'practice' && (
          <PracticeDashboard
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </main>

      {/* Modal Inspector for Verb Conjugations */}
      {selectedVerb && (
        <VerbDetailModal
          verb={selectedVerb}
          onClose={() => setSelectedVerb(null)}
          isBookmarked={!!progress[selectedVerb.id]?.bookmarked}
          onToggleBookmark={handleToggleBookmark}
          masteryStatus={getVerbMasteryStatus(progress[selectedVerb.id])}
        />
      )}

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="flex h-3.5 w-1 rounded-full overflow-hidden shadow-2xs">
              <div className="w-1/3 bg-blue-600 h-full" />
              <div className="w-1/3 bg-white h-full border-y border-stone-200" />
              <div className="w-1/3 bg-red-600 h-full" />
            </div>
            <span className="font-medium text-stone-700">
              Conjugaison Française • Studio d'Apprentissage
            </span>
          </div>

          <p className="font-serif italic text-stone-600 text-center sm:text-right">
            « C’est en forgeant qu’on devient forgeron. »
          </p>
        </div>
      </footer>
    </div>
  );
}
