// Text helpers for the content validator.

/** Remove the content markup (bold markers, list dashes, table marker) before counting. */
export function plain(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/^\s*-\s+/gm, '')
    .replace(/\{table\}/g, ' ');
}

/** Words as a reader counts them: numbers like 100 or ₹9 count as words, symbols alone do not. */
export function countWords(s: string): number {
  const m = plain(s).match(/[\p{L}\p{N}₹][\p{L}\p{N}₹'’.,%&-]*/gu);
  return m ? m.length : 0;
}

const ABBREVIATIONS = ['e.g.', 'i.e.', 'vs.', 'etc.', 'a.m.', 'p.m.', 'Ltd.', 'Co.', 'No.', 'approx.'];

/** Split prose into sentences. Decimals (25.7) and common abbreviations do not end a sentence. */
export function sentences(s: string): string[] {
  let t = plain(s).replace(/\s+/g, ' ').trim();
  if (!t) return [];
  for (const a of ABBREVIATIONS) t = t.split(a).join(a.replace(/\./g, '\u0000'));
  return t
    .split(/(?<=[.!?]['"’”)]?)\s+(?=['"‘“(]?[A-Z0-9₹$−])/)
    .map((p) => p.replace(/\u0000/g, '.').trim())
    .filter(Boolean);
}

/**
 * Characters the self-hosted IBM Plex Sans subsets (latin + latin-ext) can draw.
 * Anything else would fall back to a system font, so the validator rejects it.
 */
export function unsupportedChars(s: string): string[] {
  const bad = new Set<string>();
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    const ok =
      c <= 0xff ||
      (c >= 0x2000 && c <= 0x206f) ||
      c === 0x20b9 || // ₹
      c === 0x20ac || // €
      c === 0x2212 || // − minus
      c === 0x2122;
    if (!ok) bad.add(ch);
  }
  return [...bad];
}
