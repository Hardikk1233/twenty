// Quizzes: a day's quiz (on Day 30, the final test) and review cards. One question per screen,
// feedback on tap, then Say it out loud, then results. Progress is saved after every answer.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActionBar, FlowTop } from '../components/Bars';
import { CheckIcon, CrossIcon } from '../components/Icons';
import { buildDayItems, buildReviewItems, getDay, QUESTIONS } from '../content';
import { GLOSSARY } from '../content/glossary';
import { PHASE_NAMES } from '../content/curriculum';
import type { Day, Phase, Question } from '../content/types';
import { localDate } from '../lib/dates';
import { formatWithUnit, parseNumberInput, plural } from '../lib/format';
import { goBack, href, navigate } from '../lib/router';
import {
  advance,
  answer,
  finishDay,
  finishReview,
  getState,
  markSpeak,
  reveal,
  startSession,
  useAppState,
} from '../state/store';
import type { Session, SessionItem } from '../state/types';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bringIntoView = (el: HTMLElement | null) =>
  el?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

/** The day's quiz. Created on first visit, then resumed from storage. */
export function DayQuiz({ day }: { day: Day }) {
  const s = useAppState();
  const session = s.session?.mode === 'day' && s.session.day === day.day ? s.session : null;

  useEffect(() => {
    if (!session) startSession('day', day.day, buildDayItems(day, getState()), localDate());
  }, [session, day]);

  if (!session) return null;
  return <QuizFlow session={session} closeLabel="Close quiz" results={<DayResults session={session} day={day} />} />;
}

/** Review cards: every missed question and shaky spoken answer that is due. */
export function ReviewQuiz() {
  const s = useAppState();
  const session = s.session?.mode === 'review' ? s.session : null;
  const dayQuizOpen = s.session?.mode === 'day';
  const [nothingDue, setNothingDue] = useState(false);

  useEffect(() => {
    if (session || dayQuizOpen) return;
    const items = buildReviewItems(getState());
    if (items.length) startSession('review', 0, items, localDate());
    else setNothingDue(true);
  }, [session, dayQuizOpen]);

  if (dayQuizOpen || (nothingDue && !session)) {
    return (
      <div className="page page-flow">
        <FlowTop progress={0} label="Review" closeLabel="Close review" onClose={goBack} />
        <main className="column flow-body">
          <h1>{dayQuizOpen ? 'Finish your quiz first' : 'Nothing to review'}</h1>
          <p className="muted">
            {dayQuizOpen
              ? 'A quiz is in progress. Finish it, then come back for your review cards.'
              : 'Questions you miss come back here: the next day, then three days later, then a week later.'}
          </p>
        </main>
      </div>
    );
  }
  if (!session) return null;
  return <QuizFlow session={session} closeLabel="Close review" results={<ReviewResults session={session} />} />;
}

function itemDay(item: SessionItem): number | undefined {
  return item.kind === 'question' ? QUESTIONS.get(item.key)?.day : item.day;
}

function QuizFlow({ session, closeLabel, results }: { session: Session; closeLabel: string; results: ReactNode }) {
  const index = session.index;
  useEffect(() => {
    // Braces matter: newer browsers return a Promise from scrollTo, and an effect may only return a cleanup.
    window.scrollTo(0, 0);
  }, [index]);

  const total = session.items.length;
  const item = session.items[index];
  const answered = item ? session.responses[item.key] !== undefined : true;
  const progress = item ? (index + (answered ? 1 : 0)) / total : 1;
  const from = item ? itemDay(item) : undefined;
  const label = !item
    ? 'Results'
    : `${index + 1} of ${total}${from && from !== session.day ? ` · from Day ${from}` : ''}`;

  return (
    <div className="page page-flow">
      <FlowTop progress={progress} label={label} closeLabel={closeLabel} onClose={goBack} />
      {!item ? (
        results
      ) : item.kind === 'speak' ? (
        <SpeakStep key={item.key} item={item} session={session} />
      ) : (
        <QuestionStep key={item.key} itemKey={item.key} session={session} />
      )}
    </div>
  );
}

