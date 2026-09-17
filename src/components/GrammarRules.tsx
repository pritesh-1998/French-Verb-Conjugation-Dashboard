import React, { useState } from 'react';
import { GRAMMAR_RULES } from '../data/rules';
import { BookMarked, Sparkles, HelpCircle, Check, Compass } from 'lucide-react';

const IRREGULAR_STEMS = [
  { verb: 'être', futurStem: 'ser-', conditionnel: 'je serais', subjonctif: 'que je sois' },
  { verb: 'avoir', futurStem: 'aur-', conditionnel: 'j’aurais', subjonctif: 'que j’aie' },
  { verb: 'aller', futurStem: 'ir-', conditionnel: 'j’irais', subjonctif: 'que j’aille' },
  { verb: 'faire', futurStem: 'fer-', conditionnel: 'je ferais', subjonctif: 'que je fasse' },
  { verb: 'pouvoir', futurStem: 'pourr-', conditionnel: 'je pourrais', subjonctif: 'que je puisse' },
  { verb: 'vouloir', futurStem: 'voudr-', conditionnel: 'je voudrais', subjonctif: 'que je veuille' },
  { verb: 'savoir', futurStem: 'saur-', conditionnel: 'je saurais', subjonctif: 'que je sache' },
  { verb: 'devoir', futurStem: 'devr-', conditionnel: 'je devrais', subjonctif: 'que je doive' },
  { verb: 'voir', futurStem: 'verr-', conditionnel: 'je verrais', subjonctif: 'que je voie' },
  { verb: 'venir', futurStem: 'viendr-', conditionnel: 'je viendrais', subjonctif: 'que je vienne' },
  { verb: 'prendre', futurStem: 'prendr-', conditionnel: 'je prendrais', subjonctif: 'que je prenne' },
];

export const GrammarRules: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(GRAMMAR_RULES[0].id);

  const selectedRule =
    GRAMMAR_RULES.find((r) => r.id === activeSection) || GRAMMAR_RULES[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-1">
          <BookMarked className="w-4 h-4" />
          <span>Grammar Reference & Cheat Sheets</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
          Fundamental Conjugation Rules
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Structured reference tables, mnemonic devices, and irregular stems for French grammar mastery.
        </p>

        {/* Navigation pills */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-stone-100">
          {GRAMMAR_RULES.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => setActiveSection(rule.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === rule.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {rule.badge} : {rule.title.split(':')[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveSection('irregular-stems')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSection === 'irregular-stems'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            ★ Irregular Stems
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSection === 'irregular-stems' ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Reference Chart
            </span>
            <h3 className="text-2xl font-bold font-serif text-stone-900 mt-2">
              Irregular Future & Conditional Stems
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              The endings for Futur Simple (-ai, -as, -a, -ons, -ez, -ont) and Conditionnel (-ais, -ais, -ait, -ions, -iez, -aient) are strictly regular for every verb in French! Only the stem (radical) changes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-200 bg-stone-50 text-stone-700 font-semibold">
                  <th className="py-3 px-4">Verb (Infinitive)</th>
                  <th className="py-3 px-4">Future / Conditional Stem</th>
                  <th className="py-3 px-4">Conditional Example</th>
                  <th className="py-3 px-4">Subjunctive Stem (Je)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {IRREGULAR_STEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-serif font-bold text-stone-900">
                      {item.verb}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {item.futurStem}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-800">
                      {item.conditionnel}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-800">
                      {item.subjonctif}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-xs text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              <strong>Golden Rule:</strong> Once you know the future stem (e.g. <em>ir-</em> for aller), simply append the regular imparfait endings to form the conditional (<em>j'irais, tu irais...</em>).
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              {selectedRule.badge}
            </span>
            <h3 className="text-2xl font-bold font-serif text-stone-900 mt-2">
              {selectedRule.title}
            </h3>
            <p className="text-xs font-medium text-stone-500 italic mt-0.5">
              {selectedRule.subtitle}
            </p>
            <p className="text-sm text-stone-700 mt-2 leading-relaxed">
              {selectedRule.summary}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-semibold">
                  {selectedRule.tableHeaders.map((head, idx) => (
                    <th key={idx} className="py-3 px-3.5 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {selectedRule.tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-stone-900 whitespace-nowrap bg-stone-50/30">
                      {row.label}
                    </td>
                    {row.cells.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 font-mono text-stone-800 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key takeaway */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
            <Compass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Key Rule to Remember:</strong>
              <p className="text-amber-900 leading-relaxed">
                {selectedRule.keyTakeaway}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
