// Today has one job: start today's lesson. When today's lesson is done, it says so and offers
// the review cards.

import type { ReactNode } from 'react';
import { TabBar } from '../components/Bars';
import { ChevronIcon, GearIcon } from '../components/Icons';
import { buildReviewItems, getDay, titleOf } from '../content';
import { TOTAL_DAYS } from '../content/curriculum';
import { localDate } from '../lib/dates';
import { plural } from '../lib/format';
import { currentDay, finishedToday, streak } from '../lib/progress';
import { navigate, type Route } from '../lib/router';
import { useAppState } from '../state/store';

export function Today() {
  const s = useAppState();
  const today = localDate();
  const current = currentDay(s);
  const lesson = current === null ? undefined : getDay(current);
  const due = buildReviewItems(s, today).length;
  const reviewOpen = s.session?.mode === 'review';
  const dayQuizOpen = s.session?.mode === 'day';
  const streakDays = streak(s.finished, today);
  const doneDay = finishedToday(s, today);

  const quizInProgress = current !== null && dayQuizOpen && s.session?.day === current;
  const capstoneInProgress = !quizInProgress && lesson?.capstone !== undefined && s.capstone.client !== null;
  const lessonInProgress = current !== null && (s.pages[current] ?? 0) > 0;
  const showDone = doneDay !== null && !quizInProgress && !lessonInProgress && !capstoneInProgress;
  // Review cards wait while a day's quiz is open, so the two never overwrite each other.
  const canReview = (due > 0 || reviewOpen) && !dayQuizOpen;
  const reviewText = reviewOpen ? 'Continue review' : `Review ${plural(due, 'card')}`;

  const go = (route: Route) => () => navigate(route);
  let dayShown = current ?? TOTAL_DAYS;
  let line: string;
  let action: ReactNode = null;
  let reviewIsAction = false;

  if (current === null) {
    line = 'You have finished all 30 days.';
  } else if (showDone) {
    dayShown = doneDay;
    const rec = s.days[doneDay]!;
    line = `Done today, ${rec.score} of ${rec.total} right.`;
  } else if (!lesson) {
    line = 'This lesson is not written yet.';
  } else {
    line = 'About 20 minutes';
    const [label, route]: [string, Route] = quizInProgress
      ? [lesson.capstone ? 'Continue final test' : 'Continue quiz', { name: 'quiz', day: current }]
      : capstoneInProgress
        ? ['Continue capstone', { name: 'capstone', day: current }]
        : lessonInProgress
          ? ['Continue lesson', { name: 'lesson', day: current }]
          : ['Start lesson', { name: 'lesson', day: current }];
    action = (
      <button type="button" className="btn" onClick={go(route)}>
        {label}
      </button>
    );
  }

  // Once today's lesson is done (or the course is), review becomes the main action.
  if (!action && canReview) {
    reviewIsAction = true;
    action = (
      <button type="button" className="btn" onClick={go({ name: 'review' })}>
        {reviewText}
      </button>
    );
  }

  const next =
    showDone && current !== null ? (
      getDay(current) ? (
        <button type="button" className="fact fact-link" onClick={go({ name: 'lesson', day: current })}>
          <span>Next lesson</span>
          <span className="fact-value">
            Day {current}
            <ChevronIcon />
          </span>
        </button>
      ) : (
        <div className="fact">
          <span>Next lesson</span>
          <span className="fact-value muted">Day {current} is not written yet</span>
        </div>
      )
    ) : null;

  const review =
    canReview && !reviewIsAction ? (
      <button type="button" className="fact fact-link" onClick={go({ name: 'review' })}>
        <span>Review</span>
        <span className="fact-value">
          {reviewOpen ? 'Continue' : plural(due, 'card')}
          <ChevronIcon />
        </span>
      </button>
    ) : (
      <div className="fact">
        <span>Review</span>
        <span className="fact-value">{due ? plural(due, 'card') : 'None due'}</span>
      </div>
    );

  return (
    <div className="page page-tabs">
      <main className="today column">
        <div>
          <div className="today-top">
            <p className="muted">
              Day {dayShown} of {TOTAL_DAYS}
            </p>
            <button type="button" className="icon-btn" aria-label="Settings" onClick={go({ name: 'settings' })}>
              <GearIcon />
            </button>
          </div>
          <h1>{titleOf(dayShown)}</h1>
          <p className="muted">{line}</p>
        </div>
        <div className="today-foot">
          {action}
          <div className="facts">
            <div className="fact">
              <span>Streak</span>
              <span className="fact-value">{plural(streakDays, 'day')}</span>
            </div>
            {review}
            {next}
          </div>
        </div>
      </main>
      <TabBar active="today" />
    </div>
  );
}
