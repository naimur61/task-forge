'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/hooks/ui/use-theme';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

/** Light / dark / system theme choice. */
export function ThemePicker() {
  const { theme, setTheme } = useThemeMode();
  // The saved theme is only known in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border border-border px-3 py-4 text-sm font-medium transition-colors',
              selected ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
