// A tiny hash router. Hash URLs need no server rewrites, so the app runs from any static host.
// Each pushed entry records its depth, so "close" can step back when there is somewhere to go.

import { useMemo, useSyncExternalStore } from 'react';

export type Route =
  | { name: 'today' }
  | { name: 'path' }
  | { name: 'glossary'; slug?: string }
  | { name: 'settings' }
  | { name: 'review' }
  | { name: 'lesson'; day: number }
  | { name: 'quiz'; day: number }
  | { name: 'capstone'; day: number };

export function parseHash(hash: string): Route {
  const [a, b, c] = hash.replace(/^#\/?/, '').split('/');
  if (a === 'day' && b && /^\d+$/.test(b)) {
    const day = Number(b);
    if (c === 'quiz') return { name: 'quiz', day };
    if (c === 'capstone') return { name: 'capstone', day };
    return { name: 'lesson', day };
  }
  if (a === 'glossary') return b ? { name: 'glossary', slug: decodeURIComponent(b) } : { name: 'glossary' };
  if (a === 'path' || a === 'settings' || a === 'review') return { name: a };
  return { name: 'today' };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'today':
      return '#/';
    case 'lesson':
      return `#/day/${route.day}`;
    case 'quiz':
      return `#/day/${route.day}/quiz`;
    case 'capstone':
      return `#/day/${route.day}/capstone`;
    case 'glossary':
      return route.slug ? `#/glossary/${encodeURIComponent(route.slug)}` : '#/glossary';
    default:
      return `#/${route.name}`;
  }
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
window.addEventListener('popstate', emit);
window.addEventListener('hashchange', emit);

const depth = () => (history.state as { depth?: number } | null)?.depth ?? 0;

export function navigate(to: Route, { replace = false } = {}) {
  if (replace) history.replaceState({ depth: depth() }, '', href(to));
  else history.pushState({ depth: depth() + 1 }, '', href(to));
  emit();
}

/** Steps back if this visit has history to return to; otherwise goes to Today. */
export function goBack() {
  if (depth() > 0) history.back();
  else navigate({ name: 'today' }, { replace: true });
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => location.hash,
  );
  return useMemo(() => parseHash(hash), [hash]);
}
