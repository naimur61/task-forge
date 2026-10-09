'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SearchFieldProps } from '../interface/input-props';

export const SearchField = ({
  name,
  placeholder = 'Search...',
  onSearch,
  value: externalValue,
  setValue: setExternalValue,
}: SearchFieldProps) => {
  return (
    <div className="relative w-full" role="search">
      <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name={name}
        aria-label={placeholder}
        className="pl-10 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
        placeholder={placeholder}
        value={externalValue}
        onChange={(e) => {
          setExternalValue?.(e.target.value);
          onSearch?.(e.target.value);
        }}
      />
      {externalValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => { setExternalValue?.(''); onSearch?.(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
