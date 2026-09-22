import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'unveiledlens-theme';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Synchronize across components and tabs
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        setThemeState(event.newValue);
        document.documentElement.dataset.theme = event.newValue;
      }
    };

    const handleCustomThemeChange = (event) => {
      if (event.detail?.theme) {
        setThemeState(event.detail.theme);
        document.documentElement.dataset.theme = event.detail.theme;
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('unveiledlens-theme-change', handleCustomThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('unveiledlens-theme-change', handleCustomThemeChange);
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    const nextTheme = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setThemeState(nextTheme);

    window.dispatchEvent(
      new CustomEvent('unveiledlens-theme-change', {
        detail: { theme: nextTheme }
      })
    );
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
