import { describe, expect, it } from 'vitest';
import { normalise, initialState } from '../state/store';
import type { State } from '../state/types';
import { itemForKey, pickFinalTest, pickReviewQuestions, type PoolEntry } from './session';
import { searchGlossary, slugify, type GlossaryEntry } from '../content/glossary';

/** A seeded random generator, so shuffles are repeatable in tests. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const pool: PoolEntry[] = [];
for (let day = 1; day <= 30; day++) {
  const phase = day <= 6 ? 1 : day <= 11 ? 2 : day <= 17 ? 3 : day <= 24 ? 4 : 5;
  for (let q = 1; q <= 6; q++) pool.push({ key: `d${String(day).padStart(2, '0')}-q${q}`, day, phase });
}

const finished = (s: State, ...days: number[]): State => ({
  ...s,
  days: Object.fromEntries(
    days.map((d) => [d, { firstFinished: '2026-11-20', lastFinished: '2026-11-20', score: 6, total: 6, missed: [] }]),
  ),
});

describe('review questions in a day quiz', () => {
  it('takes due questions from earlier days first, most overdue first', () => {
    const s: State = {
      ...finished(initialState(), 1, 2, 3),
      review: {
        'd02-q3': { due: '2026-11-24', step: 1, streak: 0 },
        'd01-q5': { due: '2026-11-22', step: 2, streak: 1 },
        'd04-q1': { due: '2026-11-20', step: 1, streak: 0 }, // not an earlier day than Day 4
      },
    };
    expect(pickReviewQuestions(s, 4, '2026-11-24', pool, 2, seeded())).toEqual(['d01-q5', 'd02-q3']);
  });

  it('fills with random questions from finished earlier days when too few are due', () => {
    const s: State = {
      ...finished(initialState(), 1, 2),
      review: {
        'd01-q1': { due: '2026-11-24', step: 1, streak: 0 },
        'd02-q2': { due: '2026-11-30', step: 1, streak: 0 }, // scheduled for later: not picked early
      },
    };
    const picked = pickReviewQuestions(s, 3, '2026-11-24', pool, 2, seeded());
    expect(picked[0]).toBe('d01-q1');
    expect(picked).toHaveLength(2);
    const extra = pool.find((e) => e.key === picked[1])!;
    expect(extra.day).toBeLessThan(3);
    expect(picked[1]).not.toBe('d02-q2');
  });

  it('picks nothing on Day 1 and never from days not yet finished', () => {
    expect(pickReviewQuestions(initialState(), 1, '2026-11-24', pool)).toEqual([]);
    expect(pickReviewQuestions(finished(initialState()), 5, '2026-11-24', pool)).toEqual([]);
  });
});

describe('final test', () => {
  it('draws twenty different questions, four from each phase, in phase order', () => {
    const keys = pickFinalTest(pool, 20, seeded(7));
    expect(keys).toHaveLength(20);
    expect(new Set(keys).size).toBe(20);
    const phases = keys.map((k) => pool.find((e) => e.key === k)!.phase);
    expect(phases).toEqual([...phases].sort((a, b) => a - b));
    for (const p of [1, 2, 3, 4, 5]) expect(phases.filter((x) => x === p)).toHaveLength(4);
  });

  it('still returns a full test when a phase is short of questions', () => {
    const small = pool.filter((e) => e.phase !== 5 || e.day === 25).slice(0);
    const keys = pickFinalTest(small, 20, seeded(3));
    expect(keys).toHaveLength(20);
    expect(new Set(keys).size).toBe(20);
  });
});

describe('review keys', () => {
  it('maps questions and speaking prompts back to quiz items', () => {
    const isQuestion = (k: string) => k === 'd01-concept1';
    const hasDay = (d: number) => d <= 3;
    expect(itemForKey('d01-concept1', isQuestion, hasDay)).toEqual({ kind: 'question', key: 'd01-concept1', review: true });
    expect(itemForKey('d03-speak', isQuestion, hasDay)).toEqual({ kind: 'speak', key: 'd03-speak', day: 3, review: true });
    expect(itemForKey('d09-speak', isQuestion, hasDay)).toBeNull();
    expect(itemForKey('d01-gone', isQuestion, hasDay)).toBeNull();
  });
});

describe('saved data', () => {
  it('upgrades a step-1 quiz in progress and fills new fields', () => {
    const old = {
      version: 1,
      days: {},
      finished: [],
      review: {},
      pages: { 1: 5 },
      session: { day: 1, items: [{ kind: 'question', key: 'd01-concept1', review: false }], index: 0, responses: {}, revealed: [] },
      settings: { theme: 'dark', unlockAll: false },
      capstone: {},
    };
    const s = normalise(old)!;
    expect(s.session?.mode).toBe('day');
    expect(s.settings.theme).toBe('dark');
    expect(s.capstone).toEqual({ client: null, brief: {}, revealed: false });
  });

  it('rejects files that are not Twenty progress', () => {
    expect(normalise({ hello: 'world' })).toBeNull();
    expect(normalise(null)).toBeNull();
    expect(normalise({ version: 2 })).toBeNull();
  });
});

describe('glossary', () => {
  const entries: GlossaryEntry[] = [
    { slug: 'profit-after-tax', term: 'Profit after tax', aka: ['PAT', 'net income'], definition: 'What is left for shareholders.', day: 2, phase: 1 },
    { slug: 'profit', term: 'Profit', aka: ['earnings'], definition: 'Revenue minus expenses.', day: 1, phase: 1 },
    { slug: 'ebitda', term: 'EBITDA', aka: ['PBDIT'], definition: 'Earnings before interest, tax, depreciation and amortisation.', day: 2, phase: 1 },
  ];

  it('ranks names, then other names, then definitions', () => {
    expect(searchGlossary('pat', entries).map((e) => e.term)).toEqual(['Profit after tax']);
    expect(searchGlossary('profit', entries).map((e) => e.term)).toEqual(['Profit', 'Profit after tax']);
    expect(searchGlossary('earnings', entries).map((e) => e.term)).toEqual(['Profit', 'EBITDA']);
    expect(searchGlossary('  ', entries)).toHaveLength(3);
  });

  it('makes stable link slugs', () => {
    expect(slugify('EV/EBITDA')).toBe('ev-ebitda');
    expect(slugify('Long/short')).toBe('long-short');
    expect(slugify('Know your customer')).toBe('know-your-customer');
  });
});
