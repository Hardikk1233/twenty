// Content is written with plain ' and " so it is easy to edit. This turns them into
// typographic quotes and apostrophes when the content loads.

export function smartQuotes(s: string): string {
  return s
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/(^|[\s([{“—–-])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[\s([{‘—–-])"/g, '$1“')
    .replace(/"/g, '”');
}

/** Applies smartQuotes to every string in a JSON value, except keys and machine fields. */
export function typeset<T>(value: T, skip: ReadonlySet<string> = new Set(['id', 'check', 'kind', 'type'])): T {
  if (typeof value === 'string') return smartQuotes(value) as T;
  if (Array.isArray(value)) return value.map((v) => typeset(v, skip)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = skip.has(k) ? v : typeset(v, skip);
    return out as T;
  }
  return value;
}
