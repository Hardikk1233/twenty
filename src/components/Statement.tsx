// A financial statement drawn the way printed accounts are: labels left, tabular figures right,
// negatives in brackets, a single rule above subtotals, a double rule under totals, and a caption
// that states the unit and period.

import type { Statement as StatementData } from '../content/types';
import { formatFigure } from '../lib/format';

export function Statement({ table }: { table: StatementData }) {
  return (
    <figure className="statement">
      <table>
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            <td />
            {table.columns.map((c, i) => (
              <th key={i} scope="col">
                {c}
                <span className="paren" aria-hidden="true">
                  )
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className={[row.rule, row.highlight ? 'hl' : ''].filter(Boolean).join(' ') || undefined}>
              <th scope="row">{row.label}</th>
              {row.values.map((v, j) => (
                <td key={j}>{v === null ? null : <Figure value={v} decimals={row.decimals} />}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Figure({ value, decimals }: { value: number; decimals?: number }) {
  const digits = formatFigure(Math.abs(value), decimals).text;
  if (value < 0) {
    return (
      <span className="fig">
        <span className="sr-only">minus </span>
        <span aria-hidden="true">(</span>
        {digits}
        <span aria-hidden="true">)</span>
      </span>
    );
  }
  return (
    <span className="fig">
      {digits}
      {/* An invisible bracket keeps positive and negative digits aligned in the column. */}
      <span className="paren" aria-hidden="true">
        )
      </span>
    </span>
  );
}
