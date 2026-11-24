import type { ReactNode } from 'react';
import { href, navigate } from '../lib/router';
import { CloseIcon } from './Icons';

type Tab = 'today' | 'path' | 'glossary';
const TABS: { name: Tab; label: string }[] = [
  { name: 'today', label: 'Today' },
  { name: 'path', label: 'Path' },
  { name: 'glossary', label: 'Glossary' },
];

/** The bottom bar: three tabs, nothing more. */
export function TabBar({ active }: { active: Tab }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-row">
        {TABS.map((t) => (
          <a
            key={t.name}
            href={href({ name: t.name })}
            className="tab"
            aria-current={active === t.name ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (active !== t.name) navigate({ name: t.name }, { replace: true });
            }}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** Top of a lesson or quiz: a hairline progress bar, a position label and a close button. */
export function FlowTop({
  progress,
  label,
  closeLabel,
  onClose,
}: {
  progress: number;
  label: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <header className="flow-top">
      <div className="progress" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="flow-row column">
        <span className="flow-label">{label}</span>
        <button type="button" className="icon-btn" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}

/** The pinned bottom bar that holds a screen's action, within thumb reach. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="actionbar">
      <div className="actionbar-row column">{children}</div>
    </div>
  );
}
