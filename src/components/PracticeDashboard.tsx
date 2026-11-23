import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { speakFrench } from '../utils/speech';
import { fetchExplanation } from '../utils/explainClient';
import { ExplainLoading, ExplainSourceNote } from './ExplainLoading';

interface PracticeDashboardProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface Explanation {
  translation: string;
  pronunciation: string;
  ipa?: string;
  partOfSpeech: string;
  grammar: string;
  vocabulary: Array<{ word: string; meaning: string; partOfSpeech: string }>;
  example?: string;
  exampleMeaning?: string;
}

type PracticeView = 'today' | 'calendar' | 'listen' | 'lab';

const practiceStorage = {
  read: <T,>(key: string, fallback: T): T => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  },
  write: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

export const PracticeDashboard: React.FC<PracticeDashboardProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const [view, setView] = useState<PracticeView>('today');
  const [seconds, setSeconds] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>(() =>
    practiceStorage.read('practice_completed_days', [])
  );
  const [selectedDay, setSelectedDay] = useState(1);
  const [mistakes, setMistakes] = useState<Array<{ id: number; wrong: string; right: string }>>(() =>
    practiceStorage.read('practice_mistakes', [])
  );
  const [wrong, setWrong] = useState('');
  const [right, setRight] = useState('');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [answerMeta, setAnswerMeta] = useState<{ source: string; ms: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelExplain = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setExplanationLoading(false);
  };

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    practiceStorage.write('practice_completed_days', completedDays);
  }, [completedDays]);

  useEffect(() => {
    practiceStorage.write('practice_mistakes', mistakes);
  }, [mistakes]);

  const timerText = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const explainText = async (text = searchQuery) => {
    const query = text.trim();
    if (!query) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setExplanationLoading(true);
    setPendingText(query);
    setExplanationError('');
    setExplanation(null);
    setAnswerMeta(null);
    try {
      const result = await fetchExplanation(query, controller.signal);
      if (controller.signal.aborted) return;
      setExplanation(result.explanation);
      setAnswerMeta({ source: result.source, ms: result.ms });
    } catch (error) {
      if (controller.signal.aborted) return;
      setExplanationError(error instanceof Error ? error.message : 'Could not explain that text');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setExplanationLoading(false);
      }
    }
  };

  const dayPlan = useMemo(() => {
    const themes = ['Core tenses', 'Past narratives', 'Future plans', 'Speaking', 'Listening', 'Review'];
    const theme = themes[(selectedDay - 1) % themes.length];
    return {
      theme,
      focus: selectedDay % 5 === 0
        ? 'Mix listening, speaking, and a 5-sentence written review.'
        : `Practice ${theme.toLowerCase()} for 10 minutes, then use 20 minutes for listening and speaking.`,
    };
  }, [selectedDay]);

  const addMistake = (event: React.FormEvent) => {
    event.preventDefault();
    if (!wrong.trim() || !right.trim()) return;
    setMistakes((items) => [{ id: Date.now(), wrong: wrong.trim(), right: right.trim() }, ...items]);
    setWrong('');
    setRight('');
  };

  const views: Array<{ id: PracticeView; label: string; icon: React.ReactNode }> = [
    { id: 'today', label: 'Today', icon: <Check className="w-4 h-4" /> },
    { id: 'calendar', label: '30-Day Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'listen', label: 'Watch & Answer', icon: <Headphones className="w-4 h-4" /> },
    { id: 'lab', label: 'Language Lab', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-stone-900 rounded-2xl p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">French practice studio</p>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif mt-1">Practice what you hear, see, and type</h2>
        <p className="text-sm text-indigo-100 mt-2 max-w-2xl">
          Search a verb, type a French word, or paste a sentence to explain it, hear it, and add it to your practice.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === item.id
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {view === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold font-serif text-xl">30-minute focus session</h3>
                <p className="text-xs text-stone-500 mt-1">10 min listen · 10 min drill · 10 min speak</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Day {selectedDay}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-stone-50 border border-stone-200 p-5">
              <div className="text-5xl font-bold tabular-nums tracking-tight text-indigo-700">{timerText}</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setRunning(true)} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm inline-flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start
                </button>
                <button type="button" onClick={() => setRunning(false)} className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm inline-flex items-center gap-2">
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button type="button" onClick={() => { setRunning(false); setSeconds(30 * 60); }} className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-500" title="Reset timer">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCompletedDays((days) => days.includes(selectedDay) ? days : [...days, selectedDay])}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                completedDays.includes(selectedDay)
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {completedDays.includes(selectedDay) ? 'Day complete' : 'Mark day complete'}
            </button>
          </section>

          <section className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold font-serif text-xl">Mistake fixer</h3>
              <p className="text-xs text-stone-500 mt-1">Save a natural correction and review it later.</p>
            </div>
            <form onSubmit={addMistake} className="space-y-2">
              <input value={wrong} onChange={(event) => setWrong(event.target.value)} placeholder="My phrase" className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/40 text-sm" />
              <input value={right} onChange={(event) => setRight(event.target.value)} placeholder="Correct French" className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-sm" />
              <button type="submit" className="w-full px-3 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold">Save correction</button>
            </form>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {mistakes.map((item) => (
                <div key={item.id} className="rounded-xl border border-stone-200 p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-rose-700 line-through">{item.wrong}</p>
                      <p className="text-emerald-800 font-semibold mt-1">{item.right}</p>
                    </div>
                    <button type="button" onClick={() => setMistakes((items) => items.filter((entry) => entry.id !== item.id))} className="text-stone-400 hover:text-rose-600" title="Remove">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {mistakes.length === 0 && <p className="text-xs text-stone-400 text-center py-4">No mistakes logged yet.</p>}
            </div>
          </section>
        </div>
      )}

      {view === 'calendar' && (
        <section className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setSelectedDay((day) => Math.max(1, day - 1))} className="p-2 rounded-lg border border-stone-200" title="Previous day"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Day {selectedDay}</p>
              <h3 className="font-serif font-bold text-xl">{dayPlan.theme}</h3>
            </div>
            <button type="button" onClick={() => setSelectedDay((day) => Math.min(30, day + 1))} className="p-2 rounded-lg border border-stone-200" title="Next day"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-stone-600 text-center">{dayPlan.focus}</p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-xl text-sm font-bold border transition-colors ${
                  selectedDay === day
                    ? 'bg-stone-900 text-white border-stone-900'
                    : completedDays.includes(day)
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-indigo-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </section>
      )}

      {view === 'listen' && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-xl">Listen, summarize, and speak</h3>
          <ol className="space-y-3 text-sm text-stone-700">
            <li><strong>1.</strong> Listen once and write the main idea in French.</li>
            <li><strong>2.</strong> Listen again and capture 3 unfamiliar words or expressions.</li>
            <li><strong>3.</strong> Summarize it aloud in 2–3 sentences without translating word for word.</li>
          </ol>
          <textarea className="w-full min-h-36 px-4 py-3 rounded-xl border border-stone-200 text-sm" placeholder="Écrivez votre résumé en français…" />
        </section>
      )}

      {view === 'lab' && (
        <section className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') void explainText(); }}
                placeholder="Search a word or paste a French sentence..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <button type="button" onClick={() => void explainText()} disabled={!searchQuery.trim() || explanationLoading} className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold disabled:opacity-50">
              {explanationLoading ? 'Explaining…' : 'Explain'}
            </button>
            {searchQuery.trim() && (
              <button type="button" onClick={() => void speakFrench(searchQuery)} className="px-3 py-2.5 rounded-xl border border-stone-200 text-stone-600" title="Hear French">
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {explanationLoading && <ExplainLoading text={pendingText} onCancel={cancelExplain} />}

          {explanationError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{explanationError}</div>
          )}

          {explanation && answerMeta && <ExplainSourceNote source={answerMeta.source} ms={answerMeta.ms} />}

          {explanation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">English meaning</p>
                  <p className="text-lg font-serif font-bold text-stone-900 mt-1">{explanation.translation}</p>
                  {explanation.grammar && <p className="text-sm text-stone-600 mt-2">{explanation.grammar}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {explanation.vocabulary.map((item, index) => (
                    <div key={`${item.word}-${index}`} className="rounded-xl border border-stone-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-stone-900">{item.word}</span>
                        <button type="button" onClick={() => void speakFrench(item.word)} className="text-stone-400 hover:text-indigo-600" title={`Hear ${item.word}`}>
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{item.meaning}</p>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400 mt-1">{item.partOfSpeech}</p>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl border border-stone-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Pronunciation</p>
                  <p className="text-sm text-stone-800 mt-1">{explanation.pronunciation}</p>
                  {explanation.ipa && <p className="text-sm font-mono text-indigo-700 mt-2">/{explanation.ipa}/</p>}
                </div>
                <div className="rounded-xl border border-stone-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Word or sentence type</p>
                  <p className="text-sm text-stone-800 mt-1">{explanation.partOfSpeech}</p>
                </div>
                {explanation.example && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <p className="font-serif font-bold text-emerald-900">{explanation.example}</p>
                    <p className="text-xs text-emerald-800 mt-1">{explanation.exampleMeaning}</p>
                  </div>
                )}
              </aside>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
