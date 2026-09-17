import { UserStats, VerbProgress } from '../types';

const STATS_KEY = 'french_verbs_user_stats';
const PROGRESS_KEY = 'french_verbs_progress';

const DEFAULT_STATS: UserStats = {
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalAnswered: 0,
  totalCorrect: 0,
  completedDrillCount: 0,
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);

    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const lastDate = parsed.lastActiveDate;

    if (lastDate && lastDate !== today) {
      const last = new Date(lastDate).getTime();
      const current = new Date(today).getTime();
      const diffDays = Math.round((current - last) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        parsed.streak = (parsed.streak || 0) + 1;
      } else if (diffDays > 1) {
        parsed.streak = 1;
      }
      parsed.lastActiveDate = today;
      saveUserStats(parsed);
    }

    return { ...DEFAULT_STATS, ...parsed };
  } catch (err) {
    console.warn('Failed to load user stats:', err);
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats:', err);
  }
}

export function loadVerbProgress(): Record<string, VerbProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to load verb progress:', err);
    return {};
  }
}

export function recordVerbAttempt(
  verbId: string,
  isCorrect: boolean
): { updatedProgress: Record<string, VerbProgress>; updatedStats: UserStats } {
  const currentProgress = loadVerbProgress();
  const currentStats = loadUserStats();

  const prev = currentProgress[verbId] || {
    verbId,
    correct: 0,
    incorrect: 0,
    bookmarked: false,
  };

  const updatedVerb: VerbProgress = {
    ...prev,
    correct: prev.correct + (isCorrect ? 1 : 0),
    incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    lastPracticed: new Date().toISOString(),
  };

  currentProgress[verbId] = updatedVerb;

  const today = new Date().toISOString().split('T')[0];
  const updatedStats: UserStats = {
    ...currentStats,
    totalAnswered: currentStats.totalAnswered + 1,
    totalCorrect: currentStats.totalCorrect + (isCorrect ? 1 : 0),
    lastActiveDate: today,
  };

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(currentProgress));
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    console.warn(e);
  }

  return { updatedProgress: currentProgress, updatedStats };
}

export function toggleBookmarkVerb(verbId: string): Record<string, VerbProgress> {
  const progress = loadVerbProgress();
  const prev = progress[verbId] || {
    verbId,
    correct: 0,
    incorrect: 0,
    bookmarked: false,
  };

  progress[verbId] = {
    ...prev,
    bookmarked: !prev.bookmarked,
  };

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn(e);
  }

  return { ...progress };
}

export function bookmarkVerbs(
  verbIds: string[],
  bookmarked: boolean = true
): Record<string, VerbProgress> {
  const progress = loadVerbProgress();
  verbIds.forEach((verbId) => {
    const prev = progress[verbId] || {
      verbId,
      correct: 0,
      incorrect: 0,
      bookmarked: false,
    };
    progress[verbId] = {
      ...prev,
      bookmarked,
    };
  });

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn(e);
  }

  return { ...progress };
}

export function removeBookmarkVerb(verbId: string): Record<string, VerbProgress> {
  const progress = loadVerbProgress();
  if (progress[verbId]) {
    progress[verbId] = {
      ...progress[verbId],
      bookmarked: false,
    };
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn(e);
    }
  }
  return { ...progress };
}

export function incrementDrillCount(): UserStats {
  const stats = loadUserStats();
  const updated = {
    ...stats,
    completedDrillCount: (stats.completedDrillCount || 0) + 1,
  };
  saveUserStats(updated);
  return updated;
}

export function getVerbMasteryStatus(
  progress?: VerbProgress
): 'mastered' | 'learning' | 'struggling' | 'unstudied' {
  if (!progress || (progress.correct === 0 && progress.incorrect === 0)) {
    return 'unstudied';
  }
  const total = progress.correct + progress.incorrect;
  const rate = progress.correct / total;

  if (total >= 4 && rate >= 0.75) return 'mastered';
  if (total >= 2 && rate >= 0.45) return 'learning';
  return 'struggling';
}
