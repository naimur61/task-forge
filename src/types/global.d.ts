// Typed environment variables — add your own here so `process.env.X` autocompletes.
declare namespace NodeJS {
  interface ProcessEnv {
    /** Public base URL of your backend API (exposed to the browser). */
    NEXT_PUBLIC_API_URL?: string;
    /** Private base URL used by server-side requests (falls back to NEXT_PUBLIC_API_URL). */
    API_URL?: string;
    /** Socket.io server URL. */
    NEXT_PUBLIC_SOCKET_URL?: string;
  }
}
