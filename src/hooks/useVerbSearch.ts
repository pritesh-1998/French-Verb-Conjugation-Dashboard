import { useEffect, useMemo, useState } from 'react';
import {
  FrenchQueryMatch,
  VerbSearchResult,
  isFrenchFormIndexReady,
  onFrenchFormIndexReady,
  searchAnyFrenchVerb,
  searchFrenchConjugatedForms,
} from '../utils/conjugator';

export interface VerbSearchResults {
  /** The query these results were computed for (lags the typed text by the debounce delay). */
  query: string;
  infinitives: VerbSearchResult[];
  conjugated: FrenchQueryMatch[];
}

const EMPTY: VerbSearchResults = { query: '', infinitives: [], conjugated: [] };

/**
 * One shared, debounced verb search for the whole app.
 * Header and dashboard both read these results instead of searching separately on every keystroke.
 */
export function useVerbSearch(query: string, delayMs = 150): VerbSearchResults {
  const [debounced, setDebounced] = useState(query);
  const [indexReady, setIndexReady] = useState(isFrenchFormIndexReady);

  useEffect(() => {
    if (!query.trim()) {
      setDebounced(query);
      return;
    }
    const timer = window.setTimeout(() => setDebounced(query), delayMs);
    return () => window.clearTimeout(timer);
  }, [query, delayMs]);

  // Re-run the search once the full 7,000-verb form index finishes building.
  useEffect(() => onFrenchFormIndexReady(() => setIndexReady(true)), []);

  return useMemo(() => {
    if (!debounced.trim()) return EMPTY;
    return {
      query: debounced,
      infinitives: searchAnyFrenchVerb(debounced, 6),
      conjugated: searchFrenchConjugatedForms(debounced, 4),
    };
  }, [debounced, indexReady]);
}
