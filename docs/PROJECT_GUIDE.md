# TaskForge: Project Guide (A to Z)

Use this to explain the project, demo it, and answer questions. Every claim here matches the code in this repository.

---

## 1. What it is, in one minute

TaskForge is a **project and task management web app** for small teams, like a small Trello/Jira. People sign in, create projects, invite teammates, plan tasks on a **kanban board** or a **filterable list**, comment, get **live notifications**, and see a **dashboard** with charts.

The app has two halves:

- **Frontend**: the Next.js app in this repo. This is what I built.
- **API**: for now a **demo API built into the same Next.js app** (`/api/mock`). It behaves like a real backend (login, permissions, errors) with seeded demo data. When the real backend is ready, it replaces the demo API by changing **one environment variable**.

> The honest framing: *"The frontend is complete and production-style. The backend is a realistic demo API that follows the backend plan, so the frontend can be built and tested without waiting for it."*

---

## 2. Technology and why each piece was chosen

| Need | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** | Required by the assignment; file-based routing, server components for pages |
| Styling | **Tailwind CSS 3 + Radix UI primitives (shadcn-style)** | Fast, consistent, accessible building blocks |
| Server data | **TanStack Query** | Caching, loading/error states, refetching, optimistic updates |
| Forms | **react-hook-form + Zod** | One schema validates the form and mirrors the API rules |
| Small UI state | **Zustand** | Only for the command palette and help dialog |
| Drag and drop | **dnd-kit** | Accessible: mouse, touch and keyboard |
| Charts | **Recharts** | Dashboard graphs (lazy-loaded) |
| Real-time | **socket.io** | Live updates across users |
| Loading skeletons | **boneyard-js** | Skeletons generated from the real UI instead of hand-drawn |
| Command palette | **cmdk** | Ctrl/Cmd+K search |
| Tests | **Vitest** | 27 unit tests |

---

## 3. How the code is organised (the architecture)

### The one rule for every page: page → container → components

```
page.tsx            Server component. Only renders the container. No state.
*-container.tsx     Client component. Holds state, URL state, data hooks, composition.
components/...      Pure UI: receives props and callbacks. No API calls.
service.ts          The ONLY place that talks to the API (next to the page).
```

Example, the task list:

- `app/(app)/projects/[projectId]/list/page.tsx` renders the container.
- `list-container.tsx` reads filters from the URL, calls `useTaskList(...)` from the shared `service.ts`, and passes data to `TaskTable` and `TaskFilters`.
- `TaskTable` and `TaskFilters` (in `components/features/tasks/`) only draw things.

### Folders

```
src/
├─ app/                     routes ((auth) public pages, (app) signed-in pages, api/mock demo API)
├─ components/
│  ├─ ui/                   raw shadcn primitives, never edited
│  ├─ ui/custom/            customised copies (e.g. phone-friendly dialog)
│  ├─ common/               shared pieces (EmptyState, ErrorState, ConfirmDialog, form fields, schemas)
│  ├─ layouts/              sidebar, top bar, mobile menu
│  └─ features/             UI per area: tasks, projects, members, dashboard, comments, ...
├─ hooks/api-hooks/         useFetchData / useApiMutation: the only way to call the API
├─ mocks/                   the demo API: seed JSON, in-memory database, routes
├─ lib/                     permissions, HTTP helpers, date helpers
├─ types/                   one file per area (task.ts, project.ts, ...)
└─ bones/                   generated loading skeletons
```

### Conventions (set so the code stays simple and consistent)

- API calls **only** in `service.ts` through `@/hooks/api-hooks`. Shared calls go in the nearest shared parent.
- The **folder names the role**, the file names the thing: `types/task.ts`, never `task.type.ts`. Everything is kebab-case.
- `ui/` stays raw. Customised versions go in `ui/custom/`.
- Pages have **no width caps**; they use the full width.
- Code is written to be easy to read, with short comments on functions.
- Loading skeletons come from **boneyard-js** only.

