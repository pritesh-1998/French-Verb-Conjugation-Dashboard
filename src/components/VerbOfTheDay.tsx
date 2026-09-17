import React, { useState } from 'react';
import { Verb } from '../types';
import { speakFrench } from '../utils/speech';
import { getIsolatedVerbForm } from '../utils/frenchFormatting';
import { Sparkles, Volume2, ArrowRight, Bookmark } from 'lucide-react';

interface VerbOfTheDayProps {
  verb: Verb;
  onOpenVerb: (verb: Verb) => void;
  isBookmarked: boolean;
  onToggleBookmark: (verbId: string) => void;
}

export const VerbOfTheDay: React.FC<VerbOfTheDayProps> = ({
  verb,
  onOpenVerb,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (text: string) => {
    setIsPlaying(true);
    speakFrench(text);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  const presentForms = verb.conjugations.present?.slice(0, 3) || [];

  return (
    <section className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 shadow-md border border-stone-800 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Verb of the Day
            </span>
            <span className="text-xs text-stone-400">
              Group {verb.group} • Auxiliary {verb.auxiliary}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h3 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-white">
              {verb.infinitive}
            </h3>
            <button
              type="button"
              onClick={() => handleSpeak(verb.infinitive)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isPlaying ? 'bg-indigo-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Pronounce infinitive"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(verb.id)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          <p className="text-base sm:text-lg text-stone-300 font-serif italic">
            "{verb.english}"
          </p>

          {/* Example Sentence */}
          <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs sm:text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-stone-200 font-medium font-serif italic">
                  « {verb.example.fr} »
                </p>
                <p className="text-stone-400 text-xs mt-0.5">
                  {verb.example.en}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(verb.example.fr)}
                className="p-1.5 rounded-lg bg-stone-700/60 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors shrink-0"
                title="Listen to sentence"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Quick Conjugation Preview & Call to Action */}
        <div className="w-full md:w-72 bg-stone-800/60 rounded-xl p-4 border border-stone-700/50 flex flex-col justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Present Tense Preview
            </div>
            <div className="space-y-1.5 text-xs">
              {presentForms.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-stone-300 font-mono py-1 px-2 rounded bg-stone-900/50"
                >
                  <span className="text-stone-500">{item.pronounDisplay}</span>
                  <span className="font-semibold text-white">{getIsolatedVerbForm(item.form, item.pronoun)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenVerb(verb)}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span>Explore full conjugation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
