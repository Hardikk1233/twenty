import { describe, expect, it } from 'vitest';
import { formatFigure, formatWithUnit, parseNumberInput } from './format';
import { smartQuotes } from './typeset';

describe('parseNumberInput', () => {
  it.each([
    ['20', 20],
    ['20%', 20],
    [' 25.7 ', 25.7],
    ['₹1,000', 1000],
    ['1,00,000', 100000],
    ['10.1x', 10.1],
    ['.5', 0.5],
    ['+4', 4],
    ['-3', -3],
    ['−3', -3],
    ['(3)', -3],
  ])('reads %j as %d', (input, expected) => {
    expect(parseNumberInput(input)).toBe(expected);
  });

  it.each(['', 'abc', '1.2.3', '--3', '12 crore'])('rejects %j', (input) => {
    expect(parseNumberInput(input)).toBeNull();
  });
});

describe('formatFigure', () => {
  it('brackets negatives and groups digits the Indian way', () => {
    expect(formatFigure(-40)).toEqual({ text: '(40)', negative: true });
    expect(formatFigure(100).text).toBe('100');
    expect(formatFigure(100000).text).toBe('1,00,000');
    expect(formatFigure(25.714).text).toBe('25.71');
  });
});

describe('formatWithUnit', () => {
  it('writes the unit the way a sentence would', () => {
    expect(formatWithUnit(9, '₹ crore')).toBe('₹9 crore');
    expect(formatWithUnit(20, '%')).toBe('20%');
    expect(formatWithUnit(10.1, 'x')).toBe('10.1x');
    expect(formatWithUnit(35, '₹')).toBe('₹35');
    expect(formatWithUnit(14.6, 'days')).toBe('14.6 days');
  });
});

describe('smartQuotes', () => {
  it('turns straight quotes into typographic ones', () => {
    expect(smartQuotes("Brew Lane's year")).toBe('Brew Lane’s year');
    expect(smartQuotes("asks, 'Where did the cash go?' Then")).toBe('asks, ‘Where did the cash go?’ Then');
    expect(smartQuotes("shareholders' funds")).toBe('shareholders’ funds');
    expect(smartQuotes('a "quoted" word')).toBe('a “quoted” word');
  });
});
