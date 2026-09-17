import React from 'react';
import { speakFrench } from '../../utils/speech';
import {
  getIsolatedVerbForm,
  getStemAndEnding,
  formatSpokenConjugation,
} from '../../utils/frenchFormatting';
import { Volume2, XCircle, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface QuizAutoCorrectionBannerProps {
  userAnswer: string;
  correctAnswer: string;
  verbInfinitive: string;
  pronounDisplay: string;
  tenseName: string;
  stem?: string;
  ending?: string;
  ruleTip?: string;
}

export const QuizAutoCorrectionBanner: React.FC<QuizAutoCorrectionBannerProps> = ({
  userAnswer,
  correctAnswer,
  verbInfinitive,
  pronounDisplay,
  tenseName,
  stem,
  ending,
  ruleTip,
}) => {
  return (
    <div
      id="quiz-auto-correction-banner"
      className="mt-4 rounded-2xl bg-rose-50/90 border border-rose-200/80 p-4 sm:p-5 text-stone-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-rose-950 font-serif">
              Automatic Mistake Correction
            </h4>
            <p className="text-xs text-rose-700">
              Analyze the difference to lock in the correct conjugation pattern
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => speakFrench(formatSpokenConjugation(pronounDisplay, correctAnswer))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Listen to exact pronunciation"
        >
          <Volume2 className="w-4 h-4 text-rose-600" />
          <span>Listen to correct answer</span>
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* User's Mistake */}
        <div className="p-3 rounded-xl bg-white/90 border border-rose-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 mb-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Your input</span>
          </div>
          <div className="font-mono text-base font-medium text-rose-800 line-through decoration-rose-500 decoration-2">
            {userAnswer || '—'}
          </div>
        </div>

        {/* Exact Correction */}
        <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-300">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Correct form ({tenseName})</span>
          </div>
          <div className="font-mono text-base font-bold text-emerald-950 flex items-baseline gap-1">
            <span className="text-stone-600 font-sans text-xs font-normal">
              {pronounDisplay}
            </span>
            {(() => {
              const split = getStemAndEnding({ form: correctAnswer, pronoun: pronounDisplay, stem, ending });
              const isolated = getIsolatedVerbForm(correctAnswer, pronounDisplay);
              if (split) {
                return (
                  <span>
                    <span className="text-stone-900">{split.stem}</span>
                    <span className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500">
                      {split.ending}
                    </span>
                  </span>
                );
              }
              return <span className="text-emerald-700">{isolated}</span>;
            })()}
          </div>
        </div>
      </div>

      {/* Explanatory Rule / Hint */}
      <div className="text-xs text-rose-900/90 bg-white/70 rounded-xl p-3 border border-rose-200/60 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-rose-950">Grammar Rule: </span>
          {ruleTip ? (
            <span>{ruleTip}</span>
          ) : (
            <span>
              For <strong>{verbInfinitive}</strong> with <strong>{pronounDisplay}</strong> in <strong>{tenseName}</strong>, note the ending{' '}
              {ending ? <strong className="font-mono text-emerald-700">-{ending}</strong> : ''}.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
