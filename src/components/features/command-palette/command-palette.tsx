'use client';

import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';

/** One entry in the palette. */
export interface PaletteItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Extra words that should match the search (e.g. "home" for Dashboard). */
  keywords?: string[];
  /** Shown on the right, e.g. "G D". */
  shortcut?: string;
  onSelect: () => void;
}

export interface PaletteGroup {
  heading: string;
  items: PaletteItem[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: PaletteGroup[];
}

/** Cmd/Ctrl + K search box to jump anywhere or run an action. */
export function CommandPalette({ open, onOpenChange, groups }: CommandPaletteProps) {
  // Close first, then run, so the dialog doesn't stay on top of the next page.
  const run = (item: PaletteItem) => {
    onOpenChange(false);
    item.onSelect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search pages, projects and actions</DialogDescription>
        <Command>
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groups
              .filter((group) => group.items.length > 0)
              .map((group, index) => (
                <div key={group.heading}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.heading}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem key={item.id} value={`${item.label} ${item.keywords?.join(' ') ?? ''}`} onSelect={() => run(item)}>
                          <Icon className="text-muted-foreground" aria-hidden />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.shortcut && <kbd className="text-xs tracking-widest text-muted-foreground">{item.shortcut}</kbd>}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </div>
              ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
