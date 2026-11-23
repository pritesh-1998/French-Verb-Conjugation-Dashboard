import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const STAGES: Array<{ after: number; text: string }> = [
  { after: 0, text: 'Asking the AI tutor…' },
  { after: 3, text: 'Reading your French and checking the grammar…' },
  { after: 7, text: 'Free models are busy, so a backup model has started too…' },
  { after: 15, text: 'Still working. Free models sometimes queue for a while…' },
];

interface ExplainLoadingProps {
  text: string;
  onCancel?: () => void;
}

/** Loading card shown while an AI explanation is on its way. */
export const ExplainLoading: React.FC<ExplainLoadingProps> = ({ text, onCancel }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, []);

  const stage = [...STAGES].reverse().find((s) => seconds >= s.after) ?? STAGES[0];
  // Bar fills quickly at first, then slows, never quite reaching the end.
  const progress = Math.min(95, Math.round(100 * (1 - Math.exp(-seconds / 6))));

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-indigo-900">{stage.text}</p>
            <p className="text-xs text-indigo-700/80 truncate">“{text}” · {seconds}s</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Skeleton of the answer card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-pulse">
        <div className="lg:col-span-2 space-y-2">
          <div className="h-4 w-1/3 rounded bg-indigo-100" />
          <div className="h-5 w-3/4 rounded bg-indigo-100" />
          <div className="h-3 w-full rounded bg-indigo-100" />
          <div className="h-3 w-5/6 rounded bg-indigo-100" />
        </div>
        <div className="space-y-2">
          <div className="h-12 rounded-lg bg-indigo-100" />
          <div className="h-12 rounded-lg bg-indigo-100" />
        </div>
      </div>
    </div>
  );
};

/** Small line under an answer: which model answered and how long it took. */
export const ExplainSourceNote: React.FC<{ source: string; ms: number }> = ({ source, ms }) => (
  <p className="text-[11px] text-stone-400">
    {source === 'saved answer' ? 'Saved answer · instant' : `Answered by ${source} in ${(ms / 1000).toFixed(1)}s`}
  </p>
);
