'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSocket } from '@/hooks/socket/use-socket';
import type { RealtimeEvent, RealtimePayload } from '@/types/realtime';

interface RealtimeContextValue {
  /** True while the live connection is up. */
  isConnected: boolean;
  /** Listen to one event. Returns the unsubscribe function (use it as an effect cleanup). */
  on: (event: RealtimeEvent, handler: (payload: RealtimePayload) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({ isConnected: false, on: () => () => {} });

/** One socket.io connection for the signed-in app. Turned off when NEXT_PUBLIC_SOCKET_URL is empty. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isConnected, on } = useSocket({ enabled: !!process.env.NEXT_PUBLIC_SOCKET_URL });
  return <RealtimeContext.Provider value={{ isConnected, on }}>{children}</RealtimeContext.Provider>;
}

/** Live connection status and event listener. */
export function useRealtime() {
  return useContext(RealtimeContext);
}
