'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { NAV_ITEMS, isActivePath } from '@/config/navigation';
import { useLayout } from '@/providers/layout-provider';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { BrandMark } from './brand-mark';

/** Slide-over navigation for small screens (below md). */
export function MobileNav() {
  const pathname = usePathname();
  const { state, setMobileNavOpen } = useLayout();
  const open = state.isMobileNavOpen;
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on navigation.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  // Esc to close, lock page scroll, move focus into the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileNavOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setMobileNavOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} aria-hidden />
      <nav className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
            <BrandMark />
            {siteConfig.name}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <ul className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
