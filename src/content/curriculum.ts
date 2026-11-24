import type { Phase } from './types';

export const TOTAL_DAYS = 30;

export const PHASE_NAMES: Record<Phase, string> = {
  1: 'Read a business',
  2: 'Judge a business',
  3: 'Value a business',
  4: 'Know the clients',
  5: 'Build and sell AI for finance',
};

export type CurriculumEntry = { day: number; phase: Phase; title: string };

const titles: [Phase, string][] = [
  [1, 'How a business makes money, and who finance serves'],
  [1, 'The income statement'],
  [1, 'The balance sheet'],
  [1, 'The cash flow statement'],
  [1, 'How the three statements connect'],
  [1, 'Filings, periods and units'],
  [2, 'Profitability and returns'],
  [2, 'Liquidity, leverage and efficiency'],
  [2, 'Growth and comparability'],
  [2, 'Quality of earnings and red flags'],
  [2, 'Business quality and sector language'],
  [3, 'Time value of money'],
  [3, 'Risk, return and cost of capital'],
  [3, 'Enterprise value and equity value'],
  [3, 'Multiples and comparable companies'],
  [3, 'Discounted cash flow'],
  [3, 'Anatomy of a financial model'],
  [4, 'Capital markets'],
  [4, 'How investment funds work'],
  [4, 'Public-markets investing and research'],
  [4, 'Private deals: private equity, venture and M&A'],
  [4, 'Credit and lending'],
  [4, 'Family offices and wealth managers'],
  [4, 'Fund operations and the finance back office'],
  [5, 'The use-case map'],
  [5, 'Finance data and its traps'],
  [5, 'Building for trust'],
  [5, 'Regulation, confidentiality and risk'],
  [5, 'Discovery, scoping and closing'],
  [5, 'Capstone'],
];

export const CURRICULUM: CurriculumEntry[] = titles.map(([phase, title], i) => ({
  day: i + 1,
  phase,
  title,
}));
