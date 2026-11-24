// The glossary, built automatically from every lesson's Terms page.

import { DAYS } from './index';
import type { Phase } from './types';

export type GlossaryEntry = {
  slug: string;
  term: string;
  aka: string[];
  definition: string;
  formula?: string;
  day: number;
  phase: Phase;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const GLOSSARY: GlossaryEntry[] = DAYS.flatMap((d) =>
  d.pages.terms.map((t) => ({
    slug: slugify(t.term),
    term: t.term,
    aka: t.aka ?? [],
    definition: t.definition,
    formula: t.formula,
    day: d.day,
    phase: d.phase,
  })),
).sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

/** First letter used for the A to Z headings. */
export const letterOf = (term: string) => {
  const c = term.charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
};

const fold = (s: string) => s.toLowerCase().replace(/[’']/g, "'");

/**
 * Matches a search against names first, then other names, then definitions, so typing "pat"
 * finds Profit after tax before any definition that merely mentions it.
 */
export function searchGlossary(query: string, entries: readonly GlossaryEntry[] = GLOSSARY): GlossaryEntry[] {
  const q = fold(query.trim());
  if (!q) return [...entries];
  const scored: { e: GlossaryEntry; score: number }[] = [];
  for (const e of entries) {
    const term = fold(e.term);
    const akas = e.aka.map(fold);
    let score = 0;
    if (term === q || akas.includes(q)) score = 5;
    else if (term.startsWith(q)) score = 4;
    else if (akas.some((a) => a.startsWith(q))) score = 3;
    else if (term.includes(q) || akas.some((a) => a.includes(q))) score = 2;
    else if (fold(e.definition).includes(q) || (e.formula && fold(e.formula).includes(q))) score = 1;
    if (score) scored.push({ e, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.e.term.localeCompare(b.e.term, 'en', { sensitivity: 'base' }))
    .map((s) => s.e);
}
