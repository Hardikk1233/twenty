import { useEffect } from 'react';
import type { Theme } from '../state/types';

const PAPER = { light: '#FBFBFA', dark: '#101214' };

/** Applies the theme setting. "system" follows the phone; light and dark override it. */
export function useTheme(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    // Keep the browser and status bar colour in step with the page.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      const isDarkTag = m.media.includes('dark');
      m.content = theme === 'system' ? PAPER[isDarkTag ? 'dark' : 'light'] : PAPER[theme];
    });
  }, [theme]);
}

/**
 * iOS keeps fixed bars behind the on-screen keyboard. While a text field has focus, this sets
 * --kb to the keyboard's height so the action bar (with Check answer) sits just above it.
 * Android resizes the page itself (interactive-widget=resizes-content), so --kb stays 0 there.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
      const typing = document.activeElement instanceof HTMLInputElement;
      const inset = typing ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      root.style.setProperty('--kb', `${Math.round(inset)}px`);
      root.classList.toggle('kb-open', inset > 0);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      root.style.removeProperty('--kb');
      root.classList.remove('kb-open');
    };
  }, []);
}
