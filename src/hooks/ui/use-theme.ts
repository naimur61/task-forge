'use client';

import { useTheme } from 'next-themes';

/**
 * Light/dark mode helpers on top of next-themes.
 *
 * @example
 * const { isDark, toggleTheme } = useThemeMode();
 */
export function useThemeMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    /** The user's choice: 'light' | 'dark' | 'system' (undefined until mounted). */
    theme,
    /** What is actually shown: 'light' | 'dark' (undefined until mounted). */
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme(isDark ? 'light' : 'dark'),
    isDark,
  };
}
