'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useAccessTokenGetter } from '@/hooks/use-access-token';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export interface UseSocketOptions {
  /** Set to false to postpone connecting (e.g. until the user is signed in). Default: true. */
  enabled?: boolean;
}

/**
 * One Socket.io connection for the calling component, closed on unmount.
 * Share a single connection across the app by calling this once in a
 * provider and passing `emit` / `on` down via context.
 *
 * @example
 * const { isConnected, emit, on } = useSocket();
 * useEffect(() => on<ChatMessage>('message:new', (m) => setMessages((all) => [...all, m])), [on]);
 * emit('message:send', { conversationId, text });
 */
export function useSocket({ enabled = true }: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getToken = useAccessTokenGetter();

  useEffect(() => {
    if (!enabled) return;
    if (!SOCKET_URL) {
      setError(new Error('NEXT_PUBLIC_SOCKET_URL is not set — add it to .env.local'));
      return;
    }

    let cancelled = false;
    let instance: Socket | null = null;

    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      instance = io(SOCKET_URL, {
        transports: ['websocket'],
        // Called on every (re)connect, so a refreshed token is always used.
        auth: (cb) => {
          getToken().then((token) => cb(token ? { token } : {}), () => cb({}));
        },
      });
      instance.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });
      instance.on('disconnect', () => setIsConnected(false));
      instance.on('connect_error', (err) => setError(err));
      setSocket(instance);
    });

    return () => {
      cancelled = true;
      instance?.removeAllListeners();
      instance?.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [enabled, getToken]);

  /** Emit an event; returns false when not connected. */
  const emit = useCallback(
    <TPayload,>(event: string, payload?: TPayload) => {
      if (!socket?.connected) return false;
      socket.emit(event, payload);
      return true;
    },
    [socket],
  );

  /** Subscribe to an event; returns the unsubscribe function (use it as an effect cleanup). */
  const on = useCallback(
    <TPayload,>(event: string, handler: (payload: TPayload) => void) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    },
    [socket],
  );

  return { socket, isConnected, error, emit, on };
}
