// Pure progress rules: unlocking, today's lesson, streaks and the review schedule.
// Kept free of React and storage so they are easy to test.

import { TOTAL_DAYS } from '../content/curriculum';
import { addDays } from './dates';
import type { ReviewItem, State } from '../state/types';

export const isDone = (s: State, day: number) => s.days[day] !== undefined;

/** A day opens when the previous day's quiz is finished, at any score. No calendar lock. */
export const isOpen = (s: State, day: number) => day === 1 || s.settings.unlockAll || isDone(s, day - 1);

/** Today's lesson: the lowest day not yet finished, or null when all 30 are done. */
export function currentDay(s: State): number | null {
  for (let d = 1; d <= TOTAL_DAYS; d++) if (!isDone(s, d)) return d;
  return null;
}

/**
 * Consecutive calendar days, ending today, on which a lesson was finished. If nothing is
 * finished yet today, the run ending yesterday still counts, so the streak does not read
 * zero every morning before the day's lesson.
 */
export function streak(finished: readonly string[], today: string): number {
  const set = new Set(finished);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

/** The day finished most recently today, if any (highest day number wins). */
export function finishedToday(s: State, today: string): number | null {
  let best: number | null = null;
  for (const [day, rec] of Object.entries(s.days)) {
    if (rec.lastFinished === today && (best === null || Number(day) > best)) best = Number(day);
  }
  return best;
}

/** Review gaps from the brief: next day, then three days later, then seven days later. */
export const REVIEW_INTERVALS = [1, 3, 7] as const;
/** An item retires after this many correct answers in a row. */
export const RETIRE_AFTER = 2;

/**
 * Updates one review item after an answer. A miss enters the queue due tomorrow. Each later
 * appearance moves along the 1, 3, 7 day schedule (staying at 7). A miss resets the run of
 * correct answers; two correct in a row retire the item (returns null).
 */
export function nextReview(prev: ReviewItem | undefined, correct: boolean, today: string): ReviewItem | null {
  if (!prev) return correct ? null : { due: addDays(today, REVIEW_INTERVALS[0]), step: 1, streak: 0 };
  const step = Math.min(prev.step, REVIEW_INTERVALS.length - 1);
  const due = addDays(today, REVIEW_INTERVALS[step]!);
  const nextStep = Math.min(step + 1, REVIEW_INTERVALS.length - 1);
  if (!correct) return { due, step: nextStep, streak: 0 };
  const run = prev.streak + 1;
  return run >= RETIRE_AFTER ? null : { due, step: nextStep, streak: run };
}

/** Review keys due today or earlier, most overdue first. */
export function dueReviews(s: State, today: string): string[] {
  return Object.entries(s.review)
    .filter(([, item]) => item.due <= today)
    .sort(([a, x], [b, y]) => x.due.localeCompare(y.due) || a.localeCompare(b))
    .map(([key]) => key);
}
