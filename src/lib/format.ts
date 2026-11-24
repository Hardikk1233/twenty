// Number formatting and parsing. Indian digit grouping (1,00,000) because the course is India first.

const figureFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

const fixedFormats = new Map<number, Intl.NumberFormat>();
const fixedFormat = (decimals: number) => {
  let f = fixedFormats.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    fixedFormats.set(decimals, f);
  }
  return f;
};

/** A statement figure: negatives in brackets, as printed accounts show them. */
export function formatFigure(v: number, decimals?: number): { text: string; negative: boolean } {
  const text = (decimals === undefined ? figureFormat : fixedFormat(decimals)).format(Math.abs(v));
  return v < 0 ? { text: `(${text})`, negative: true } : { text, negative: false };
}

/** A value with its unit, as a sentence would write it: ₹9 crore, 20%, 10.1x, 18 days. */
export function formatWithUnit(v: number, unit: string): string {
  const n = figureFormat.format(v);
  if (unit === '%') return `${n}%`;
  if (unit === 'x') return `${n}x`;
  if (unit === '₹') return `₹${n}`;
  if (unit.startsWith('₹ ')) return `₹${n} ${unit.slice(2)}`;
  return `${n} ${unit}`;
}

/**
 * Reads what a learner typed into a numeric answer. Accepts 1,000 and 1,00,000, a leading ₹,
 * a trailing % or x, and negatives written as -3, −3 or (3). Returns null if it is not a number.
 */
export function parseNumberInput(input: string): number | null {
  let s = input.trim().replace(/[₹%x×\s]/gi, '').replace(/,/g, '').replace(/−/g, '-');
  let negative = false;
  const bracketed = /^\((.*)\)$/.exec(s);
  if (bracketed) {
    negative = true;
    s = bracketed[1] ?? '';
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
