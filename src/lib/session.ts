// Builds the list of items for a quiz: a day's questions plus review, review cards on their
// own, or the Day 30 final test. Pure functions over a question pool, so they are testable.

import type { SessionItem, State } from '../state/types';
import { dueReviews } from './progress';

export type PoolEntry = { key: string; day: number; phase: number };

export const REVIEW_PER_DAY = 2;
export const FINAL_TEST_SIZE = 20;

export const speakKey = (day: number) => `d${String(day).padStart(2, '0')}-speak`;
const SPEAK_KEY = /^d(\d{2})-speak$/;

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(list: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Review questions for a day's quiz. Questions due for review from earlier days come first,
 * most overdue first. If fewer are due than needed, the rest are picked at random from days
 * already finished, skipping questions already scheduled for later.
 */
export function pickReviewQuestions(
  state: State,
  day: number,
  today: string,
  pool: readonly PoolEntry[],
  count = REVIEW_PER_DAY,
  rng: () => number = Math.random,
): string[] {
  const byKey = new Map(pool.map((e) => [e.key, e]));
  const due = dueReviews(state, today).filter((k) => (byKey.get(k)?.day ?? Infinity) < day);
  const picked = due.slice(0, count);
  if (picked.length < count) {
    const candidates = pool.filter(
      (e) => e.day < day && state.days[e.day] !== undefined && !picked.includes(e.key) && !(e.key in state.review),
    );
    picked.push(...shuffle(candidates, rng).slice(0, count - picked.length).map((e) => e.key));
  }
  return picked;
}

/** Twenty questions across the whole course: four from each phase, in phase order. */
export function pickFinalTest(pool: readonly PoolEntry[], size = FINAL_TEST_SIZE, rng: () => number = Math.random): string[] {
  const phases = [...new Set(pool.map((e) => e.phase))].sort((a, b) => a - b);
  const quota = Math.floor(size / Math.max(phases.length, 1));
  const picked: PoolEntry[] = [];
  for (const phase of phases) picked.push(...shuffle(pool.filter((e) => e.phase === phase), rng).slice(0, quota));
  if (picked.length < size) {
    const rest = shuffle(pool.filter((e) => !picked.includes(e)), rng);
    picked.push(...rest.slice(0, size - picked.length));
  }
  return picked
    .slice(0, size)
    .sort((a, b) => a.phase - b.phase || a.day - b.day)
    .map((e) => e.key);
}

export function questionItem(key: string, review: boolean): SessionItem {
  return { kind: 'question', key, review };
}

export function speakItem(day: number, review: boolean): SessionItem {
  return { kind: 'speak', key: speakKey(day), day, review };
}

/** Turns a review-queue key back into a quiz item, if its content still exists. */
export function itemForKey(key: string, isQuestion: (key: string) => boolean, hasDay: (day: number) => boolean): SessionItem | null {
  if (isQuestion(key)) return questionItem(key, true);
  const m = SPEAK_KEY.exec(key);
  if (m && hasDay(Number(m[1]))) return speakItem(Number(m[1]), true);
  return null;
}
