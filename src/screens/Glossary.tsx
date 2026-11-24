// The glossary: every term from every lesson's Terms page, searchable, A to Z.

import { useEffect, useMemo, useRef, useState } from 'react';
import { TabBar } from '../components/Bars';
import { ChevronIcon } from '../components/Icons';
import { titleOf } from '../content';
import { GLOSSARY, letterOf, searchGlossary, type GlossaryEntry } from '../content/glossary';
import { PAGE_KEYS } from '../content/types';
import { isOpen } from '../lib/progress';
import { navigate } from '../lib/router';
import { setPage, useAppState } from '../state/store';

const TERMS_PAGE = PAGE_KEYS.indexOf('terms');

export function GlossaryScreen({ slug }: { slug?: string }) {
  const s = useAppState();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(slug ?? null);
  const target = useRef<HTMLLIElement>(null);

  // A link such as #/glossary/ebitda opens that term and brings it into view.
  useEffect(() => {
    if (!slug) return;
    setQuery('');
    setOpen(slug);
  }, [slug]);
  useEffect(() => {
    if (slug) target.current?.scrollIntoView({ block: 'center' });
  }, [slug]);

  const results = useMemo(() => searchGlossary(query), [query]);
  const groups = useMemo(() => {
    if (query.trim()) return [{ letter: '', entries: results }];
    const out: { letter: string; entries: GlossaryEntry[] }[] = [];
    for (const e of results) {
      const letter = letterOf(e.term);
      if (out[out.length - 1]?.letter !== letter) out.push({ letter, entries: [] });
      out[out.length - 1]!.entries.push(e);
    }
    return out;
  }, [query, results]);

  const openLesson = (day: number) => {
    setPage(day, TERMS_PAGE);
    navigate({ name: 'lesson', day });
  };

  return (
    <div className="page page-tabs">
      <main className="column flow-body glossary">
        <h1>Glossary</h1>
        <div className="search">
          <label className="sr-only" htmlFor="glossary-search">
            Search the glossary
          </label>
          <input
            id="glossary-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={`Search ${GLOSSARY.length} terms`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {results.length === 0 && <p className="muted empty">No terms match ‘{query.trim()}’.</p>}

        {groups.map(({ letter, entries }) => (
          <section key={letter || 'results'} aria-label={letter || 'Search results'}>
            {letter && <h2 className="gloss-letter">{letter}</h2>}
            <ul className="gloss-list">
              {entries.map((e) => {
                const expanded = open === e.slug;
                return (
                  <li key={e.slug} ref={e.slug === slug ? target : undefined} className="gloss-item">
                    <button
                      type="button"
                      className="gloss-row"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? null : e.slug)}
                    >
                      <span className="gloss-term">{e.term}</span>
                      <span className="gloss-day">Day {e.day}</span>
                    </button>
                    {expanded && (
                      <div className="gloss-detail">
                        {e.aka.length > 0 && <p className="aka">Also called {e.aka.join(', ')}</p>}
                        <p>{e.definition}</p>
                        {e.formula && <p className="formula">Formula: {e.formula}</p>}
                        {isOpen(s, e.day) ? (
                          <button type="button" className="gloss-link" onClick={() => openLesson(e.day)}>
                            <span>
                              Day {e.day}: {titleOf(e.day)}
                            </span>
                            <ChevronIcon />
                          </button>
                        ) : (
                          <p className="muted">
                            Taught on Day {e.day}: {titleOf(e.day)}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
      <TabBar active="glossary" />
    </div>
  );
}
