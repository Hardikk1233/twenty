import { describe, expect, it } from 'vitest';
import { evaluate, roundTo } from './expr';
import { countWords, sentences, unsupportedChars } from './text';

describe('evaluate', () => {
  const vars = { revenue: 100, cogs: 40, opex: 40, revenueFY24: 64 };

  it('follows arithmetic precedence', () => {
    expect(evaluate('(revenue - cogs - opex) / revenue * 100', vars)).toBe(20);
    expect(evaluate('2 + 3 * 4', vars)).toBe(14);
    expect(evaluate('-2 ^ 2', vars)).toBe(-4);
    expect(evaluate('2 ^ 3 ^ 2', vars)).toBe(512);
  });

  it('supports the CAGR form and helper functions', () => {
    expect(evaluate('((revenue / revenueFY24) ^ (1 / 2) - 1) * 100', vars)).toBeCloseTo(25, 10);
    expect(evaluate('round(6 / 40 * 365, 1)', vars)).toBe(54.8);
    expect(evaluate('max(cogs, opex, 3)', vars)).toBe(40);
  });

  it('rejects unknown figures, division by zero and stray input', () => {
    expect(() => evaluate('ebitdaa * 2', vars)).toThrow(/Unknown figure/);
    expect(() => evaluate('revenue / (cogs - opex)', vars)).toThrow(/Division by zero/);
    expect(() => evaluate('revenue revenue', vars)).toThrow(/trailing/);
    expect(() => evaluate('alert(1)', vars)).toThrow(/Unknown function/);
  });
});

describe('roundTo', () => {
  it('rounds half up despite binary floating point', () => {
    expect(roundTo((6 / 40) * 365, 1)).toBe(54.8);
    expect(roundTo(23.725, 1)).toBe(23.7);
    expect(roundTo(45.625, 1)).toBe(45.6);
    expect(roundTo(-2.5, 0)).toBe(-3);
  });
});

describe('text', () => {
  it('splits sentences but not decimals or abbreviations', () => {
    expect(sentences('Margins rose to 25.7%. Cash fell.')).toHaveLength(2);
    expect(sentences('At 4 p.m. on results day, numbers arrive. A fund reads them.')).toHaveLength(2);
    expect(sentences("He asks, 'Where did the cash go?' The answer is simple.")).toHaveLength(2);
    expect(sentences('One sentence, e.g. this one.')).toHaveLength(1);
  });

  it('counts words, ignoring markup', () => {
    expect(countWords('**Revenue** is ₹100 crore.')).toBe(4);
    expect(countWords('- One item\n- Two items')).toBe(4);
    expect(countWords('100 − 40 = 60')).toBe(3);
  });

  it('flags characters the font cannot draw', () => {
    expect(unsupportedChars('₹9 crore − 3, ‘quoted’ … café')).toEqual([]);
    expect(unsupportedChars('Profit → cash ≈ 9')).toEqual(['→', '≈']);
  });
});