function QuestionStep({ itemKey, session }: { itemKey: string; session: Session }) {
  const entry = QUESTIONS.get(itemKey);
  const response = session.responses[itemKey];
  const feedback = useRef<HTMLDivElement>(null);
  const answeredOnMount = useRef(response !== undefined);

  useEffect(() => {
    if (response && !answeredOnMount.current) bringIntoView(feedback.current);
  }, [response]);

  // Content can change between builds; skip a question that no longer exists.
  if (!entry) {
    return (
      <>
        <main className="column flow-body">
          <p className="muted">This question is no longer in the course.</p>
        </main>
        <ActionBar>
          <button type="button" className="btn" onClick={advance}>
            Next
          </button>
        </ActionBar>
      </>
    );
  }
  const q = entry.question;

  return (
    <>
      <main className="column flow-body">
        <p className="prompt">{q.prompt}</p>
        {q.kind === 'choice' ? (
          <div className="options" role="group" aria-label="Answers">
            {q.options.map((option, i) => {
              const chosen = response?.choice === i;
              const right = i === q.answer;
              const state = !response ? '' : right ? 'is-right' : chosen ? 'is-wrong' : 'is-dim';
              return (
                <button
                  key={i}
                  type="button"
                  className={['option', chosen ? 'is-chosen' : '', state].filter(Boolean).join(' ')}
                  disabled={response !== undefined}
                  aria-pressed={chosen}
                  onClick={() => answer(itemKey, { choice: i, correct: right })}
                >
                  <span>{option}</span>
                  {response && right && (
                    <span className="mark right">
                      <CheckIcon />
                      <span className="sr-only">Correct answer</span>
                    </span>
                  )}
                  {response && chosen && !right && (
                    <span className="mark wrong">
                      <CrossIcon />
                      <span className="sr-only">Your answer</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <NumberInput itemKey={itemKey} question={q} input={response?.input} correct={response?.correct} />
        )}
        <div className="feedback" ref={feedback} aria-live="polite">
          {response && <Feedback question={q} correct={response.correct} />}
        </div>
      </main>
      {response ? (
        <ActionBar>
          <button type="button" className="btn" onClick={advance}>
            Next
          </button>
        </ActionBar>
      ) : (
        q.kind === 'number' && (
          <ActionBar>
            <button type="submit" form="numeric-answer" className="btn">
              Check answer
            </button>
          </ActionBar>
        )
      )}
    </>
  );
}

function NumberInput({
  itemKey,
  question,
  input,
  correct,
}: {
  itemKey: string;
  question: Question & { kind: 'number' };
  input?: string;
  correct?: boolean;
}) {
  const [draft, setDraft] = useState(input ?? '');
  const [hint, setHint] = useState('');
  const answered = correct !== undefined;

  const check = () => {
    const value = parseNumberInput(draft);
    if (value === null) {
      setHint(draft.trim() ? 'Enter a number, such as 12.5' : 'Type your answer first');
      return;
    }
    answer(itemKey, { input: draft, correct: Math.abs(value - question.answer) <= question.tolerance + 1e-9 });
  };

  return (
    <form
      id="numeric-answer"
      onSubmit={(e) => {
        e.preventDefault();
        if (!answered) check();
      }}
    >
      <label className={['numeric', answered ? (correct ? 'is-right' : 'is-wrong') : ''].filter(Boolean).join(' ')}>
        <span className="sr-only">Your answer, in {question.unit}</span>
        <input
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={draft}
          readOnly={answered}
          aria-describedby={hint ? 'numeric-hint' : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            setHint('');
          }}
        />
        <span className="unit" aria-hidden="true">
          {question.unit}
        </span>
      </label>
      {hint && (
        <p id="numeric-hint" className="hint">
          {hint}
        </p>
      )}
    </form>
  );
}

function Feedback({ question, correct }: { question: Question; correct: boolean }) {
  return (
    <>
      <p className={`feedback-title ${correct ? 'right' : 'wrong'}`}>{correct ? 'Right' : 'Not quite'}</p>
      {!correct && question.kind === 'number' && (
        <p>The answer is {formatWithUnit(question.answer, question.unit)}.</p>
      )}
      <p>{question.explain}</p>
    </>
  );
}

function SpeakStep({ item, session }: { item: SessionItem & { kind: 'speak' }; session: Session }) {
  const day = getDay(item.day);
  const revealed = session.revealed.includes(item.key);
  const mark = session.responses[item.key]?.mark;
  const model = useRef<HTMLHeadingElement>(null);
  const revealedOnMount = useRef(revealed);
  const isLast = session.index === session.items.length - 1;

  useEffect(() => {
    if (revealed && !revealedOnMount.current) bringIntoView(model.current);
  }, [revealed]);

  if (!day) return null;
  return (
    <>
      <main className="column flow-body">
        <h1>Say it out loud</h1>
        <p className="prompt">{day.speak.prompt}</p>
        {!revealed ? (
          <p className="muted">Say your answer aloud, then compare it with a model answer.</p>
        ) : (
          <>
            <h2 ref={model}>Model answer</h2>
            <p>{day.speak.modelAnswer}</p>
            <h2>How did it go?</h2>
            <div className="options" role="group" aria-label="How did it go?">
              {(['got', 'shaky'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={['option', mark === m ? 'is-chosen' : ''].filter(Boolean).join(' ')}
                  aria-pressed={mark === m}
                  onClick={() => markSpeak(item.key, m)}
                >
                  <span>{m === 'got' ? 'Got it' : 'Shaky'}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
      {!revealed ? (
        <ActionBar>
          <button type="button" className="btn" onClick={() => reveal(item.key)}>
            Reveal model answer
          </button>
        </ActionBar>
      ) : (
        mark && (
          <ActionBar>
            <button type="button" className="btn" onClick={advance}>
              {isLast ? 'See results' : 'Next'}
            </button>
          </ActionBar>
        )
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// Results

function summarise(session: Session) {
  const questions = session.items.filter((i) => i.kind === 'question');
  const score = questions.filter((i) => session.responses[i.key]?.correct).length;
  const missed = questions
    .filter((i) => !session.responses[i.key]?.correct)
    .map((i) => QUESTIONS.get(i.key))
    .filter((e) => e !== undefined);
  const shaky = session.items.filter(
    (i): i is SessionItem & { kind: 'speak' } => i.kind === 'speak' && session.responses[i.key]?.mark === 'shaky',
  );
  return { questions, score, missed, shaky };
}

function Missed({ session }: { session: Session }) {
  const { missed, shaky } = summarise(session);
  const reviewOnly = session.mode === 'review';
  const lines = [
    ...missed.map(({ question, day }) => ({
      key: question.id,
      text: question.concept,
      day: day !== session.day ? day : undefined,
    })),
    ...(reviewOnly ? shaky : []).map((s) => ({ key: s.key, text: 'Say it out loud', day: s.day as number | undefined })),
  ];
  if (!lines.length) return <p>Nothing missed.</p>;
  return (
    <>
      <h2>Concepts to revisit</h2>
      <ul className="list">
        {lines.map((l) => (
          <li key={l.key}>
            {l.text}
            {l.day !== undefined && <span className="muted">, Day {l.day}</span>}
          </li>
        ))}
      </ul>
      <p className="muted">They will come back in review.</p>
    </>
  );
}

function DayResults({ session, day }: { session: Session; day: Day }) {
  const { questions, score } = summarise(session);
  const speak = session.items.find((i) => i.kind === 'speak' && !i.review);
  const mark = speak && session.responses[speak.key]?.mark;
  const finalTest = day.capstone !== undefined;

  const finish = () => {
    finishDay(localDate());
    navigate({ name: 'today' }, { replace: true });
  };

  return (
    <>
      <main className="column flow-body">
        <h1>
          {score} of {questions.length} right
        </h1>
        {finalTest && <p className="muted">Final test: twenty questions from across the course.</p>}
        <Missed session={session} />
        <h2>Say it out loud</h2>
        <p>{mark === 'shaky' ? 'Shaky. It will come back in review.' : 'Got it.'}</p>
        {finalTest && <AllTerms />}
      </main>
      <ActionBar>
        <button type="button" className="btn" onClick={finish}>
          {finalTest ? 'Finish course' : 'Finish day'}
        </button>
      </ActionBar>
    </>
  );
}

function ReviewResults({ session }: { session: Session }) {
  const { questions, score } = summarise(session);
  const cards = session.items.length;
  const finish = () => {
    finishReview(localDate());
    navigate({ name: 'today' }, { replace: true });
  };
  return (
    <>
      <main className="column flow-body">
        <h1>{questions.length ? `${score} of ${questions.length} right` : 'Review done'}</h1>
        <p className="muted">{plural(cards, 'card')} reviewed.</p>
        <Missed session={session} />
      </main>
      <ActionBar>
        <button type="button" className="btn" onClick={finish}>
          Done
        </button>
      </ActionBar>
    </>
  );
}

/** Day 30: every term from the course, by phase, each linking to its glossary entry. */
function AllTerms() {
  const phases = ([1, 2, 3, 4, 5] as Phase[]).map((p) => ({
    phase: p,
    terms: GLOSSARY.filter((g) => g.phase === p).sort((a, b) => a.day - b.day),
  }));
  return (
    <>
      <h2>Every term you learned</h2>
      <p className="muted">{GLOSSARY.length} terms across 30 days.</p>
      {phases.map(({ phase, terms }) => (
        <div className="term-group" key={phase}>
          <h3>{PHASE_NAMES[phase]}</h3>
          <p className="term-cloud">
            {terms.map((t, i) => (
              <span key={t.slug}>
                <a href={href({ name: 'glossary', slug: t.slug })}>{t.term}</a>
                {i < terms.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      ))}
    </>
  );
}
