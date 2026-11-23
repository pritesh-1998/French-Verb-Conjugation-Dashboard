import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, Sparkles, Volume2, X } from 'lucide-react';
import { Verb } from '../types';
import {
  conjugateVerbFromLibrary,
  searchAnyFrenchVerb,
  searchFrenchConjugatedForms,
} from '../utils/conjugator';
import { speakFrench } from '../utils/speech';
import { fetchExplanation } from '../utils/explainClient';
import { ExplainLoading, ExplainSourceNote } from './ExplainLoading';
import type { VerbSearchResults } from '../hooks/useVerbSearch';

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

interface DashboardFrenchSearchProps {
  searchQuery: string;
  searchResults: VerbSearchResults;
  onSearchChange: (query: string) => void;
  onSelectVerb: (verb: Verb) => void;
  onOpenPractice: () => void;
}

export const DashboardFrenchSearch: React.FC<DashboardFrenchSearchProps> = ({
  searchQuery,
  searchResults,
  onSearchChange,
  onSelectVerb,
  onOpenPractice,
}) => {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultLabel, setResultLabel] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [answerMeta, setAnswerMeta] = useState<{ source: string; ms: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelExplain = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setResultLabel('');
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    // Shared, debounced results from App (useVerbSearch); no extra search per keystroke here.
    const infinitives = searchResults.infinitives;
    const conjugated = searchResults.conjugated;
    return [
      ...conjugated.map((item) => ({
        key: `form-${item.id}-${item.tenseName}`,
        title: item.conjugatedForm || item.infinitive,
        subtitle: `${item.infinitive} · ${item.tenseName}`,
        infinitive: item.infinitive,
      })),
      ...infinitives
        .filter((item) => item.infinitive.toLowerCase() === searchResults.query.trim().toLowerCase())
        .map((item) => ({
          key: `verb-${item.id}`,
          title: item.infinitive,
          subtitle: item.english,
          infinitive: item.infinitive,
        })),
    ].slice(0, 7);
  }, [searchQuery, searchResults]);

  const explainText = async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setPendingText(text);
    setError('');
    setExplanation(null);
    setAnswerMeta(null);
    setResultLabel('Language explanation');
    try {
      const result = await fetchExplanation(text, controller.signal);
      if (controller.signal.aborted) return;
      setExplanation(result.explanation);
      setAnswerMeta({ source: result.source, ms: result.ms });
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Could not explain this text');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const runSearch = async (text = searchQuery) => {
    const query = text.trim();
    if (!query) return;

    setError('');
    setExplanation(null);
    setResultLabel('');

    const normalized = query.toLowerCase().replace(/\s+/g, ' ');
    const conjugatedMatches = searchFrenchConjugatedForms(normalized, 1);
    if (!normalized.includes(' ') && conjugatedMatches.length > 0) {
      const verb = conjugateVerbFromLibrary(conjugatedMatches[0].infinitive);
      setResultLabel(`${conjugatedMatches[0].conjugatedForm} · ${conjugatedMatches[0].tenseName}`);
      onSelectVerb(verb);
      return;
    }

    const infinitiveMatches = searchAnyFrenchVerb(normalized, 1);
    const exactInfinitive =
      !normalized.includes(' ') &&
      infinitiveMatches.find((item) => item.infinitive.toLowerCase() === normalized);

    if (exactInfinitive) {
      setResultLabel(`Infinitive · ${exactInfinitive.english}`);
      onSelectVerb(conjugateVerbFromLibrary(exactInfinitive.infinitive));
      return;
    }

    await explainText(query);
  };

  const selectSuggestion = (infinitive: string, title: string) => {
    onSearchChange(title);
    onSelectVerb(conjugateVerbFromLibrary(infinitive));
  };

  return (
    <section className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
            <Sparkles className="w-4 h-4" />
            French search
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
            Search any verb, word, or sentence
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenPractice}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 self-start sm:self-auto"
        >
          Open practice studio <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setExplanation(null);
            setError('');
            setResultLabel('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void runSearch();
            if (event.key === 'Escape') onSearchChange('');
          }}
          placeholder="Try “être”, “allons”, “célèbre”, or “je suis célibataire”"
          className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-stone-300 bg-stone-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
        {searchQuery && !loading && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => void runSearch()}
          disabled={!searchQuery.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>

        {suggestions.length > 0 && searchQuery.trim() && !explanation && (
          <div className="absolute z-20 left-0 right-0 top-full mt-2 rounded-xl border border-stone-200 bg-white shadow-xl overflow-hidden">
            {suggestions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectSuggestion(item.infinitive, item.title)}
                className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-indigo-50/60 border-b border-stone-100 last:border-b-0"
              >
                <div className="min-w-0">
                  <span className="font-serif font-bold text-stone-900">{item.title}</span>
                  <span className="ml-2 text-xs text-stone-500">{item.subtitle}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {resultLabel && !explanation && !loading && (
        <p className="text-xs font-semibold text-indigo-700">{resultLabel}</p>
      )}

      {loading && <ExplainLoading text={pendingText} onCancel={cancelExplain} />}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 whitespace-pre-line break-words">
          {error}
        </div>
      )}

      {explanation && answerMeta && <ExplainSourceNote source={answerMeta.source} ms={answerMeta.ms} />}

      {explanation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">English meaning</p>
              <p className="text-lg font-serif font-bold text-stone-900 mt-1">{explanation.translation}</p>
              <p className="text-sm text-stone-600 mt-2">{explanation.grammar}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {explanation.vocabulary.map((item, index) => (
                <div key={`${item.word}-${index}`} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-stone-900">{item.word}</span>
                    <button
                      type="button"
                      onClick={() => void speakFrench(item.word)}
                      className="text-stone-400 hover:text-indigo-600"
                      title={`Hear ${item.word}`}
                    >
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
              <button
                type="button"
                onClick={() => void speakFrench(searchQuery)}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700"
              >
                <Volume2 className="w-4 h-4" /> Hear French
              </button>
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
  );
};
