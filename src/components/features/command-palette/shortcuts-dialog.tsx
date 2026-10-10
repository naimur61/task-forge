'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/custom/dialog';

/** Every keyboard shortcut, shown in the help dialog. */
export const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], label: 'Open the command palette' },
  { keys: ['C'], label: 'New task (in a project) or new project' },
  { keys: ['/'], label: 'Focus the search box' },
  { keys: ['G', 'D'], label: 'Go to dashboard' },
  { keys: ['G', 'P'], label: 'Go to projects' },
  { keys: ['G', 'N'], label: 'Go to notifications' },
  { keys: ['?'], label: 'Show this help' },
];

/** "Keyboard shortcuts" help, opened with `?`. */
export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Shortcuts work anywhere except while typing in a field.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span className="text-foreground">{shortcut.label}</span>
              <span className="flex shrink-0 gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="min-w-6 rounded border border-border bg-muted px-1.5 py-0.5 text-center text-xs font-medium text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
