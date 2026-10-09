'use client';

import { useEffect, useRef } from 'react';

/**
 * Key → handler map. Keys are lowercase, e.g. `c`, `/`, `?`, `mod+k` (Ctrl or Cmd + K),
 * or a two-key sequence like `g d` (press g, then d).
 */
export type HotkeyMap = Record<string, (event: KeyboardEvent) => void>;

/** True while the user is typing in a field, so plain-letter shortcuts stay quiet. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/** Listen for keyboard shortcuts on the whole page. */
export function useHotkeys(hotkeys: HotkeyMap) {
  // Always call the latest handlers without re-adding the listener.
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;
  const lastKey = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const map = hotkeysRef.current;
      const key = event.key.toLowerCase();

      // Ctrl/Cmd combos work everywhere, even inside inputs.
      if ((event.metaKey || event.ctrlKey) && map[`mod+${key}`]) {
        event.preventDefault();
        map[`mod+${key}`](event);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      // Plain keys are ignored while a dialog or sheet is open.
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      // Two-key sequences ("g d") must be pressed within one second.
      const previous = lastKey.current;
      const sequence = previous && Date.now() - previous.at < 1000 ? `${previous.key} ${key}` : null;
      lastKey.current = { key, at: Date.now() };

      const handler = (sequence && map[sequence]) || map[event.key === '?' ? '?' : key];
      if (handler) {
        event.preventDefault();
        handler(event);
        lastKey.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
