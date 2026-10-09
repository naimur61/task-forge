# FRONTEND PLAN: TaskForge Web (Next.js)

> Portfolio-grade, responsive, good-looking UI for the Project & Task Management system. It consumes the API described in `../BACKEND_PLAN.md`. This plan is adapted to the **existing scaffold** in this folder (see section 3) and follows its `guide.md` conventions.

---

> **Status (2026-10-10):** core path and stretch phases 1, 2, 4 are built; see `PROGRESS.md`. Changes from this plan: route protection uses the client `RequireAuth` guard (the refresh cookie lives on the API domain, so `middleware.ts` can't read it); the list uses `ui/table` with server-side sort/pagination instead of TanStack Table; date and assignee pickers reuse the existing `CustomField` inputs instead of new Calendar/Combobox primitives.

## 1. Goals & Requirement Traceability

| Brief criterion | How the frontend delivers it | Priority |
|---|---|---|
| Next.js structure | App Router, `page → container → components` pattern from `guide.md` (section 3) | Core |
| API integration | Existing `src/api/fetch` client + `src/hooks/client-api` hooks, typed per feature (section 6) | Core |
| State handling | Server state in TanStack Query, UI state in Zustand, filters in the URL | Core |
| Form validation | `useZodForm` + `CustomField.*` + Zod schemas mirroring backend DTOs (section 7) | Core |
| Loading / error / empty states | Skeletons, error boundaries, empty-state components everywhere (section 8) | Core |
| Overall usability | Clear navigation, kanban + list views, keyboard shortcuts, toasts | Core |
| Register / login | `src/app/(auth)` pages | Core |
| Create projects, add members | Projects page + members tab with user search | Core |
| Tasks with title, description, status, priority, assignee, due date | Task form + detail drawer | Core |
| Search, filter, sort, pagination | List view toolbar, URL-synced | Core |
| Owner vs member permissions | Role-aware UI (hide/disable), 403/404 pages. Backend enforces. | Core |
| Dashboard overview | Stat cards + charts + my tasks | Core |
| Responsive, polished UI | Mobile-first design system, dark mode (sections 9–10) | Core |
| Real-time, notifications, kanban DnD, comments | `socket.io-client` (already installed), dnd-kit | Bonus |

---

## 2. Tech Stack

**Already in the scaffold (`package.json`):** Next.js 15, React 19, TypeScript, Tailwind 3 + tailwindcss-animate, Radix UI primitives (shadcn-style), `@tanstack/react-query` 5, Zustand 5, `react-hook-form` + `@hookform/resolvers`, Zod 4, `socket.io-client`, `next-themes`, `react-hot-toast`, `lucide-react`, ESLint, Prettier, Husky, lint-staged, commitlint.

**To add:**

| Concern | Package | Why |
|---|---|---|
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable` | Accessible kanban |
| Charts | `recharts` | Dashboard |
| Tables | `@tanstack/react-table` | List view sorting/columns |
| Dates | `date-fns` | Light date handling |
| Command palette | `cmdk` | Cmd+K |
| Testing | `vitest`, `@testing-library/react`, `msw`, `@playwright/test` | Unit/component/e2e |

Decisions: keep **react-hot-toast** (no Sonner), keep the scaffold's **fetch-based client** (no Axios), keep **Tailwind 3**. Do not swap what the scaffold already provides.

---

## 3. Project Structure (follows `guide.md`)

Rules from `guide.md` that this plan obeys:
- `page.tsx` is a server component that only renders a container; no `'use client'`, no state.
- `*-container.tsx` holds state, data fetching, and composition.
- Feature components live in `src/components/features/{feature}/`; domain-agnostic in `components/common/`; primitives in `components/ui/`.
- Hooks, stores, API clients, types and providers live under `src/`, never in `src/app/`.
- Inside `src/app/` use only `ActionButton` (`@/components/common/button`); forms use `useZodForm` and `CustomField.*`.
- File names are kebab-case; components are PascalCase exports.

**Project rules (set by the owner, these override anything else in this plan):**
- **API calls live only in `service.ts`**, next to the route's `page.tsx` and `*-container.tsx`. A `service.ts` exports small hooks built on `@/hooks/api-hooks` (`useFetchData`, `useApiMutation`). Containers import from `./service`. Components never call the API.
- **Calls shared by several pages** go in the nearest shared parent route's `service.ts`, for example `app/(app)/projects/[projectId]/service.ts`. Never duplicate a call.
- **`components/ui/` stays raw.** To customize any primitive, copy it into `components/ui/custom/` and edit the copy.
- **Simple code.** Code should be strict and plain enough for an intern to follow. Give each exported function or hook a short, precise comment. Never write long comment blocks.

```
src/
├─ app/
│  ├─ layout.tsx, globals.css, not-found.tsx, error.tsx
│  ├─ (auth)/
│  │  ├─ login/            page.tsx, login-container.tsx
│  │  └─ register/         page.tsx, register-container.tsx
│  ├─ (app)/                                   # authenticated shell
│  │  ├─ layout.tsx                            # sidebar + topbar (components/layouts)
│  │  ├─ dashboard/        page.tsx, dashboard-container.tsx, service.ts
│  │  ├─ projects/
│  │  │  ├─ page.tsx, projects-container.tsx, service.ts
│  │  │  └─ [projectId]/
│  │  │     ├─ layout.tsx                      # project header + tabs
│  │  │     ├─ service.ts                      # calls shared by board/list/drawer (tasks, members)
│  │  │     ├─ board/      page.tsx, board-container.tsx
│  │  │     ├─ list/       page.tsx, list-container.tsx
│  │  │     ├─ members/    page.tsx, members-container.tsx
│  │  │     ├─ activity/   page.tsx, activity-container.tsx
│  │  │     └─ settings/   page.tsx, settings-container.tsx
│  │  ├─ notifications/    page.tsx, notifications-container.tsx
│  │  └─ account/          (profile + password; extend existing route)
│  └─ examples/, api/      (scaffold; remove examples before release via `npm run cleanup`)
├─ components/
│  ├─ ui/                  # raw primitives (never edited)
│  ├─ ui/custom/           # customized copies of primitives (button, tooltip, ...)
│  ├─ common/              # ActionButton, forms (CustomField, useZodForm), EmptyState, ErrorState, ConfirmDialog, UserAvatar, DataPagination
│  ├─ layouts/             # Sidebar, Topbar, MobileNav, PageHeader
│  └─ features/
│     ├─ auth/  projects/  members/  tasks/  comments/  dashboard/  notifications/
│     └─ tasks/ (task-card, task-form, task-drawer, kanban-board, task-table, task-filters)
├─ api/fetch/              # client.ts (existing): low-level HTTP client used only inside api-hooks
├─ hooks/
│  ├─ api-hooks/           # useFetchData, useApiMutation (rewritten to use api/fetch/client.ts)
│  ├─ socket/              # use-socket (existing) + event→cache handlers
│  └─ ui/                  # use-theme (existing), use-url-state, use-debounce, use-hotkeys
├─ store/                  # session/ui Zustand stores
├─ auth/jwt/               # token handling (existing)
├─ lib/                    # utils, http, date-utils, permissions.ts (new)
├─ types/                  # one file per domain mirroring API contracts: task.ts, project.ts ... (no .type suffix)
├─ mocks/                  # demo API: data/*.json, db.ts, routes.ts, helpers.ts
├─ providers/              # auth, query, theme, toast (existing)
e2e/                       # Playwright
```

Before building, read the existing `src/api/fetch/client.ts`, `src/hooks/api-hooks/*`, `src/auth/jwt`, and `src/providers/auth-provider.tsx` and **extend them instead of writing new equivalents**.

**Known scaffold issue (fix on Day 1):** `src/hooks/api-hooks/*` imports files that don't exist (`@/lib/remove-empty-fields`, `@/lib/error-handler`, `../auth/useAccessToken`). The hooks also read the token from `localStorage`, but the token lives in memory (`auth/jwt/token-storage.ts`). Fix: keep the hook names and options, rewrite their internals to call `api` from `src/api/fetch/client.ts` (in-memory token, one silent refresh on 401, `ApiError`), and remove the localStorage code.

---

## 4. Authentication Flow

- Reuse the scaffold's `auth-provider`, `use-auth`, `use-access-token`, and `auth/jwt`. Verify how it stores tokens; target design: **refresh token in an httpOnly cookie** (set by the API), **access token in memory** (not localStorage).
- Route protection: Next.js `middleware.ts` redirects unauthenticated users from `(app)` routes to `/login?next=...` and signed-in users away from auth pages.
- Session bootstrap: on load call `POST /auth/refresh` then `GET /auth/me`, hydrate the store; show a splash skeleton meanwhile.
- Client: on `401` do **one** silent refresh (queue concurrent requests), retry, otherwise log out and clear the query cache.
- `next` redirect after login; logout clears store and cache.
- **UI permission gating:** `lib/permissions.ts` exports `can(role, action)` mirroring the backend matrix. The UI hides or disables controls, but security is enforced by the backend. The UI must handle 403 and 404 gracefully.

---

## 5. Pages & Features

### Auth
Login and Register: split layout (brand panel + form), inline errors, password strength meter, show/hide password, loading button state, server error banner.

### Dashboard (`/dashboard`)
- Stat cards: Total projects, Active projects, Total tasks, Completed tasks, High priority, Overdue, Assigned to me.
- Charts: tasks by status (donut), by priority (bar), 14-day completion trend (area).
- "My tasks" (due soonest), "Overdue" list, recent activity, quick-create buttons.
- Skeleton per card/chart; empty state for new users ("Create your first project").

### Projects (`/projects`)
- Grid/list toggle, search, status filter (Active/Archived), pagination.
- Card: name, description, member avatars, progress bar (done/total), role badge, overdue indicator.
- Create/edit dialog, archive/restore, delete with typed-name confirmation (owner only).

### Project workspace (`/projects/[projectId]`)
Header: name, role badge, members stack, "New task" button. Tabs: Board, List, Members, Activity, Settings (hidden for plain members).

**Board (kanban)**
- Columns: Todo, In Progress, In Review, Done, with counts.
- Drag and drop between and within columns (dnd-kit) with **optimistic update** and rollback, calling `PATCH .../move`.
- Card: title, priority chip, due date (red when overdue), assignee avatar, labels, comment count.
- Quick-add at the bottom of each column. Mobile: column tabs or snap-scroll.

**List**
- TanStack Table with debounced search (300 ms), multi-select filters (status, priority, assignee incl. "Me"/"Unassigned", labels, due range, overdue), sortable columns, server-side pagination with page size selector.
- **All filter/sort/page state lives in the URL** (shareable, back-button safe). Active filters appear as removable chips with "Clear all".
- Row actions: quick status change, assign, edit, delete. Mobile: rows render as cards.

**Task drawer (`?task=<id>`)**
- Inline-editable title/description, status, priority, assignee picker (members only), due date, labels.
- Comments (add/edit/delete own), activity timeline, delete (permission-gated).
- Right sheet on desktop, full-screen on mobile.

**Members**
- Table: avatar, name, email, role badge, joined date.
- Add member dialog with debounced user search (`GET /users/search`) and role pick. Change role (owner), remove (owner/admin), leave, transfer ownership (owner), all with confirmations.

**Activity:** paginated project timeline. **Settings:** edit, archive, delete (owner only).

### Global
- **Notifications:** bell with unread badge, dropdown (latest 10), full page, mark read / read all, live updates.
- **Profile settings:** name, avatar, change password, theme.
- **Command palette (Cmd+K):** jump to project, create task, search tasks.
- **Shortcuts:** `c` new task, `/` focus search, `g d` dashboard, `?` help.
- Custom `403`, `404`, and "session expired" screens.

---

## 6. State & Data Layer

- **API calls only in route `service.ts` files** (see section 3 rules), built on `@/hooks/api-hooks`. Components and containers never call `fetch` or `api` directly.
- **Query keys** are exported from the same `service.ts` as a simple object: `taskKeys.list(projectId, filters)`, `taskKeys.detail(projectId, taskId)`.
- **Service hooks**: `useTaskList`, `useCreateTask`, `useMoveTask`, etc., each with a one-line comment.
- **Defaults:** `staleTime` 30 s, no retry on 4xx, `placeholderData: keepPreviousData` for paginated lists.
- **Optimistic mutations** (snapshot in `onMutate`, rollback in `onError`, invalidate in `onSettled`) for task move, status change, assign, comment add.
- **Real-time:** extend `hooks/socket/use-socket`; join `project:{id}` rooms for open projects; handlers patch or invalidate query caches (`task.updated`, `comment.added`, `member.removed`; if the removed member is me, redirect with a toast).
- **Error normalization:** map the backend error format to `AppError { status, code, message, details }` for forms and toasts.
- **`use-url-state`** hook is the single source of truth for list filters, sort, page, and the open task.
- **Zustand** only for session/token, sidebar state, command palette open.

### Demo data mode (until the real backend exists)
- The backend is built separately by the owner. Until it's ready, the frontend talks to a small fake API inside Next.js.
- `NEXT_PUBLIC_API_URL=/api/mock` turns on demo mode. Set it to the real API URL (e.g. `http://localhost:4000/api/v1`) to switch. Nothing else changes.
- `src/app/api/mock/[...path]/route.ts` only forwards to `handleMockRequest()`. All mock code lives in `src/mocks/`: `data/*.json` (seed data), `db.ts` (in-memory store), `routes.ts` (one handler per endpoint), `helpers.ts` (`ok`, `fail`, `paginate`, `currentUser`).
- The mock follows `BACKEND_PLAN.md` section 7: the `{ data, meta }` envelope, the error format, real login with an httpOnly refresh cookie, and role checks that return 403/404.
- Add each feature's mock endpoints together with the feature itself.

---

## 7. Forms & Validation

- Zod schemas live in `components/common/forms/schemas/` (e.g. `schemas/task.ts`), **mirroring backend DTO rules**. Example `taskSchema`: title 1–200, description ≤ 5000, status/priority enums, optional ISO `dueDate`, optional UUID `assigneeId`.
- Use `useZodForm(schema, options)` and `CustomField.*` inputs per `guide.md`; submit with `ActionButton` (`type="submit"`, `isPending`).
- Map server validation `details[]` to fields with `setError`; non-field errors show as a banner.
- Unsaved-changes guard on dialogs and the drawer.
- Forms: login, register, project, task, comment, add member, profile, change password.

---

## 8. Loading, Error & Empty States

| Surface | Loading | Error | Empty |
|---|---|---|---|
| Dashboard | Card/chart skeletons | Inline retry card | "Create your first project" CTA |
| Projects grid | Card skeletons | `ErrorState` + retry | Illustration + "New project" |
| Board | Column skeletons | Retry banner | "No tasks yet" per column |
| Task list | Row skeletons | Retry banner | "No tasks match your filters" + Clear filters |
| Task drawer | Skeleton form | 404: "Task not found or no access" | n/a |
| Members | Row skeletons | Retry | n/a |
| Notifications | Skeleton list | Retry | "You're all caught up" |
| Mutations | Button spinner, optimistic UI | Toast + rollback | n/a |

Plus route-level `error.tsx` and `not-found.tsx`, `loading.tsx` with Suspense, and an offline banner.

**Skeletons use boneyard-js only** (owner rule, no hand-made skeletons): wrap the real component in `<Skeleton name loading fixture>` from `boneyard-js/react`, keep fixture data in `src/mocks/fixtures/`, and generate bones with `npx boneyard-js build http://localhost:3000 --cookie "tf_mock_refresh=usr_owner"` (config: `boneyard.config.json`, output `src/bones/`, registry imported in `app/layout.tsx`).

---

## 9. Design System

- **Tokens:** existing `npm run theme` / `theme:preset` scripts manage theme variables. Use an indigo/violet primary, status colors (slate/blue/amber/green) and priority colors (gray/blue/orange/red).
- **Typography:** Inter (already in `src/fonts`), clear heading scale.
- **Themes:** light, dark, system via `next-themes` (provider exists), no flash on load.
- **Missing primitives to add:** Sheet, Command, Table, Skeleton, Badge, Card, Calendar/DatePicker, Combobox.
- **Motion:** 150–200 ms transitions, drag overlay, skeleton shimmer, respect `prefers-reduced-motion`.
- **Accessibility (WCAG AA):** contrast-checked tokens, visible focus rings, ARIA labels on icon buttons, keyboard-operable kanban (dnd-kit keyboard sensor), semantic landmarks, associated form errors.

---

## 10. Responsiveness

Mobile-first with Tailwind breakpoints (`sm 640`, `md 768`, `lg 1024`, `xl 1280`).

| Area | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | Bottom tab bar + sheet | Collapsed icon sidebar | Full sidebar |
| Dashboard | Single column, scrollable stat row | 2 columns | 3–4 column grid |
| Board | Column tabs / snap-scroll | 2–3 columns | All columns |
| Task list | Cards | Condensed table | Full table |
| Task drawer | Full-screen sheet | Right sheet (50%) | Right sheet (480–640px) |
| Dialogs | Bottom-sheet style | Centered | Centered |

Touch targets ≥ 44px, no horizontal page scroll, tested at 360, 768, 1280, 1920 widths.

---

## 11. Performance

- Server Components for pages and layouts (per `guide.md`, `page.tsx` is server); client code lives in containers.
- Dynamic import heavy parts (Recharts, dnd-kit, command palette).
- `next/font`, `next/image`, link prefetching, Suspense streaming.
- Debounced search, `keepPreviousData` pagination, virtualize very long lists (stretch).
- `@next/bundle-analyzer`. Targets: Lighthouse ≥ 90 (Perf/A11y/Best Practices), LCP < 2.5 s.

---

## 12. Testing & Quality

| Level | Scope | Tools |
|---|---|---|
| Unit | Zod schemas, `permissions.can`, `use-url-state`, utils | Vitest |
| Component | Task form validation, filters, empty states, role-gated controls | Testing Library + MSW |
| e2e | Register → login → create project → add member → create task → drag to Done → filter/search → logout. Negative path: member sees no owner-only controls; another project's URL shows the 404 page. | Playwright |
| Static | `npm run lint`, `npm run typecheck`, Prettier | existing scripts |

Husky + lint-staged + commitlint (conventional commits) are already configured. CI (GitHub Actions): install → lint → typecheck → unit → build → Playwright against the docker-compose stack.

---

## 13. DevOps

- The backend (`../taskforge-server`) is built separately by the owner. This frontend runs on demo data (section 6) until it's ready.
- Multi-stage `Dockerfile` (`output: 'standalone'`), added to the shared `docker-compose.yml` with the API (`../taskforge-server`).
- `.env.example` already exists; add `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` if missing.
- Deploy: Vercel for the frontend (preview per PR), API on Railway/Render. Document CORS and cookie-domain settings in the README.

---

## 14. Milestones

### Core path (mirrors the 5-day assignment, do this first)
| Day | Deliverable |
|---|---|
| 1 | Audit scaffold (client, auth, hooks, `guide.md`), remove `examples`, app shell (sidebar/topbar/mobile nav), add missing primitives, API modules + types |
| 2 | Login/register with validation, session bootstrap + silent refresh, middleware protection |
| 3 | Projects list/create/edit, project layout + tabs, members tab with user search and role gating |
| 4 | Task list view (URL-synced search/filter/sort/pagination), task form + drawer, assignee picker |
| 5 | Dashboard, loading/error/empty-state audit, responsive pass, tests, README |

### Stretch phases (portfolio differentiators)
1. Kanban board with drag-and-drop and optimistic updates
2. Comments, labels, activity timeline
3. Real-time updates + notifications bell
4. Charts polish, command palette, keyboard shortcuts
5. Playwright e2e suite, Lighthouse tuning, a11y audit
6. Landing page + demo mode with seeded accounts

### Intentionally deferred (document in the README with reasoning)
- i18n / localization
- Offline-first / PWA
- Rich file-upload UI beyond basic attachments
- Bulk task operations

---

## 15. Portfolio Packaging

- **README hero:** tagline, screenshot/GIF of board and dashboard, live demo link, seeded demo credentials.
- **Highlights recruiters care about:** authorization model (owner/admin/member, IDOR protection), refresh-token rotation, optimistic kanban, real-time sync, URL-driven filters, tests and CI.
- **Architecture diagram** (frontend ↔ API ↔ Postgres/Redis) and a short "Decisions & trade-offs" section.
- **Demo assets:** 3–4 screenshots (light/dark, desktop/mobile) and a 30–60 s walkthrough GIF.
- **Resume bullets (draft):**
  - Built a full-stack project management platform (Next.js, NestJS, PostgreSQL, Prisma) with role-based access control and IDOR-safe, project-scoped authorization.
  - Implemented JWT access/refresh rotation with reuse detection, rate limiting, and OWASP-aligned hardening.
  - Delivered real-time kanban collaboration (Socket.IO, optimistic updates) and a Redis-cached analytics dashboard.
  - Reached ≥80% backend test coverage (Jest/Supertest) with Playwright e2e in a GitHub Actions CI pipeline.
