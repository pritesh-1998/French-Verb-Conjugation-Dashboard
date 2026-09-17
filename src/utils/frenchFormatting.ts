/**
 * French Verb Formatting & Pronunciation Helpers
 * 
 * Guarantees standard French orthography, proper pronoun isolation,
 * and authentic natural pronunciation without duplicate pronouns or garbled endings.
 */

import { ConjugationForm } from '../types';

/**
 * Strips any leading French subject pronoun or subjunctive marker from a conjugated form,
 * returning solely the conjugated verb.
 *
 * Examples:
 * - "je regarde" -> "regarde"
 * - "j'aime" -> "aime"
 * - "il regarde" -> "regarde"
 * - "nous regardons" -> "regardons"
 * - "qu'il regarde" -> "regarde"
 * - "regarde" -> "regarde"
 */
export function getIsolatedVerbForm(form: string, pronoun?: string): string {
  if (!form) return '';
  let str = form.trim();

  // If a specific pronoun is known, strip it cleanly
  if (pronoun) {
    const cleanP = pronoun.trim().replace(/[’']/g, "['’]");
    const reg = new RegExp(`^${cleanP}\\s*`, 'i');
    str = str.replace(reg, '');
  }

  // Also strip any standard leading French pronoun (je, j', tu, il, elle, on, nous, vous, ils, elles)
  // as well as subjunctive markers (que je, qu'il, etc.) and accidental "j "
  str = str.replace(
    /^(que\s+)?(j['’]|j\s+|je\s+|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+|qu['’](il|elle|on|ils|elles)\s*)/i,
    ''
  ).trim();

  return str;
}

/**
 * Extracts the stem and grammatical ending cleanly from a conjugation form.
 * Ensures the stem NEVER includes a subject pronoun or butchered letters.
 *
 * Returns { stem, ending } or null if cannot be split cleanly.
 */
export function getStemAndEnding(item: {
  form: string;
  pronoun?: string;
  stem?: string;
  ending?: string;
}): { stem: string; ending: string } | null {
  const isolated = getIsolatedVerbForm(item.form, item.pronoun);
  const ending = (item.ending || '').trim();

  // If ending matches the end of the isolated form, slice from the end
  if (ending && isolated.endsWith(ending) && isolated.length > ending.length) {
    return {
      stem: isolated.slice(0, -ending.length),
      ending,
    };
  }

  // If item.stem + item.ending equals isolated
  if (item.stem && item.ending && `${item.stem}${item.ending}`.toLowerCase() === isolated.toLowerCase()) {
    return {
      stem: item.stem,
      ending: item.ending,
    };
  }

  return null;
}

/**
 * Formats a clean, natural French phrase for native audio speech synthesis.
 *
 * Rules:
 * 1. Never pronounce multi-pronoun displays (e.g. "il / elle / on" -> only "il")
 * 2. Never pronounce slashes ("/") or parentheses ("(tu)")
 * 3. Never duplicate pronouns (e.g. "je je regarde" -> "je regarde")
 * 4. Apply standard French elision for vowels ("je" + "aime" -> "j'aime")
 * 5. Handle French imperative naturally with NO pronoun ("regarde !", not "tu regarde")
 *
 * @param pronounDisplay The pronoun or pronounDisplay (e.g. "je", "il / elle / on", "(tu)")
 * @param verbForm The conjugated verb form (e.g. "regarde", "je regarde", "aime")
 */
export function formatSpokenConjugation(pronounDisplay: string, verbForm: string): string {
  if (!verbForm) return pronounDisplay || '';

  const cleanForm = verbForm.trim();
  const cleanPronoun = (pronounDisplay || '').trim();

  // Imperative mood has no subject pronoun in spoken French
  if (/^\(?\s*(tu|nous|vous)\s*\)?$/i.test(cleanPronoun) && cleanPronoun.includes('(')) {
    return getIsolatedVerbForm(cleanForm);
  }

  // Extract a single primary pronoun from complex displays like "il / elle / on" -> "il"
  let singlePronoun = cleanPronoun;
  if (cleanPronoun.includes('/')) {
    const parts = cleanPronoun.split('/').map((p) => p.trim());
    singlePronoun = parts[0] || 'il';
  }
  singlePronoun = singlePronoun.replace(/[\(\)]/g, '').trim();

  // Extract isolated verb
  const isolated = getIsolatedVerbForm(cleanForm);
  if (!isolated) return cleanForm;

  const startsWithVowel = /^[aeiouyhéèêëàâîïôûùœ]/i.test(isolated);

  // 1st person singular: je / j'
  if (/^je(\s*\/\s*j['’])?$/i.test(singlePronoun) || singlePronoun === 'je' || singlePronoun === "j'") {
    return startsWithVowel ? `j'${isolated}` : `je ${isolated}`;
  }

  // Subjunctive 1st person: que je / que j'
  if (/^que\s+je/i.test(singlePronoun)) {
    return startsWithVowel ? `que j'${isolated}` : `que je ${isolated}`;
  }

  // Subjunctive 3rd person: qu'il / qu'ils
  if (/^qu['’]il/i.test(singlePronoun)) {
    return `qu'il ${isolated}`;
  }
  if (/^qu['’]ils/i.test(singlePronoun)) {
    return `qu'ils ${isolated}`;
  }

  // 3rd person plural: ils / elles -> "ils"
  if (/^ils(\s*\/\s*elles)?$/i.test(singlePronoun)) {
    return `ils ${isolated}`;
  }

  if (!singlePronoun) return isolated;

  return `${singlePronoun} ${isolated}`.replace(/[’']/g, "'").replace(/'\s+/g, "'");
}
