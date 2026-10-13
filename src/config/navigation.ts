import type { LucideIcon } from 'lucide-react';
import { Bell, FolderKanban, LayoutDashboard, UserRound } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary navigation, used by the sidebar and the mobile menu. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Account', href: '/account', icon: UserRound },
];

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

/** Where signed-out users are sent, and where users land after signing in. */
export const LOGIN_PATH = '/login';
export const AFTER_LOGIN_PATH = '/dashboard';

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
export function safeRedirectPath(next: string | null | undefined, fallback: string = AFTER_LOGIN_PATH): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
