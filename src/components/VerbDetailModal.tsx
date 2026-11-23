import React, { useEffect, useState } from 'react';
import { Verb, TenseId } from '../types';
import { TENSES } from '../data/tenses';
import { speakFrench } from '../utils/speech';
import {
  getIsolatedVerbForm,
  getStemAndEnding,
  formatSpokenConjugation,
} from '../utils/frenchFormatting';
import { Volume2, Bookmark, X, BookOpen, Sparkles, CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import { VerbInfo, fetchVerbInfo, getSavedVerbInfo, needsVerbMeaning } from '../utils/verbMeanings';

interface VerbDetailModalProps {
  verb: Verb | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (verbId: string) => void;
  masteryStatus: 'mastered' | 'learning' | 'struggling' | 'unstudied';
}

export const VerbDetailModal: React.FC<VerbDetailModalProps> = ({
  verb,
  onClose,
  isBookmarked,
  onToggleBookmark,
  masteryStatus,
}) => {
  const [selectedTense, setSelectedTense] = useState<TenseId>('present');
  const [playingItem, setPlayingItem] = useState<string | null>(null);

  // Library verbs without a built-in translation: look the meaning up (once, then saved).
  const missingMeaning = !!verb && needsVerbMeaning(verb.english);
  const [verbInfo, setVerbInfo] = useState<VerbInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoAttempt, setInfoAttempt] = useState(0);

  useEffect(() => {
    setVerbInfo(null);
    setInfoError('');
    if (!verb || !missingMeaning) return;
    const saved = getSavedVerbInfo(verb.infinitive);
    if (saved) {
      setVerbInfo(saved);
      return;
    }
    const controller = new AbortController();
    setInfoLoading(true);
    fetchVerbInfo(verb.infinitive, controller.signal)
      .then((info) => !controller.signal.aborted && setVerbInfo(info))
      .catch((err) => !controller.signal.aborted && setInfoError(err instanceof Error ? err.message : 'Could not look up this verb'))
      .finally(() => !controller.signal.aborted && setInfoLoading(false));
    return () => controller.abort();
  }, [verb?.infinitive, missingMeaning, infoAttempt]);

  if (!verb) return null;

  const englishMeaning = verbInfo?.english ?? (missingMeaning ? null : verb.english);
  const example = missingMeaning
    ? verbInfo?.example?.fr
      ? verbInfo.example
      : null
    : verb.example;

  const currentTenseMeta = TENSES.find((t) => t.id === selectedTense) || TENSES[0];
  const forms = verb.conjugations[selectedTense] || [];

  const handleSpeak = (text: string, id: string) => {
    setPlayingItem(id);
    speakFrench(text);
    setTimeout(() => setPlayingItem(null), 1200);
  };

  const getStatusBadge = () => {
    switch (masteryStatus) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mastered
          </span>
        );
      case 'learning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Learning
          </span>
        );
      case 'struggling':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Needs Practice
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Unstudied
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/80 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">
                {verb.infinitive}
              </h2>
              <button
                type="button"
                onClick={() => handleSpeak(verb.infinitive, 'infinitive')}
                className="p-1.5 rounded-full hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 transition-colors"
                title="Pronounce infinitive"
              >
                <Volume2 className="w-5 h-5 text-indigo-600" />
              </button>
              {getStatusBadge()}
              <button
                type="button"
                onClick={() => onToggleBookmark(verb.id)}
                className={`p-1.5 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                    : 'text-stone-400 hover:text-stone-700 bg-stone-100'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark verb'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </div>
            {englishMeaning ? (
              <p className="text-lg text-stone-600 italic font-serif mt-1">"{englishMeaning}"</p>
            ) : infoLoading ? (
              <p className="flex items-center gap-2 text-sm text-indigo-700 mt-2" role="status">
                <Loader2 className="w-4 h-4 animate-spin" /> Looking up the English meaning…
              </p>
            ) : infoError ? (
              <p className="flex flex-wrap items-center gap-2 text-sm text-rose-700 mt-2">
                {infoError.split("\n")[0]}
                <button
                  type="button"
                  onClick={() => setInfoAttempt((n) => n + 1)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200"
                >
                  <RotateCw className="w-3 h-3" /> Try again
                </button>
              </p>
            ) : null}

            {/* Verb characteristics metadata */}
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-800 font-medium">
                {verb.group === 1
                  ? '1st Group (-er)'
                  : verb.group === 2
                  ? '2nd Group (-ir)'
                  : '3rd Group (Irregular)'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-800 font-medium">
                Auxiliary: <strong className="font-semibold text-stone-900">{verb.auxiliary}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-800 font-medium">
                Participle: <span className="font-mono text-stone-900">{verb.pastParticiple}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-800 font-medium">
                Level {verb.level}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tense selector tabs */}
        <div className="flex overflow-x-auto border-b border-stone-200 bg-stone-100/60 px-4 py-2 gap-1.5 scrollbar-thin">
          {TENSES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTense(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTense === t.id
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              {t.nameFr}
            </button>
          ))}
        </div>

        {/* Tense description card */}
        <div className="px-6 pt-4 pb-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div>
            <span className="font-semibold text-stone-800">{currentTenseMeta.nameFr}</span> ({currentTenseMeta.nameEn}): {currentTenseMeta.description}
          </div>
          <div className="hidden sm:block text-stone-600 font-mono text-[11px] bg-stone-200/60 px-2 py-0.5 rounded">
            Formula: {currentTenseMeta.formula}
          </div>
        </div>

        {/* Conjugation Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {forms.map((item, idx) => {
              const uniqueId = `${verb.id}-${selectedTense}-${idx}`;
              const split = getStemAndEnding(item);
              const isolated = getIsolatedVerbForm(item.form, item.pronoun);
              const spokenPhrase = formatSpokenConjugation(item.pronounDisplay, item.form);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 border border-stone-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-600 w-24 font-mono font-medium">
                      {item.pronounDisplay}
                    </span>
                    <span className="text-base font-semibold text-stone-900 tracking-tight">
                      {split ? (
                        <>
                          <span className="text-stone-800">{split.stem}</span>
                          <span className="text-indigo-600 font-bold underline decoration-indigo-300 underline-offset-2">
                            {split.ending}
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-800">{isolated}</span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeak(spokenPhrase, uniqueId)}
                    className={`p-1.5 rounded-lg text-stone-400 group-hover:text-stone-700 hover:bg-white transition-colors cursor-pointer ${
                      playingItem === uniqueId ? 'text-indigo-600 bg-indigo-50' : ''
                    }`}
                    title={`Pronounce "${spokenPhrase}"`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pedagogy Note & Example Sentence */}
          <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
            {verbInfo?.note && (
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">{verbInfo.note}</p>
              </div>
            )}
            {verb.tip && (
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {verb.tip}
                </p>
              </div>
            )}
            {example ? (
            <div className="flex items-start gap-2.5 pt-1 border-t border-amber-200/50">
              <BookOpen className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-serif text-stone-900 text-sm italic">
                  "{example.fr}"
                </p>
                <p className="text-stone-600">
                  {example.en}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(example.fr, 'example')}
                className="ml-auto p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                title="Pronounce example sentence"
              >
                <Volume2 className="w-3.5 h-3.5 text-stone-600" />
              </button>
            </div>
            ) : infoLoading ? (
              <div className="pt-2 border-t border-amber-200/50 space-y-1.5 animate-pulse">
                <div className="h-3.5 w-2/3 rounded bg-amber-100" />
                <div className="h-3 w-1/2 rounded bg-amber-100" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
