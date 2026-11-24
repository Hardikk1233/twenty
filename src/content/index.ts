// Loads every day's JSON at build time. Bundling the lessons into the app means the service
// worker's pre-cache holds all of them, so the course works offline once installed.

import { localDate } from '../lib/dates';
import {
  itemForKey,
  pickFinalTest,
  pickReviewQuestions,
  questionItem,
  speakItem,
  type PoolEntry,
} from '../lib/session';
import { dueReviews } from '../lib/progress';
import { typeset } from '../lib/typeset';
import type { SessionItem, State } from '../state/types';
import { CURRICULUM } from './curriculum';
import type { Day, Question } from './types';

const modules = import.meta.glob<Day>('../../content/days/day*.json', { eager: true, import: 'default' });

export const DAYS: Day[] = Object.values(modules)
  .map((d) => typeset(d))
  .sort((a, b) => a.day - b.day);

const byNumber = new Map(DAYS.map((d) => [d.day, d]));
export const getDay = (n: number): Day | undefined => byNumber.get(n);

export const titleOf = (n: number): string => CURRICULUM[n - 1]?.title ?? `Day ${n}`;

/** Every question by id, with the day it belongs to. */
export const QUESTIONS = new Map<string, { question: Question; day: number }>(
  DAYS.flatMap((d) => d.quiz.map((q) => [q.id, { question: q, day: d.day }] as const)),
);

export const POOL: PoolEntry[] = DAYS.flatMap((d) => d.quiz.map((q) => ({ key: q.id, day: d.day, phase: d.phase })));

export { speakKey } from '../lib/session';

/** A day's quiz: its six questions, two review questions from earlier days, then Say it out loud. */
export function buildDayItems(day: Day, state: State, today = localDate()): SessionItem[] {
  if (day.capstone) {
    return [...pickFinalTest(POOL).map((k) => questionItem(k, false)), speakItem(day.day, false)];
  }
  const review = day.day >= 2 ? pickReviewQuestions(state, day.day, today, POOL) : [];
  return [
    ...day.quiz.map((q) => questionItem(q.id, false)),
    ...review.map((k) => questionItem(k, true)),
    speakItem(day.day, false),
  ];
}

/** Every review card due today: missed questions first, then shaky spoken answers. */
export function buildReviewItems(state: State, today = localDate()): SessionItem[] {
  const items = dueReviews(state, today)
    .map((k) => itemForKey(k, (key) => QUESTIONS.has(key), (n) => byNumber.has(n)))
    .filter((i): i is SessionItem => i !== null);
  return [...items.filter((i) => i.kind === 'question'), ...items.filter((i) => i.kind === 'speak')];
}
