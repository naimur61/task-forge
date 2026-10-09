'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS, isActivePath } from '@/config/navigation';
import { useLayout } from '@/providers/layout-provider';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { BrandMark } from '../brand-mark';

/**
 * Sidebar for md and up. Tablets (md) always get the slim icon bar;
 * desktops (lg) show the full bar unless the user collapses it.
 * On phones the same links live in MobileNav.
 */
export function LeftSidebar() {
  const pathname = usePathname();
  const { state, toggleLeftSidebar } = useLayout();
  const collapsed = !state.isLeftSidebarOpen;

  // Label text: always hidden when collapsed, otherwise visible from lg only.
  const labelClass = collapsed ? 'sr-only' : 'sr-only lg:not-sr-only';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-border bg-background transition-[width] duration-200 md:flex',
        !collapsed && 'lg:w-64',
      )}
    >
      <div className={cn('flex h-14 items-center justify-center border-b border-border px-2', !collapsed && 'lg:justify-start lg:px-4')}>
        <Link href="/dashboard" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-foreground" title={siteConfig.name}>
          <BrandMark />
          <span className={labelClass}>{siteConfig.name}</span>
        </Link>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                  className={cn(
                    'flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
                    !collapsed && 'lg:justify-start lg:px-3',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className={labelClass}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle only matters on desktop; tablets are always slim. */}
      <div className="hidden border-t border-border p-2 lg:block">
        <button
          type="button"
          onClick={toggleLeftSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
