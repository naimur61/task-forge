'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  /** Current search (usually from the URL). */
  value: string;
  /** Called 300 ms after the user stops typing. */
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Search box with a debounce and a clear button. */
export function SearchInput({ value, onSearch, placeholder = 'Search…', className }: SearchInputProps) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, 300);

  // Keep the box in sync when the URL changes from outside (e.g. "Clear all").
  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
    // Only react to the debounced text, not to every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
