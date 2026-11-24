// Content schema. One JSON file per day in content/days/dayNN.json.
// The shape follows the build brief, with two additions the brief's features need:
//   - Question.concept: a short label listed under "concepts missed" on the results screen.
//   - Question.check: an expression over Brew Lane figures that the validator evaluates to
//     prove a calculation answer. The app never reads it.
// Text fields support three tiny conventions: blank lines separate paragraphs, lines starting
// with "- " form a list, and **double asterisks** mark a term in bold. In the worked example,
// a paragraph containing only {table} places the statement table there.

export type Phase = 1 | 2 | 3 | 4 | 5;

export type StatementRow = {
  label: string;
  values: (number | null)[];
  rule?: 'subtotal' | 'total';
  highlight?: boolean;
  /** Fixed decimal places for this row, e.g. 1 so a ratio of 5 shows as 5.0. */
  decimals?: number;
};

export type Statement = {
  caption: string;
  columns: string[];
  rows: StatementRow[];
};

export type Term = {
  term: string;
  aka?: string[];
  definition: string;
  formula?: string;
};

export type QuestionType = 'concept' | 'calc' | 'client' | 'builder';

type QuestionBase = {
  id: string;
  type: QuestionType;
  concept: string;
  prompt: string;
  explain: string;
  check?: string;
};

export type ChoiceQuestion = QuestionBase & {
  kind: 'choice';
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
};

export type NumberQuestion = QuestionBase & {
  kind: 'number';
  answer: number;
  tolerance: number;
  unit: string;
};

export type Question = ChoiceQuestion | NumberQuestion;

export type Pages = {
  why: string;
  idea: string;
  example: { text: string; table?: Statement };
  terms: Term[];
  builder: string;
  client: { say: string; ask: string };
};

/** The eight sections of the Day 30 one-page solution brief. */
export const BRIEF_FIELDS = ['workflow', 'pain', 'data', 'design', 'checks', 'metric', 'pilot', 'risks'] as const;
export type BriefField = (typeof BRIEF_FIELDS)[number];

export const BRIEF_LABELS: Record<BriefField, { label: string; hint: string }> = {
  workflow: { label: 'Workflow', hint: 'Which task, done by whom, how often?' },
  pain: { label: 'Pain in numbers', hint: 'Hours, turnaround and errors today.' },
  data: { label: 'Data sources', hint: 'Where the inputs live, and in what form.' },
  design: { label: 'Design', hint: 'Extract, calculate, check, review, output.' },
  checks: { label: 'Three automated checks', hint: 'Rules a machine can run on every output.' },
  metric: { label: 'Success metric', hint: 'One number, agreed before the pilot starts.' },
  pilot: { label: 'Pilot plan', hint: 'One workflow, one team, four to six weeks.' },
  risks: { label: 'Two risks', hint: 'What could go wrong, and how you would contain it.' },
};

/** A mock client for the Day 30 capstone, with the model brief the learner compares against. */
export type CapstoneClient = {
  id: string;
  name: string;
  situation: string;
  model: Record<BriefField, string>;
};

export type Day = {
  day: number;
  phase: Phase;
  title: string;
  pages: Pages;
  quiz: Question[];
  speak: { prompt: string; modelAnswer: string };
  /** Day 30 only: three mock clients for the capstone brief. */
  capstone?: { clients: CapstoneClient[] };
};

export const PAGE_KEYS = ['why', 'idea', 'example', 'terms', 'builder', 'client'] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_TITLES: Record<PageKey, string> = {
  why: 'Why it matters',
  idea: 'The idea',
  example: 'Worked example',
  terms: 'Terms',
  builder: "Builder's lens",
  client: 'With a client',
};
