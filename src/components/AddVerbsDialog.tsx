import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Verb, VerbProgress } from '../types';
import { getVerbByInfinitiveOrId, ALL_FRENCH_VERB_KEYS } from '../utils/conjugator';
import { bookmarkVerbs } from '../utils/storage';
import { speakFrench } from '../utils/speech';
import {
  X,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Trash2,
  Plus,
  BookOpen,
} from 'lucide-react';

interface AddVerbsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerbsAdded: (addedVerbs: Verb[]) => void;
  progress: Record<string, VerbProgress>;
}

interface ParsedVerbItem {
  raw: string;
  normalized: string;
  verb: Verb | null;
  isAlreadyBookmarked: boolean;
  isValid: boolean;
}

const PRESET_COLLECTIONS = [
  {
    name: 'Top 10 Essentials',
    description: 'Most frequent verbs in French',
    verbs: 'être, avoir, aller, faire, dire, pouvoir, vouloir, savoir, voir, devoir',
  },
  {
    name: 'Movement & House of Être',
    description: 'Dr. & Mrs. Vandertramp verbs',
    verbs: 'aller, venir, entrer, sortir, arriver, partir, monter, descendre, naître, mourir, tomber, rester, retourner',
  },
  {
    name: 'Regular 2nd Group (-ir)',
    description: 'Verbs like finir, choisir',
    verbs: 'finir, choisir, réussir, réfléchir, grandir, nourrir, obéir, remplir',
  },
  {
    name: 'Daily & Conversational',
    description: 'Everyday dialogue verbs',
    verbs: 'parler, manger, aimer, habiter, commencer, acheter, écouter, comprendre, prendre, mettre',
  },
];

