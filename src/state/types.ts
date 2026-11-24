export type Theme = 'system' | 'light' | 'dark';

/** Result of the last finished attempt at a day's quiz. */
export type DayRecord = {
  firstFinished: string; // local date, YYYY-MM-DD
  lastFinished: string;
  score: number;
  total: number;
  missed: string[]; // review keys missed in the last attempt
};

/** A question or speaking prompt in the review queue. Keys look like d02-calc1 or d02-speak. */
export type ReviewItem = {
  due: string; // local date
  step: number; // index into REVIEW_INTERVALS for the next gap
  streak: number; // correct answers in a row
};

export type SessionItem =
  | { kind: 'question'; key: string; review: boolean }
  | { kind: 'speak'; key: string; day: number; review: boolean };

export type Response = {
  correct: boolean;
  choice?: number; // multiple choice: the option tapped
  input?: string; // numeric: what the learner typed
  mark?: 'got' | 'shaky'; // say it out loud: self-mark
};

/**
 * A quiz in progress, saved so it survives the app closing.
 * 'day' is a day's quiz (on Day 30, the final test); 'review' is a set of review cards.
 */
export type Session = {
  mode: 'day' | 'review';
  day: number; // 0 for review
  items: SessionItem[];
  index: number; // items.length means the results screen
  responses: Record<string, Response>;
  revealed: string[]; // speaking prompts whose model answer is showing
};

/** The Day 30 solution brief, saved as the learner types. */
export type Capstone = {
  client: string | null;
  brief: Record<string, string>;
  revealed: boolean;
};

export type State = {
  version: 1;
  days: Record<number, DayRecord>;
  finished: string[]; // local dates on which a lesson was finished, ascending
  review: Record<string, ReviewItem>;
  pages: Record<number, number>; // lesson page to resume, by day
  session: Session | null;
  settings: { theme: Theme; unlockAll: boolean };
  capstone: Capstone;
};
