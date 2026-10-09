# taskforge

Next.js app generated with [Nexstruct](https://www.npmjs.com/package/nexstruct).

## Getting started

```bash
npm install
npm run dev
```

Copy the environment template and fill it in:

```bash
cp .env.example .env.local
```

Open http://localhost:3000.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui (Radix + Tailwind CSS) |
| Forms | react-hook-form + zod |
| State | Zustand |
| API client | Fetch client |
| Data fetching | TanStack Query hooks · server-side fetch helpers |
| Auth | JWT (your backend) — in-memory access token + HttpOnly refresh cookie |
| Realtime | Socket.io client |

## Project structure

```
src/
├── api/         # API clients
├── app/         # Routes (App Router): page.tsx → *-container.tsx
├── auth/        # Auth configuration and clients
├── components/  # ui/ primitives · common/ shared components · layouts/ app shell · features/ by domain
├── config/      # Site metadata and navigation
├── fonts/       # Self-hosted fonts
├── hooks/       # React hooks (data fetching, theme, …)
├── lib/         # Utilities, HTTP core, theme palette
├── providers/   # Context providers, composed in providers/index.tsx
├── store/       # State stores
├── styles/      # Extra global styles
├── types/       # Shared TypeScript types
```

Conventions (page → container → components, where files go, the `ActionButton` rule) are in [guide.md](./guide.md).

## Scripts

| Command | |
|---|---|


## Calling your API

### Client components — `src/hooks/client-api`

TanStack Query hooks on top of one request function (`useApiRequest`), which resolves paths against `NEXT_PUBLIC_API_URL`, attaches the signed-in user's credentials and throws a typed `ApiError`.

```tsx
'use client';
import { useApiMutation, useFetchData } from '@/hooks/client-api';

type User = { id: string; name: string };

export function Users() {
  const { data, isPending, error } = useFetchData<User[]>({ path: 'users', params: { page: 1 } });
  const createUser = useApiMutation<User, { name: string }>({
    method: 'POST',
    path: 'users',
    invalidate: [['users']],
    successMessage: 'User created',
  });
  // …
}
```

Failed requests are retried only for network errors and 5xx responses. Mutation errors show a toast with the server's message (`errorToast: false` to opt out).

### Server Components & Server Actions — `src/hooks/server-api`

`server-only` helpers using `API_URL` (falls back to `NEXT_PUBLIC_API_URL`).

```tsx
import { fetchData } from '@/hooks/server-api';

export default async function Page() {
  const users = await fetchData<{ id: string; name: string }[]>('users', { revalidate: 60, tags: ['users'] });
  // …
}
```

> With the **memory-cookie** strategy the token only exists in the browser, so server-side requests are anonymous. Load user-specific data from client components.

### Fetch client — `src/api/fetch`

```ts
import { api } from '@/api/fetch/client';

const users = await api.get<{ id: string }[]>('users', { params: { page: 1 } });
```

## Authentication — JWT against your backend

Token strategy: **in-memory access token + HttpOnly refresh cookie** (`src/auth/jwt/token-storage.ts`).

| Page | Route |
|------|-------|
| Sign in | `/login` |
| Create account | `/register` |
| Forgot / reset password | `/forgot-password` · `/reset-password?token=…` |
| Protected example | `/account` |

```tsx
'use client';
import { useAuth } from '@/hooks/use-auth';
import { RequireAuth } from '@/components/common/auth/require-auth';

function Profile() {
  const { user, logout } = useAuth();
  // …
}

export default function ProfileContainer() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}
```

Expired sessions are refreshed transparently (once, even when many requests fail at the same time). Your backend needs these endpoints — paths are configurable in `src/auth/jwt/config.ts`:

| Endpoint | Body | Returns |
|----------|------|---------|
| `POST /auth/login` | `{ email, password }` | `{ user, accessToken?, refreshToken? }` |
| `POST /auth/register` | `{ name, email, password }` | same as login |
| `POST /auth/refresh` | `{ refreshToken? }` | `{ accessToken?, refreshToken? }` |
| `POST /auth/logout` | — | — |
| `GET /auth/me` | — | `User` |
| `POST /auth/forgot-password` | `{ email }` | — |
| `POST /auth/reset-password` | `{ token, password }` | — |

Cookies must be `HttpOnly; Secure; SameSite`, and CORS must allow credentials for this origin.

## State

### Zustand — `src/store/zustand`

```tsx
import { useCounterStore } from '@/store/zustand';

const count = useCounterStore((s) => s.count);
const increment = useCounterStore((s) => s.increment);
```

## Forms

react-hook-form + zod, with `CustomField.*` components in `src/components/common/fields`.

```tsx
'use client';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { loginSchema } from '@/components/common/forms/schemas/example.schema';
import { CustomField } from '@/components/common/fields/cus-input-field';

export function SignInForm() {
  const form = useZodForm(loginSchema, { defaultValues: { email: '', password: '' } });
  return (
    <form onSubmit={form.handleSubmit((values) => console.log(values))}>
      <CustomField.Text form={form} name="email" type="email" labelName="Email" />
      <CustomField.Password form={form} name="password" labelName="Password" />
    </form>
  );
}
```

## Theme

Every color comes from `src/lib/theme/palette.json`.

```bash
npm run theme                    # regenerate src/app/globals.css after editing palette.json
npm run theme:preset -- emerald  # switch preset: blue emerald violet rose amber cyan slate mono
```

Light/dark mode follows the OS until the user picks one with the toggle in the top bar.

## Realtime

```tsx
'use client';
import { useEffect } from 'react';
import { ActionButton } from '@/components/common/button';
import { useSocket } from '@/hooks/socket';

export function Chat() {
  const { isConnected, emit, on } = useSocket();
  useEffect(() => on<{ text: string }>('message:new', (m) => console.log(m.text)), [on]);
  return (
    <ActionButton disabled={!isConnected} handleOpen={() => emit('message:send', { text: 'hi' })}>
      Send
    </ActionButton>
  );
}
```

Set `NEXT_PUBLIC_SOCKET_URL` in `.env.local`.

## Git hooks

Installed by `npm install` (Husky):

| Hook | Runs |
|------|------|
| pre-commit | Prettier on staged files (lint-staged) |
| pre-push | `tsc`, ESLint, `next build` |
| commit-msg | Conventional Commits (commitlint) |

Bypass once with `--no-verify`.

## Updating

```bash
npx nexstruct update          # preview and apply template improvements
npx nexstruct update --dry-run
```

Files you changed are never overwritten without `--force` (and then a backup is kept).
