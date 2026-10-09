import type { ReactNode } from 'react';
import AppShellContainer from './app-shell-container';

/** Shell for every signed-in page: sidebar, top bar and the login guard. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShellContainer>{children}</AppShellContainer>;
}
