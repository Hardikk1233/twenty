// All progress lives on the device, in localStorage, under one versioned key.

import { useSyncExternalStore } from 'react';
import { nextReview } from '../lib/progress';
import type { Capstone, Response, Session, SessionItem, State, Theme } from './types';

export const STORAGE_KEY = 'twenty:v1';

const emptyCapstone = (): Capstone => ({ client: null, brief: {}, revealed: false });

export function initialState(): State {
  return {
    version: 1,
    days: {},
    finished: [],
    review: {},
    pages: {},
    session: null,
    settings: { theme: 'system', unlockAll: false },
    capstone: emptyCapstone(),
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Accepts saved or imported data, filling any missing fields with defaults. Null if not ours. */
export function normalise(raw: unknown): State | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  const base = initialState();
  const r = raw as Partial<State>;
  const settings: Record<string, unknown> = isRecord(r.settings) ? r.settings : {};
  const theme = ['system', 'light', 'dark'].includes(settings.theme as string) ? (settings.theme as Theme) : 'system';
  const cap = isRecord(r.capstone) ? (r.capstone as Partial<Capstone>) : {};
  const session = isRecord(r.session) && Array.isArray(r.session.items) ? (r.session as Session) : null;
  return {
    version: 1,
    days: isRecord(r.days) ? (r.days as State['days']) : base.days,
    finished: Array.isArray(r.finished) ? r.finished.filter((d) => typeof d === 'string') : [],
    review: isRecord(r.review) ? (r.review as State['review']) : base.review,
    pages: isRecord(r.pages) ? (r.pages as State['pages']) : base.pages,
    session: session ? { ...session, mode: session.mode === 'review' ? 'review' : 'day', revealed: session.revealed ?? [] } : null,
    settings: { theme, unlockAll: settings.unlockAll === true },
    capstone: {
      client: typeof cap.client === 'string' ? cap.client : null,
      brief: isRecord(cap.brief) ? (cap.brief as Record<string, string>) : {},
      revealed: cap.revealed === true,
    },
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return (raw && normalise(JSON.parse(raw))) || initialState();
  } catch {
    return initialState();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode). The app keeps working for this visit.
  }
  listeners.forEach((l) => l());
}

export const getState = () => state;

export function useAppState(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getState,
    getState,
  );
}

// ---------------------------------------------------------------------------------------------
// Lessons and quizzes

export function setPage(day: number, page: number) {
  if (state.pages[day] === page) return;
  commit({ ...state, pages: { ...state.pages, [day]: page } });
}

/** Applies the answers in a session to the review schedule. */
function scheduleReviews(s: Session, review: State['review'], today: string): State['review'] {
  const next = { ...review };
  for (const item of s.items) {
    const r = s.responses[item.key];
    if (!r) continue;
    const scheduled = nextReview(next[item.key], r.correct, today);
    if (scheduled) next[item.key] = scheduled;
    else delete next[item.key];
  }
  return next;
}

/**
 * Starts a quiz, unless the same one is already in progress. An unfinished set of review cards
 * is closed first, keeping the answers already given.
 */
export function startSession(mode: Session['mode'], day: number, items: SessionItem[], today: string) {
  const current = state.session;
  if (current && current.mode === mode && current.day === day) return;
  const review = current?.mode === 'review' ? scheduleReviews(current, state.review, today) : state.review;
  commit({ ...state, review, session: { mode, day, items, index: 0, responses: {}, revealed: [] } });
}

function updateSession(fn: (s: Session) => Session) {
  if (state.session) commit({ ...state, session: fn(state.session) });
}

export function answer(key: string, response: Response) {
  updateSession((s) => (s.responses[key] ? s : { ...s, responses: { ...s.responses, [key]: response } }));
}

export function reveal(key: string) {
  updateSession((s) => (s.revealed.includes(key) ? s : { ...s, revealed: [...s.revealed, key] }));
}

export function markSpeak(key: string, mark: 'got' | 'shaky') {
  updateSession((s) => ({ ...s, responses: { ...s.responses, [key]: { correct: mark === 'got', mark } } }));
}

export function advance() {
  updateSession((s) => ({ ...s, index: Math.min(s.index + 1, s.items.length) }));
}

/**
 * Finishes the day: records the score, adds the date to the streak, schedules every missed
 * question (and a shaky spoken answer) for review, and clears the lesson position.
 */
export function finishDay(today: string) {
  const s = state.session;
  if (!s || s.mode !== 'day') return;
  const questions = s.items.filter((i) => i.kind === 'question');
  const score = questions.filter((i) => s.responses[i.key]?.correct).length;
  const missed = s.items.filter((i) => s.responses[i.key] && !s.responses[i.key]!.correct).map((i) => i.key);
  const prev = state.days[s.day];
  const pages = { ...state.pages };
  delete pages[s.day];
  commit({
    ...state,
    days: {
      ...state.days,
      [s.day]: { firstFinished: prev?.firstFinished ?? today, lastFinished: today, score, total: questions.length, missed },
    },
    finished: [...new Set([...state.finished, today])].sort(),
    review: scheduleReviews(s, state.review, today),
    pages,
    session: null,
  });
}

/** Ends a set of review cards. Reviews update the schedule but do not count towards the streak. */
export function finishReview(today: string) {
  const s = state.session;
  if (!s || s.mode !== 'review') return;
  commit({ ...state, review: scheduleReviews(s, state.review, today), session: null });
}

// ---------------------------------------------------------------------------------------------
// Capstone

export function chooseClient(client: string | null) {
  commit({ ...state, capstone: { ...state.capstone, client } });
}

export function writeBrief(field: string, text: string) {
  commit({ ...state, capstone: { ...state.capstone, brief: { ...state.capstone.brief, [field]: text } } });
}

export function revealModelBrief() {
  commit({ ...state, capstone: { ...state.capstone, revealed: true } });
}

// ---------------------------------------------------------------------------------------------
// Settings

export function setTheme(theme: Theme) {
  commit({ ...state, settings: { ...state.settings, theme } });
}

export function setUnlockAll(unlockAll: boolean) {
  commit({ ...state, settings: { ...state.settings, unlockAll } });
}

/** Replaces all progress with imported data. Returns false if the data is not a Twenty file. */
export function importState(raw: unknown): boolean {
  const next = normalise(raw);
  if (!next) return false;
  commit(next);
  return true;
}

/** Clears all progress on this device, keeping the theme setting. */
export function resetProgress() {
  commit({ ...initialState(), settings: { ...initialState().settings, theme: state.settings.theme } });
}
