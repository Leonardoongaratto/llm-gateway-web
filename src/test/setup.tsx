import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

export interface SystemPreferences {
  dark?: boolean;
  reducedTransparency?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

export function stubSystemPreferences(prefs: SystemPreferences = {}) {
  const mediaQueries: Record<string, boolean> = {
    '(prefers-color-scheme: dark)': Boolean(prefs.dark),
    '(prefers-reduced-transparency: reduce)': Boolean(prefs.reducedTransparency),
    '(prefers-contrast: more)': Boolean(prefs.highContrast),
    '(prefers-reduced-motion: reduce)': Boolean(prefs.reducedMotion),
  };

  const listeners = new Map<string, Set<(e: { matches: boolean }) => void>>();

  vi.stubGlobal('matchMedia', (query: string) => {
    if (!listeners.has(query)) {
      listeners.set(query, new Set());
    }
    const queryListeners = listeners.get(query)!;
    const matches = Boolean(mediaQueries[query]);

    return {
      matches,
      media: query,
      onchange: null,
      addListener: (fn: (e: { matches: boolean }) => void) => queryListeners.add(fn),
      removeListener: (fn: (e: { matches: boolean }) => void) => queryListeners.delete(fn),
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => queryListeners.add(fn),
      removeEventListener: (_: string, fn: (e: { matches: boolean }) => void) => queryListeners.delete(fn),
      dispatchEvent: () => true,
    };
  });

  return {
    setQuery(query: string, matches: boolean) {
      mediaQueries[query] = matches;
      const queryListeners = listeners.get(query);
      if (queryListeners) {
        queryListeners.forEach((listener) => listener({ matches }));
      }
    },
  };
}

beforeEach(() => {
  stubSystemPreferences({ dark: false, reducedTransparency: false, highContrast: false });
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
