import { describe, expect, it } from 'vitest';
import { initialState } from '../state/store';
import type { State } from '../state/types';
import { addDays, localDate } from './dates';
import { currentDay, dueReviews, finishedToday, isOpen, nextReview, streak } from './progress';

const done = (s: State, day: number, date = '2026-11-20'): State => ({
  ...s,
  days: { ...s.days, [day]: { firstFinished: date, lastFinished: date, score: 6, total: 6, missed: [] } },
});

describe('dates', () => {
  it('adds days across month, year and leap-day boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-11-24', 7)).toBe('2026-12-01');
  });

  it('formats a local date', () => {
    expect(localDate(new Date(2026, 10, 4, 23, 59))).toBe('2026-11-04');
  });
});

describe('unlocking', () => {
  it('opens day 1, then each day after the previous quiz is finished', () => {
    let s = initialState();
    expect(isOpen(s, 1)).toBe(true);
    expect(isOpen(s, 2)).toBe(false);
    s = done(s, 1);
    expect(isOpen(s, 2)).toBe(true);
    expect(isOpen(s, 3)).toBe(false);
  });

  it('opens every day when unlock all is on', () => {
    const s = { ...initialState(), settings: { theme: 'system' as const, unlockAll: true } };
    expect(isOpen(s, 30)).toBe(true);
  });

  it("today's lesson is the lowest day not finished", () => {
    let s = initialState();
    expect(currentDay(s)).toBe(1);
    s = done(done(s, 1), 2);
    expect(currentDay(s)).toBe(3);
    for (let d = 1; d <= 30; d++) s = done(s, d);
    expect(currentDay(s)).toBeNull();
  });

  it('finds the day finished today', () => {
    let s = done(initialState(), 1, '2026-11-23');
    s = done(s, 2, '2026-11-24');
    expect(finishedToday(s, '2026-11-24')).toBe(2);
    expect(finishedToday(s, '2026-11-25')).toBeNull();
  });
});

describe('streak', () => {
  it('counts consecutive calendar days ending today', () => {
    expect(streak([], '2026-11-24')).toBe(0);
    expect(streak(['2026-11-24'], '2026-11-24')).toBe(1);
    expect(streak(['2026-11-22', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(3);
  });

  it('keeps yesterday’s run alive until today is over', () => {
    expect(streak(['2026-11-22', '2026-11-23'], '2026-11-24')).toBe(2);
  });

  it('breaks on a missed day', () => {
    expect(streak(['2026-11-20', '2026-11-22', '2026-11-24'], '2026-11-24')).toBe(1);
    expect(streak(['2026-11-21', '2026-11-22'], '2026-11-24')).toBe(0);
  });
});

describe('review schedule', () => {
  const today = '2026-11-24';

  it('leaves a correct answer out of the queue', () => {
    expect(nextReview(undefined, true, today)).toBeNull();
  });

  it('brings a miss back the next day', () => {
    expect(nextReview(undefined, false, today)).toEqual({ due: '2026-11-25', step: 1, streak: 0 });
  });

  it('then three days later, and retires after two correct in a row', () => {
    const missed = nextReview(undefined, false, today)!;
    const first = nextReview(missed, true, missed.due)!;
    expect(first).toEqual({ due: '2026-11-28', step: 2, streak: 1 });
    expect(nextReview(first, true, first.due)).toBeNull();
  });

  it('uses the seven-day gap after a further miss, and stays at seven', () => {
    const missed = nextReview(undefined, false, today)!;
    const wrong = nextReview(missed, false, missed.due)!;
    expect(wrong).toEqual({ due: '2026-11-28', step: 2, streak: 0 });
    const right = nextReview(wrong, true, wrong.due)!;
    expect(right).toEqual({ due: '2026-12-05', step: 2, streak: 1 });
    const wrongAgain = nextReview(right, false, right.due)!;
    expect(wrongAgain).toEqual({ due: '2026-12-12', step: 2, streak: 0 });
  });

  it('lists due items, most overdue first', () => {
    const s: State = {
      ...initialState(),
      review: {
        'd02-calc1': { due: '2026-11-24', step: 1, streak: 0 },
        'd01-concept2': { due: '2026-11-20', step: 2, streak: 1 },
        'd03-speak': { due: '2026-11-25', step: 1, streak: 0 },
      },
    };
    expect(dueReviews(s, '2026-11-24')).toEqual(['d01-concept2', 'd02-calc1']);
  });
});
