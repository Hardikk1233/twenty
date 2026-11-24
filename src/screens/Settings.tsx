// Settings: theme, unlock all days, and moving progress between devices.

import { useRef, useState } from 'react';
import { FlowTop } from '../components/Bars';
import { CheckIcon } from '../components/Icons';
import { localDate } from '../lib/dates';
import { goBack } from '../lib/router';
import { getState, importState, resetProgress, setTheme, setUnlockAll, useAppState } from '../state/store';
import type { Theme } from '../state/types';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Match my phone' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** Saves progress as a JSON file. Uses the share sheet where files can be shared (iPhone). */
async function exportProgress(): Promise<string> {
  const name = `twenty-progress-${localDate()}.json`;
  const json = JSON.stringify(getState(), null, 2);
  const file = new File([json], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Twenty progress' });
      return 'Progress exported.';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return '';
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'Progress exported.';
}

export function SettingsScreen() {
  const s = useAppState();
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!window.confirm('Replace the progress on this device with the imported file?')) return;
      setMessage(importState(data) ? 'Progress imported.' : 'That file is not a Twenty progress file.');
    } catch {
      setMessage('That file could not be read.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const onReset = () => {
    if (window.confirm('Reset all progress on this device? This cannot be undone.')) {
      resetProgress();
      setMessage('Progress reset.');
    }
  };

  return (
    <div className="page page-flow">
      <FlowTop progress={0} label="" closeLabel="Close settings" onClose={goBack} />
      <main className="column flow-body settings">
        <h1>Settings</h1>

        <h2 id="theme-label">Theme</h2>
        <div className="setting-group" role="radiogroup" aria-labelledby="theme-label">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={s.settings.theme === t.value}
              className="setting-row"
              onClick={() => setTheme(t.value)}
            >
              <span>{t.label}</span>
              {s.settings.theme === t.value && (
                <span className="setting-check">
                  <CheckIcon />
                </span>
              )}
            </button>
          ))}
        </div>

        <h2>Lessons</h2>
        <div className="setting-group">
          <button
            type="button"
            role="switch"
            aria-checked={s.settings.unlockAll}
            className="setting-row"
            onClick={() => setUnlockAll(!s.settings.unlockAll)}
          >
            <span>
              Unlock all days
              <span className="setting-note">Open any day without finishing the one before.</span>
            </span>
            <span className={`switch${s.settings.unlockAll ? ' is-on' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <h2>Your progress</h2>
        <p className="muted">Progress is stored only on this device. Export it to move to another phone.</p>
        <div className="setting-group">
          <button type="button" className="setting-row setting-action" onClick={() => exportProgress().then(setMessage)}>
            Export progress
          </button>
          <button type="button" className="setting-row setting-action" onClick={() => fileInput.current?.click()}>
            Import progress
          </button>
          <button type="button" className="setting-row setting-action" onClick={onReset}>
            Reset progress
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => onImport(e.target.files?.[0])}
        />
        <p className="setting-message" role="status" aria-live="polite">
          {message}
        </p>

        <h2>About</h2>
        <p className="muted">
          Twenty teaches finance in 30 days. This is education, not investment, legal or tax advice. Brew Lane Cafés
          Ltd is fictional.
        </p>
      </main>
    </div>
  );
}
