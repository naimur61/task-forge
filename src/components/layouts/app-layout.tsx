'use client';

import type { ReactNode } from 'react';
import { useLayout } from '@/providers/layout-provider';
import { cn } from '@/lib/utils';
import { TopNavbar } from './top-navbar';
import { MobileNav } from './mobile-nav';
import { LeftSidebar } from './left-sidebar';

interface AppLayoutProps {
  children: ReactNode;
  /** Extra buttons in the top bar, e.g. the notification bell. */
  headerActions?: ReactNode;
}

/** Signed-in page frame: left sidebar, top bar, main content and the mobile menu. */
export function AppLayout({ children, headerActions }: AppLayoutProps) {
  const { state } = useLayout();

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:top-4 focus:left-4 focus:py-2 focus:px-4 focus:text-sm focus:rounded-md focus:shadow focus:not-sr-only focus:z-[60] focus:bg-background"
      >
        Skip to content
      </a>
      <LeftSidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[margin] duration-200',
          state.isLeftSidebarOpen ? 'md:ml-16 lg:ml-64' : 'md:ml-16',
        )}
      >
        <TopNavbar actions={headerActions} />
        <main id="main-content" className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
