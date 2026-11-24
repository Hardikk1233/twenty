// If a screen ever throws, show a plain way out instead of a blank page.
// Progress is in localStorage, so reloading loses nothing that was saved.

import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page page-flow">
        <main className="column flow-body" style={{ paddingTop: 48 }}>
          <h1>Something went wrong</h1>
          <p className="muted">Your progress is saved on this device. Going back to Today usually fixes it.</p>
        </main>
        <div className="actionbar">
          <div className="actionbar-row column">
            <button
              type="button"
              className="btn"
              onClick={() => {
                location.hash = '#/';
                location.reload();
              }}
            >
              Go to Today
            </button>
          </div>
        </div>
      </div>
    );
  }
}
