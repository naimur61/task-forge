# TaskForge Web: Progress

How to resume: read `FRONTEND_PLAN.md` (section 3 rules first) and `guide.md`, then do the **first unchecked task**.
A task is done only when `npm run lint` and `npm run typecheck` pass. Tick it and add a one-line note.
The backend is built separately by the owner. Never wait for it: use the demo API (`NEXT_PUBLIC_API_URL=/api/mock`, see FRONTEND_PLAN section 6) and add each feature's mock endpoints together with the feature.
If a task is truly blocked, mark it `[!]` with the reason and move to the next one.

## Day 1: Foundation
- [x] Audit scaffold: lint clean; typecheck errors were only in api-hooks + examples. Node lives in mise: `export PATH=~/.local/share/mise/installs/node/22.20.0/bin:$PATH`
- [x] Rewrite `hooks/api-hooks` on `api/fetch/client.ts`: `useFetchData`, `useApiMutation` (path fn, toBody, invalidate, successMessage, onMutate rollback). `useInfiniteFetchData` dropped (unused).
- [x] Remove `examples` (`npm run cleanup`), counter store, `api/fetch/users.ts`, example schema
- [x] Naming convention: no role suffixes (`types/task.ts`, not `task.type.ts`), see guide.md
- [x] Mock API: `src/mocks/` + `app/api/mock/[...path]/route.ts`. All endpoints from BACKEND_PLAN §7 (auth, projects, members, tasks, board, move, comments, labels, dashboard, notifications). Verified with curl: login cookie, refresh, filters, 403/404. Demo logins: owner@ / admin@ / member@demo.dev, password `Demo1234!`
- [x] Types: `types/common.ts`, `project.ts`, `member.ts`, `task.ts`, `dashboard.ts`, `activity.ts`, `notification.ts`
- [x] Primitives: `ui/command.tsx` (cmdk). Calendar/Combobox not needed: existing `DatePickerField` + searchable `SelectField` cover them. Skeletons: **boneyard-js only** (see FRONTEND_PLAN §8). Installed: date-fns, recharts, @dnd-kit/*, cmdk, boneyard-js
- [x] Common components: EmptyState, ErrorState, ConfirmDialog (typed confirm), UserAvatar + AvatarStack, PageHeader
- [x] `lib/permissions.ts` with `can(role, action)`, `canEditTask`, `canDeleteTask` (shared by UI and mock API)
- [x] App shell: `(app)/layout.tsx` → `app-shell-container.tsx` (RequireAuth + GlobalLoader splash, notification bell via `(app)/service.ts`), sidebar/topbar/mobile nav with BrandMark, user dropdown (sign out clears query cache). Theme: indigo primary.

## Stages (one branch each → test in browser at 360/768/1280 → commit → merge into main → push)
Workflow per stage: `git checkout -b <branch>` → build → `npm run typecheck && npm run lint` → browser test (owner + member accounts, light + dark) → tick here → commit → `git merge --no-ff` into main → `git push origin main <branch>`.

- [x] 0. `main`: git init + foundation commit (everything above), push
- [x] 1. `feat/dashboard`: stat cards, status/priority/trend charts, my tasks, recent activity, new-user empty state
- [x] 2. `feat/projects`: projects list (search, status, grid/list, pagination), create project dialog
- [x] 3. `feat/project-workspace`: project layout (header, tabs, 404 for non-members), shared `[projectId]/service.ts`, Activity tab
- [x] 4. `feat/task-list`: List tab with URL-synced search/filter/sort/pagination, filter chips, table (desktop) / cards (mobile), quick status change
- [x] 5. `feat/task-drawer`: New task dialog, task drawer (edit, delete, permission gating, unsaved-changes guard), comments
- [x] 6. `feat/kanban-board`: Board tab, dnd-kit drag & drop (mouse/touch/keyboard), optimistic move + rollback, quick add per column
- [x] 7. `feat/members`: members table, add member with user search, change role, remove, leave, transfer ownership
- [x] 8. `feat/project-settings`: settings (edit, archive/restore, delete with typed confirm)
- [x] 9. `feat/notifications-account`: notifications page (mark read / all), account (profile, password, theme)
- [x] 10. `feat/auth-pages`: split-layout login/register with demo hint, global not-found / error pages
- [x] 11. `feat/skeletons`: boneyard-js bones for 13 loading surfaces, registry imported in providers. Refresh with `npm run bones` (dev server on :3000)
- [x] 12. `feat/command-palette`: Cmd+K palette, keyboard shortcuts (c, /, g d, ?)
- [ ] 13. `test/unit`: Vitest unit tests (permissions, schemas, url state, mock filters), `npm test`
- [ ] 14. `docs/readme`: README (features, demo logins, switch to real backend, architecture, decisions)

## Notes
