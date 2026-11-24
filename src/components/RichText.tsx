// Renders lesson text: paragraphs, "- " lists, **bold**, and an optional {table} placeholder.
// Builds React elements directly; content is never injected as HTML.

import { Fragment, type ReactNode } from 'react';

type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] } | { kind: 'table' };

function blocksOf(text: string): Block[] {
  const out: Block[] = [];
  for (const chunk of text.split(/\n{2,}/)) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 1 && lines[0] === '{table}') {
      out.push({ kind: 'table' });
      continue;
    }
    let para: string[] = [];
    let items: string[] = [];
    for (const line of lines) {
      if (line.startsWith('- ')) {
        if (para.length) out.push({ kind: 'p', text: para.join(' ') });
        para = [];
        items.push(line.slice(2));
      } else {
        if (items.length) out.push({ kind: 'ul', items });
        items = [];
        para.push(line);
      }
    }
    if (para.length) out.push({ kind: 'p', text: para.join(' ') });
    if (items.length) out.push({ kind: 'ul', items });
  }
  return out;
}

export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function RichText({ text, table, className }: { text: string; table?: ReactNode; className?: string }) {
  const blocks = blocksOf(text);
  const hasMarker = blocks.some((b) => b.kind === 'table');
  return (
    <div className={['prose', className].filter(Boolean).join(' ')}>
      {blocks.map((b, i) => {
        if (b.kind === 'table') return <Fragment key={i}>{table}</Fragment>;
        if (b.kind === 'ul') {
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        );
      })}
      {!hasMarker && table}
    </div>
  );
}
