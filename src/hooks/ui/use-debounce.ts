'use client';

import { useEffect, useState } from 'react';

/** Returns `value`, but only after it stopped changing for `delay` ms (e.g. search input). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
