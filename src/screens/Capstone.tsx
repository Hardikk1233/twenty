// Day 30: pick a mock client, write a one-page solution brief (saved as you type), compare it
// with a model brief, then take the final test.

import { useEffect } from 'react';
import { ActionBar, FlowTop } from '../components/Bars';
import { buildDayItems } from '../content';
import { BRIEF_FIELDS, BRIEF_LABELS, type Day } from '../content/types';
import { localDate } from '../lib/dates';
import { goBack, navigate } from '../lib/router';
import {
  chooseClient,
  getState,
  revealModelBrief,
  startSession,
  useAppState,
  writeBrief,
} from '../state/store';

export function CapstoneScreen({ day }: { day: Day }) {
  const s = useAppState();
  const clients = day.capstone?.clients ?? [];
  const client = clients.find((c) => c.id === s.capstone.client) ?? null;
  const revealed = s.capstone.revealed && client !== null;
  const testStarted = s.session?.mode === 'day' && s.session.day === day.day;
  const step = !client ? 0 : revealed ? 2 : 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const startTest = () => {
    startSession('day', day.day, buildDayItems(day, getState()), localDate());
    navigate({ name: 'quiz', day: day.day }, { replace: true });
  };

  return (
    <div className="page page-flow">
      <FlowTop
        progress={(step + 1) / 3}
        label={`Day ${day.day} · Capstone`}
        closeLabel="Close capstone"
        onClose={goBack}
      />
      <main className="column flow-body capstone">
        {step === 0 && (
          <>
            <h1>Pick a client</h1>
            <p>
              Choose one client and write them a one-page solution brief. It saves as you type. Then compare it with a
              model brief and take the final test.
            </p>
            <div className="options" role="group" aria-label="Clients">
              {clients.map((c) => (
                <button key={c.id} type="button" className="option client-option" onClick={() => chooseClient(c.id)}>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && client && (
          <>
            <h1>Your brief</h1>
            <p className="client-name">{client.name}</p>
            <p>{client.situation}</p>
            <p className="muted">
              Not this one?{' '}
              <button type="button" className="inline-link" onClick={() => chooseClient(null)}>
                Choose a different client
              </button>
              .
            </p>
            {BRIEF_FIELDS.map((field) => (
              <label key={field} className="brief-field">
                <span className="brief-label">{BRIEF_LABELS[field].label}</span>
                <span className="brief-hint">{BRIEF_LABELS[field].hint}</span>
                <textarea
                  rows={3}
                  value={s.capstone.brief[field] ?? ''}
                  onChange={(e) => writeBrief(field, e.target.value)}
                />
              </label>
            ))}
          </>
        )}

        {step === 2 && client && (
          <>
            <h1>Compare your brief</h1>
            <p className="client-name">{client.name}</p>
            {BRIEF_FIELDS.map((field) => {
              const mine = (s.capstone.brief[field] ?? '').trim();
              return (
                <section key={field} className="compare">
                  <h2>{BRIEF_LABELS[field].label}</h2>
                  <p>
                    <strong>You: </strong>
                    {mine || <span className="muted">Left blank.</span>}
                  </p>
                  <p>
                    <strong>Model: </strong>
                    {client.model[field]}
                  </p>
                </section>
              );
            })}
          </>
        )}
      </main>
      {step === 1 && (
        <ActionBar>
          <button type="button" className="btn" onClick={revealModelBrief}>
            Reveal model brief
          </button>
        </ActionBar>
      )}
      {step === 2 && (
        <ActionBar>
          <button
            type="button"
            className="btn"
            onClick={testStarted ? () => navigate({ name: 'quiz', day: day.day }, { replace: true }) : startTest}
          >
            {testStarted ? 'Continue final test' : 'Start final test'}
          </button>
        </ActionBar>
      )}
    </div>
  );
}
