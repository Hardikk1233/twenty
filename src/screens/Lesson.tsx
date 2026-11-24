// One lesson: six short pages, one on screen at a time, always in the same order.

import { useEffect, useRef } from 'react';
import { ActionBar, FlowTop } from '../components/Bars';
import { RichText } from '../components/RichText';
import { Statement } from '../components/Statement';
import { PAGE_KEYS, PAGE_TITLES, type Day, type PageKey, type Term } from '../content/types';
import { buildDayItems } from '../content';
import { localDate } from '../lib/dates';
import { goBack, navigate } from '../lib/router';
import { getState, setPage, startSession, useAppState } from '../state/store';

export function Lesson({ day }: { day: Day }) {
  const s = useAppState();
  const last = PAGE_KEYS.length - 1;
  const page = Math.min(Math.max(s.pages[day.day] ?? 0, 0), last);
  const key = PAGE_KEYS[page]!;
  const heading = useRef<HTMLHeadingElement>(null);
  const shown = useRef(page);

  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [page]);

  // Day 30 goes to the capstone brief first; every other day goes straight to its quiz.
  const startQuiz = () => {
    if (day.capstone) {
      navigate({ name: 'capstone', day: day.day }, { replace: true });
      return;
    }
    startSession('day', day.day, buildDayItems(day, getState()), localDate());
    navigate({ name: 'quiz', day: day.day }, { replace: true });
  };

  return (
    <div className="page page-flow">
      <FlowTop
        progress={(page + 1) / PAGE_KEYS.length}
        label={`Day ${day.day} · ${page + 1} of ${PAGE_KEYS.length}`}
        closeLabel="Close lesson"
        onClose={goBack}
      />
      <main className="column flow-body">
        <h1 ref={heading} tabIndex={-1}>
          {PAGE_TITLES[key]}
        </h1>
        <PageBody day={day} page={key} />
      </main>
      <ActionBar>
        {page > 0 ? (
          <button type="button" className="btn-text" onClick={() => setPage(day.day, page - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {page < last ? (
          <button type="button" className="btn-text" onClick={() => setPage(day.day, page + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="btn-text" onClick={startQuiz}>
            {day.capstone ? 'Start capstone' : 'Start quiz'}
          </button>
        )}
      </ActionBar>
    </div>
  );
}

function PageBody({ day, page }: { day: Day; page: PageKey }) {
  const p = day.pages;
  switch (page) {
    case 'why':
      return <RichText text={p.why} className="lead" />;
    case 'idea':
      return <RichText text={p.idea} />;
    case 'example':
      return <RichText text={p.example.text} table={p.example.table && <Statement table={p.example.table} />} />;
    case 'terms':
      return <Terms terms={p.terms} />;
    case 'builder':
      return <RichText text={p.builder} />;
    case 'client':
      return (
        <div className="client">
          <h2>Say</h2>
          <p className="quote">‘{p.client.say}’</p>
          <h2>Ask</h2>
          <p className="quote">‘{p.client.ask}’</p>
        </div>
      );
  }
}

function Terms({ terms }: { terms: Term[] }) {
  return (
    <dl className="terms">
      {terms.map((t) => (
        <div className="term" key={t.term}>
          <dt>{t.term}</dt>
          {t.aka && <dd className="aka">Also called {t.aka.join(', ')}</dd>}
          <dd>{t.definition}</dd>
          {t.formula && <dd className="formula">Formula: {t.formula}</dd>}
        </div>
      ))}
    </dl>
  );
}