export const AddVerbsDialog: React.FC<AddVerbsDialogProps> = ({
  isOpen,
  onClose,
  onVerbsAdded,
  progress,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setSuccessMessage(null);
      setIsSubmitting(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Parse comma-separated (or newline / semicolon separated) verbs
  const parsedItems: ParsedVerbItem[] = useMemo(() => {
    if (!inputText.trim()) return [];

    // Split by commas, semicolons, or newlines
    const rawTokens = inputText
      .split(/[,;\n\r]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    // Keep unique tokens
    const uniqueTokens: string[] = Array.from(new Set(rawTokens));

    return uniqueTokens.map((token: string) => {
      // Clean leading dashes, bullets or quotes
      const clean = token.replace(/^[•\-\*\d\.\s"']+|["']+$/g, '').trim();
      const verb = getVerbByInfinitiveOrId(clean);
      const isAlready = verb ? !!progress[verb.id]?.bookmarked : false;

      return {
        raw: token,
        normalized: clean,
        verb,
        isAlreadyBookmarked: isAlready,
        isValid: !!verb,
      };
    });
  }, [inputText, progress]);

  // Valid new verbs ready to be bookmarked
  const newVerbsToAdd = useMemo(() => {
    return parsedItems
      .filter((item) => item.isValid && item.verb && !item.isAlreadyBookmarked)
      .map((item) => item.verb as Verb);
  }, [parsedItems]);

  const alreadyBookmarkedCount = useMemo(() => {
    return parsedItems.filter((item) => item.isValid && item.isAlreadyBookmarked).length;
  }, [parsedItems]);

  const invalidTokens = useMemo(() => {
    return parsedItems.filter((item) => !item.isValid);
  }, [parsedItems]);

  const handleApplyPreset = (verbsString: string) => {
    if (!inputText.trim()) {
      setInputText(verbsString);
    } else {
      // Append with comma
      setInputText((prev) => `${prev.trim().replace(/,$/, '')}, ${verbsString}`);
    }
  };

  const handleAddVerbs = () => {
    if (newVerbsToAdd.length === 0) return;

    setIsSubmitting(true);
    const verbIds = newVerbsToAdd.map((v) => v.id);

    // Batch bookmark in storage
    bookmarkVerbs(verbIds, true);

    // Notify parent
    onVerbsAdded(newVerbsToAdd);

    setSuccessMessage(
      `✓ Successfully added ${newVerbsToAdd.length} ${
        newVerbsToAdd.length === 1 ? 'verb' : 'verbs'
      } to your Favorites!`
    );

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-verbs-dialog-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-100 bg-stone-50/75">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="add-verbs-dialog-title"
                className="text-lg font-bold text-stone-900 font-serif tracking-tight"
              >
                Add Verbs to Favorites
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Type or paste French verb infinitives separated by commas to bookmark them in your favorites.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Quick Suggestions & Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLLECTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.verbs)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-stone-200/80 text-stone-700 transition-colors cursor-pointer"
                  title={`${preset.description}: ${preset.verbs}`}
                >
                  <Plus className="w-3 h-3 text-stone-400" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comma-Separated Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="comma-separated-verbs-input"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Type or Paste Verbs (separated by commas)</span>
              </label>
              {inputText.trim() && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                id="comma-separated-verbs-input"
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. aller, manger, faire, être, avoir, venir, prendre, vouloir, pouvoir"
                rows={4}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono leading-relaxed resize-y min-h-[96px]"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <span>Supports all 7,000+ French verbs. Separate verbs using commas, semicolons, or new lines.</span>
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Live Analysis / Preview Badges */}
          {parsedItems.length > 0 && (
            <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Detected Verbs ({parsedItems.length}):
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  {newVerbsToAdd.length > 0 && (
                    <span className="text-emerald-700 font-semibold">
                      +{newVerbsToAdd.length} ready to save
                    </span>
                  )}
                  {alreadyBookmarkedCount > 0 && (
                    <span className="text-amber-700">
                      • {alreadyBookmarkedCount} already in favorites
                    </span>
                  )}
                  {invalidTokens.length > 0 && (
                    <span className="text-rose-600">
                      • {invalidTokens.length} unrecognized
                    </span>
                  )}
                </div>
              </div>

              {/* Chips list */}
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {parsedItems.map((item, idx) => {
                  if (item.isValid && item.verb) {
                    const isNew = !item.isAlreadyBookmarked;
                    return (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isNew
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50/90 text-amber-900 border-amber-200'
                        }`}
                      >
                        <span className="font-bold">{item.verb.infinitive}</span>
                        <span className="text-[11px] opacity-75">({item.verb.english})</span>
                        {isNew ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ready to add" />
                        ) : (
                          <span className="text-[10px] px-1 rounded bg-amber-200/70 text-amber-800 font-semibold">
                            Saved
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakFrench(item.verb!.infinitive);
                          }}
                          className="p-0.5 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                          title={`Listen to ${item.verb.infinitive}`}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  }

                  // Unrecognized token
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                      title="Verb not found in French verb library. Please check spelling."
                    >
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="line-through">{item.raw}</span>
                      <span className="text-[10px] text-rose-600 font-normal">(unrecognized)</span>
                    </div>
                  );
                })}
              </div>

              {invalidTokens.length > 0 && (
                <p className="text-[11px] text-rose-600">
                  Tip: Ensure verbs are in infinitive form (e.g. <em>parler</em> rather than <em>parle</em>).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-100 bg-stone-50/90">
          <div className="text-xs text-stone-500">
            {newVerbsToAdd.length > 0 ? (
              <span className="text-emerald-700 font-semibold">
                Ready to add {newVerbsToAdd.length} {newVerbsToAdd.length === 1 ? 'verb' : 'verbs'}
              </span>
            ) : parsedItems.length > 0 && alreadyBookmarkedCount === parsedItems.length ? (
              <span className="text-amber-700">All entered verbs are already in your favorites</span>
            ) : (
              <span>Enter comma-separated verbs above</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddVerbs}
              disabled={newVerbsToAdd.length === 0 || isSubmitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
                newVerbsToAdd.length > 0 && !isSubmitting
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold active:scale-98 shadow-amber-500/20'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : `Add to Favorites (${newVerbsToAdd.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
