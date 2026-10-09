'use client';

import { Search } from 'lucide-react';

/** Top-bar button that opens the command palette. Wide with a hint on desktop, an icon on phones. */
export function PaletteTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open command palette"
      className="flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:mr-1 sm:w-56 sm:border sm:border-border sm:bg-muted/40 sm:px-3 sm:py-1.5"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden flex-1 text-left sm:inline">Search…</span>
      <kbd className="hidden rounded border border-border bg-background px-1.5 text-[10px] font-medium sm:inline">Ctrl K</kbd>
    </button>
  );
}
