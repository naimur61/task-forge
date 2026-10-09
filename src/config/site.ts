/** App-wide metadata. Used by the root layout and the app shell. */
export const siteConfig = {
  name: 'TaskForge',
  description: 'Plan projects, track tasks and ship together.',
} as const;

/** True when the app talks to the built-in demo API instead of a real backend. */
export const IS_DEMO_API = process.env.NEXT_PUBLIC_API_URL === '/api/mock';
