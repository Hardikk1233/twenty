// The Path: the 30 days drawn as a route map. One line runs through the five phases; each day
// is a stop. The line is solid up to the learner's position and pale beyond it.

import { useEffect, useRef } from 'react';
import { TabBar } from '../components/Bars';
import { getDay } from '../content';
import { CURRICULUM, PHASE_NAMES, TOTAL_DAYS } from '../content/curriculum';
import type { Phase } from '../content/types';
import { currentDay, isDone, isOpen } from '../lib/progress';
import { navigate } from '../lib/router';
import { useAppState } from '../state/store';
import type { State } from '../state/types';

type StopState = 'done' | 'next' | 'open' | 'locked' | 'unwritten';

const STATE_LABEL: Record<StopState, string> = {
  done: 'Done',
  next: 'Up next',
  open: 'Open',
  locked: 'Locked',
  unwritten: 'Not written yet',
};

function stopState(s: State, day: number, next: number | null): StopState {
  if (isDone(s, day)) return 'done';
  if (!getDay(day)) return 'unwritten';
  if (day === next) return 'next';
  return isOpen(s, day) ? 'open' : 'locked';
}

const PHASES: Phase[] = [1, 2, 3, 4, 5];

export function PathScreen() {
  const s = useAppState();
  const next = currentDay(s);
  // Stops before this day are behind the learner; the line is drawn solid up to it.
  const position = next ?? TOTAL_DAYS + 1;
  const doneCount = CURRICULUM.filter((c) => isDone(s, c.day)).length;
  const here = useRef<HTMLLIElement>(null);

  useEffect(() => {
    here.current?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <div className="page page-tabs">
      <main className="column flow-body path">
        <h1>Path</h1>
        <p className="muted">
          {doneCount === TOTAL_DAYS ? 'All 30 days done.' : `${doneCount} of ${TOTAL_DAYS} days done.`}
        </p>
        <ol className="route" aria-label="The 30-day route">
          {PHASES.map((phase) => {
            const days = CURRICULUM.filter((c) => c.phase === phase);
            const first = days[0]!.day;
            const last = days[days.length - 1]!.day;
            const phaseDone = days.filter((d) => isDone(s, d.day)).length;
            const travelled = first <= position;
            return [
              <li
                key={`phase-${phase}`}
                className={[
                  'route-row',
                  'route-phase',
                  phase === 1 ? 'is-first' : '',
                  travelled ? 'line-in line-out' : '',
                ].join(' ')}
              >
                <span className="phase-mark" aria-hidden="true" />
                <h2>{PHASE_NAMES[phase]}</h2>
                <p className="muted">
                  Days {first} to {last} · {phaseDone} of {days.length} done
                </p>
              </li>,
              ...days.map(({ day, title }) => {
                const state = stopState(s, day, next);
                const interactive = state === 'done' || state === 'next' || state === 'open';
                const body = (
                  <>
                    <span className="stop-head">
                      <span className="stop-day">Day {day}</span>
                      <span className="stop-state">{STATE_LABEL[state]}</span>
                    </span>
                    <span className="stop-title">{title}</span>
                  </>
                );
                return (
                  <li
                    key={day}
                    ref={day === next ? here : undefined}
                    className={[
                      'route-row',
                      'route-stop',
                      `is-${state}`,
                      day === TOTAL_DAYS ? 'is-last' : '',
                      day <= position ? 'line-in' : '',
                      day < position ? 'line-out' : '',
                    ].join(' ')}
                  >
                    <span className="stop-dot" aria-hidden="true" />
                    {interactive ? (
                      <button
                        type="button"
                        className="stop"
                        aria-current={state === 'next' ? 'step' : undefined}
                        onClick={() => navigate({ name: 'lesson', day })}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className="stop" aria-disabled="true">
                        {body}
                      </div>
                    )}
                  </li>
                );
              }),
            ];
          })}
        </ol>
      </main>
      <TabBar active="path" />
    </div>
  );
}
