'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useLayout } from '@/providers/layout-provider';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { BrandMark } from './brand-mark';

interface TopNavbarProps {
  /** Extra buttons before the theme toggle, e.g. the notification bell. */
  actions?: ReactNode;
}

/** Sticky top bar: mobile menu button, brand (mobile only), actions and the user menu. */
export function TopNavbar({ actions }: TopNavbarProps) {
  const { setMobileNavOpen } = useLayout();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BrandMark />
            {siteConfig.name}
          </Link>
        </div>
        <div className="hidden md:block" />

        <div className="flex items-center gap-1">
          {actions}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