---

## 4. How data flows (follow one click)

Moving a card on the board:

1. You drag the card. `kanban-board.tsx` previews the move instantly.
2. On drop, `useMoveTask` (in `[projectId]/service.ts`) runs a **mutation**.
3. **Optimistic update**: the cached board is changed immediately so the UI never waits.
4. `useApiMutation` calls the shared `api` client, which adds the access token.
5. The API checks permissions, saves the change and returns the task.
6. If it **fails**, the cache snapshot is restored (the card goes back) and an error toast appears.
7. The API also tells the socket server, which pushes the event to everyone else in the project; their screens refresh that data.

---

## 5. Authentication (how login works)

- **Sign in/sign up** call `/auth/login` / `/auth/register`. The API returns an **access token** and sets a **refresh token as an httpOnly cookie** (JavaScript can't read it, which blocks theft via XSS).
- The access token is kept **in memory only**, not in localStorage. After a page reload the app calls `/auth/refresh` (the cookie is sent automatically) to get a new one, then `/auth/me`.
- If any request gets a **401**, `authFetch` refreshes **once** (many simultaneous failures share one refresh) and retries. If that fails, you're signed out and sent to the login page.
- Pages under `(app)` are guarded by `RequireAuth`, which shows a loader while the session is restored and redirects to `/login?next=...` if you're not signed in. After login you return to where you were.
- Sign out clears the cache so the next person never sees old data.

---

## 6. Roles and permissions (the core of the assignment)

The app has **three project roles**. The same person can be an Owner in one project and a Member in another.

| Action | Owner | Admin | Member |
|---|:-:|:-:|:-:|
| See project, tasks, comments | ✅ | ✅ | ✅ |
| Edit project name/description | ✅ | ✅ | ❌ |
| Create/manage labels | ✅ | ✅ | ❌ |
| Archive/restore, delete project | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |
| Add members | ✅ (admins or members) | ✅ (members only) | ❌ |
| Remove members | ✅ | ✅ (members only) | ❌ |
| Change a member's role | ✅ | ❌ | ❌ |
| Leave the project | ❌ (must transfer first) | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Edit / move any task | ✅ | ✅ | only tasks they **created or are assigned to** |
| Delete a task | ✅ | ✅ | only tasks they **created** |
| Comment | ✅ | ✅ | ✅ |
| Edit a comment | own only | own only | own only |
| Delete a comment | ✅ any | ✅ any | own only |

Other rules:

- Someone who is **not a member** gets **404** for the project (not 403), so they can't even confirm it exists.
- Archived projects are **read-only** for tasks (the API refuses changes; the UI disables them).
- A task can only be assigned to a **current member**. Removing a member un-assigns their tasks.
- The owner can't be removed or demoted; ownership moves only through an explicit transfer.

**Where it lives:** one file, `src/lib/permissions.ts`, is used by **both the UI** (to hide/disable controls) and **the demo API** (to enforce). The UI hiding is for convenience; **the API is what actually enforces security**.

### About "product manager, team lead, developer, tester"

These four are **how I walked through the app**, not four separate roles in the code. They map to the three real roles:

| Persona | Demo login | App role | What they do in the demo |
|---|---|---|---|
| Product manager | owner@demo.dev | **Owner** | Creates the project, invites the team, sets up labels, reads the dashboard, archives/deletes |
| Team lead | admin@demo.dev | **Admin** | Plans and assigns tasks, runs the board, manages members (but can't delete the project) |
| Developer | member@demo.dev | **Member** | Sees "My tasks", moves and updates their own tasks, comments; locked out of admin features |
| Tester | any account | n/a | Not a role. Testing is done by trying every account and edge case |

> If asked "is there a tester role?": *No. The assignment's permission model is owner/admin/member. "Tester" describes the QA pass I did across all roles.*

All demo accounts use the password `Demo1234!`. The login page has one-click buttons for them.

---

## 7. Every feature, by page

### Login and Sign up
Split layout with a brand panel; password show/hide; strength meter on sign up; server errors shown inline; one-click demo accounts.

### Dashboard (`/dashboard`)
- 7 stat tiles: total/active projects, total tasks, completed, high priority, overdue, assigned to me.
- Charts: tasks by status (accessible colours), by priority, completed per day (last 14 days).
- **My tasks** (soonest due first) and **recent activity**.
- A brand-new user sees a "Create your first project" empty state.

### Projects (`/projects`)
Search (debounced), All/Active/Archived tabs, grid or list view, pagination, project cards with progress, members, your role and overdue count. **New project** dialog with validation. Everything is stored **in the URL**, so a filtered view can be shared or bookmarked.

### Project workspace (`/projects/[id]/...`)
A header (name, your role, members) plus tabs.

- **Board**: four columns (Todo, In Progress, In Review, Done), counts, quick add per column, board search. **Drag and drop** with mouse, touch (press and hold) or keyboard (Space, arrows, Space). Optimistic with rollback. Cards you can't move show why.
- **List**: search, filters (status, priority, assignee incl. Me/Unassigned, overdue), sort field and direction, rows per page, pagination. Active filters appear as removable chips with "Clear all". Quick status change right in the row. A table on desktop, cards on phones.
- **Task drawer** (opens from either view, URL `?task=`): edit title, description, status, priority, assignee, due date, labels; delete with confirmation; **comments** (add, edit own, delete); warns before discarding changes; read-only if you can't edit.
- **Members**: list with roles, **add by searching registered users**, change role, remove, leave, **transfer ownership**, each destructive step confirmed.
- **Activity**: paginated timeline of who did what.
- **Settings** (owner/admin): edit details, manage labels; owner-only danger zone with archive/restore and **delete with typed-name confirmation**.

### Notifications
Bell with unread count and a dropdown; full page; click to open and mark read; "Mark all as read". Assigning someone a task or adding them to a project creates one.

### Account
Edit name, change password (server errors land on the right field), light/dark/system theme, sign out.

### Everywhere
- **Ctrl/Cmd+K command palette**: jump to pages/projects, new task/project, toggle theme.
- **Shortcuts**: `c` new task/project, `/` focus search, `g d` dashboard, `g p` projects, `g n` notifications, `?` help.
- **Real-time**: changes by teammates appear instantly; a Live/Offline dot in the top bar; it reconnects by itself.
- **Responsive** from 360 px: sidebar becomes an icon bar on tablets and a menu on phones; dialogs become bottom sheets on phones; the board swipes between columns.
- **Dark mode**, reduced-motion support, keyboard-friendly controls.
- Friendly **empty, error and 404 states** and **loading skeletons** everywhere.

---

## 8. Assignment requirements → where they are satisfied

| Requirement | Where |
|---|---|
| Next.js structure | App Router, `page → container → components`, route groups `(auth)` / `(app)` |
| API integration | `hooks/api-hooks` + per-route `service.ts` + demo API in `src/mocks` |
| State handling | TanStack Query (server), URL (filters), Zustand (tiny UI state), react-hook-form (forms) |
| Form validation | Zod schemas in `components/common/forms/schemas/`, server errors mapped to fields |
| Loading / error / empty states | boneyard skeletons, `ErrorState` with retry, `EmptyState`, 404 and error pages |
| Usability | Command palette, shortcuts, URL-shareable filters, optimistic UI, toasts |
| Register / login | `(auth)` pages, token refresh, guarded routes |
| Create projects, add members | Projects page, Members tab with user search |
| Tasks: title, description, status, priority, assignee, due date | Task form and drawer |
| Search, filter, sort, pagination | List tab and Projects page, all URL-synced |
| Owner vs member permissions | `lib/permissions.ts`, enforced by the API, reflected in the UI |
| Dashboard | `/dashboard` |
| Responsive, polished UI | Mobile-first, dark mode, tested at 375 / 768 / 1280 px |
| Bonus: real-time, notifications, kanban DnD, comments | All built |

---

## 9. How it was built (the process)

1. **Plan first.** A frontend plan (and a backend plan) listed requirements, pages, data layer and design rules.
2. **Audit the scaffold.** Found the starter's API hooks were broken (missing files, tokens in localStorage) and rewrote them on top of the shared client so they use the in-memory token and silent refresh.
3. **Demo API.** Because the backend isn't built yet, I made a fake but realistic API inside Next.js: seeded users, projects, tasks; real login with an httpOnly cookie; permission checks; the same response and error format the backend plan specifies.
4. **Stages, one branch each.** Dashboard → Projects → Workspace → Task list → Task drawer → Kanban board → Members → Settings → Notifications and Account → Auth pages → Skeletons → Command palette → Unit tests → README → Real-time → Fixes. For each: build, check types and lint, **test in a real browser at phone / tablet / desktop widths**, commit, **merge into `main`**, push to GitHub.
5. **Role-based walkthrough.** Used the app as owner, admin and member (plus tester edge cases) and fixed 10 problems found.
6. **Real-input testing.** Re-tested with a scripted browser using real keyboard, mouse and touch events and found 4 more bugs (details in section 12).

Git history shows this: one feature branch per stage and a merge commit for each on `main`.

---

## 10. How to run and demo it

```bash
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=/api/mock
npm run dev                     # http://localhost:3000
npm run socket                  # second terminal, for live updates
npm test                        # 27 unit tests
npm run build                   # production build
```

### A 5-minute demo script

1. **Sign in** with the **Owner** demo button. Show the dashboard (stats, charts, my tasks).
2. **Projects**: search, switch to list view, **create** "Demo Project".
3. **Members**: add Marcus as **Admin** and Priya as **Member** (search users).
4. **Settings**: create two labels. Point out the **Danger zone** is owner-only.
5. **Board**: create tasks, assign some, **drag a card** between columns (mention optimistic update and rollback).
6. **Two windows for real-time**: open a private window as **Member** (Priya). Move a card in one window; watch it appear in the other. Assign Priya a task as the owner; show the toast and bell.
7. **Permissions**: as Priya, open a task she doesn't own: read-only. Try dragging it: locked. No Settings tab.
8. **List**: filters, chips, sort, pagination, change a status inline.
9. **Phone width** (browser dev tools, 375 px): bottom-sheet dialog, swipeable board.
10. **Ctrl+K** palette, **dark mode**, and finish on the GitHub branch graph.

---

## 11. Questions you will probably get, with answers

**Is there a real backend?**
Not yet. The API is a demo implementation inside the Next.js app that follows the backend plan (same endpoints, response and error format, permission rules). Switching is one variable: `NEXT_PUBLIC_API_URL`. The README describes the contract the backend must follow.

**Where is the data stored?**
In memory on the dev server, loaded from JSON seed files. It resets when the server restarts. A real backend would use a database.

**Is the login secure?**
The *design* is the secure one: short-lived access token in memory, refresh token in an httpOnly cookie, one silent refresh, redirects restricted to same-site paths. But the demo API's tokens are simple fake strings and passwords are stored in plain text, **only because it's a demo**. A real backend must use hashed passwords and signed JWTs.

**Why is the access token not in localStorage?**
Anything in localStorage can be stolen by an XSS attack. In memory is safer, and the httpOnly refresh cookie restores the session after a reload.

**If the UI hides buttons, can someone just call the API directly?**
They'd be blocked. The permission checks run **in the API** too (the demo API reuses the same permission file). The UI hiding is only for convenience. I tested it: a member calling "archive project" or "edit someone else's task" gets 403, and a non-member gets 404.

**Why React Query and not Redux?**
Almost all state is server data (projects, tasks). React Query already handles caching, loading and errors, and refetching. Redux would mean writing all that by hand. Zustand is only used for two tiny UI flags.

**Why are filters in the URL?**
Views become shareable and bookmarkable, the back button works, and a refresh keeps your place.

**How does drag and drop avoid feeling slow?**
Optimistic updates. The card moves instantly in the UI, the request happens in the background, and if it fails the card snaps back with an error message.

**How does real-time work?**
A small socket.io server. Each user joins a "room" per project they belong to. When the API changes something it notifies the socket server, which broadcasts to that room, and every open page refreshes the matching data. If the socket server is down the app still works, with an "Offline" indicator, and reconnects automatically.

**What happens when two people edit the same task?**
Last write wins on the server. Live updates make the other person's change show up quickly, so conflicts are rare, but there is no merge or lock. This is a known limitation.

**Why a "page → container → component" structure?**
Pages stay server components, the logic lives in one place per page (the container), and components are plain UI that's easy to reuse and test. Anyone, even a new intern, can find where something lives.

**Why not call the API directly in components?**
Having one `service.ts` per route keeps every endpoint in one findable place and keeps components clean.

**How did you handle loading states?**
boneyard-js records the real UI's layout and replays it as skeleton blocks, so skeletons always match the page exactly instead of being hand-drawn.

**Is it accessible?**
Radix primitives for dialogs and menus, keyboard drag and drop, focus returned after closing lists, visible focus rings, ARIA labels, colour-blind-safe chart colours with text labels, and reduced-motion support. It hasn't had a formal audit.

**How is it responsive?**
Mobile-first Tailwind. Sidebar → icon bar → hidden menu; table → cards; dialogs → bottom sheets; board columns → swipeable. Tested at 375, 768 and 1280 px.

**What testing did you do?**
27 unit tests (permission rules, form schemas, date logic, and the demo API including 401/403/404/422 cases), plus extensive manual browser testing across all roles and screen sizes, plus scripted real-input browser tests for typing, keyboard and touch drag and animations.

**What's missing?**
A real backend and database, file attachments, bulk actions, rename/delete labels, automated end-to-end tests in the repo, and testing on real iOS/Android devices.

**What would you do next?**
Build the NestJS + PostgreSQL backend from the backend plan, add Playwright end-to-end tests to CI, and add attachments.

---

## 12. Problems found and fixed (shows engineering rigour)

From the role-based walkthrough:
- Drag preview and drop animation landed in the wrong place → cards now move while dragging.
- Dialogs on phones had no height limit → bottom sheets.
- Dropdown lists were clipped inside dialogs → rendered above everything.
- Escape lost focus in dropdowns; required fields could be cleared; new projects had no labels; no reduced-motion support.

From real-input testing:
- The "discard unsaved changes?" warning never appeared (form state wasn't being tracked).
- Touch drag never started (pointer sensor grabbed touches).
- Edge auto-scroll skipped whole columns on phones.
- Touch drops picked the wrong neighbouring column.

---

## 13. Numbers

- About **250 source files**, ~**15,500 lines** of TypeScript (includes the starter's shared components).
- **14 routes**, **39 demo API endpoints**, **27 unit tests**.
- Git: `main` plus one branch per stage, merged with merge commits (see the GitHub graph).
- Dashboard first-load JS reduced from 277 kB to 174 kB by lazy-loading the charts.

---

## 14. Be ready to say how it was made

If your course asks how you built the project, answer honestly about the tools you used, including AI assistance. The structure of this guide (plan, stages, tests, fixes) is what you can explain and defend. Before presenting, open and read the key files so you can walk through them yourself: `lib/permissions.ts`, `hooks/api-hooks/`, one container (`list-container.tsx`), `kanban-board.tsx`, and `mocks/handle-request.ts`.
