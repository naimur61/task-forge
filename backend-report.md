# Backend report

Issues found while testing the TaskForge frontend against the deployed backend
(`https://task-forge-server-theta.vercel.app/api/v1`). Frontend problems were fixed in
the frontend; everything below needs a backend fix.

Last updated: 2026-10-12 (11:40 UTC, after the third pass).

## Quick login (demo accounts)

The login page has a **Demo accounts** box. One click on a name fills the email, then press **Sign in**.
Password for every account is `Demo1234!`.

| Button on login page | Email             | Role   |
| -------------------- | ----------------- | ------ |
| Ava · Owner          | `owner@demo.dev`  | OWNER  |
| Marcus · Admin       | `admin@demo.dev`  | ADMIN  |
| Priya · Member       | `member@demo.dev` | MEMBER |
| Diego                | `diego@demo.dev`  | MEMBER |
| Sara                 | `sara@demo.dev`   | MEMBER |
| Liam                 | `liam@demo.dev`   | MEMBER |

## Backend issues

Severity: **High** blocks normal use, **Medium** breaks a flow sometimes, **Low** polish.

### B1. Backend goes down and returns 500 on every endpoint — High

- `GET /health` returns HTTP 503 with `{"status":"down","latency":~600}` for minutes at a time, then recovers.
- While it is down, `POST /auth/login`, `POST /auth/refresh`, `GET /dashboard/*`, `GET /notifications`, `GET /projects` return
  `500 {"code":"INTERNAL","message":"Internal server error."}`.
- Seen 2026-10-12 (about 08:06, 08:26–08:32, 08:35 UTC). A run of 10 logins in a row gave 10 × `500`.
- Looks like a lost database connection on the serverless deployment (the `latency: ~600` on `/health` is a timeout).
  Check the DB connection string, connection pooling for Vercel, and the function logs.
- Effect in the app: login fails with "Internal server error.", and a page reload logs the user out
  (the refresh call fails, so the session cannot be restored).

### B2. Random 500s even when `/health` says operational — High

- Right after a healthy `/health`, three parallel data calls with a valid token gave `200 / 500 / 200`, then `200 / 500 / 500`, then `200 / 200 / 500`.
  Repeating `GET /dashboard/summary`, `/dashboard/my-tasks`, `/notifications`, `/projects` one by one also gave 500.
- Probably a cold start or too many DB connections opened at once (one per parallel request).
  Reuse one DB client per function instance and add pooling.
- Note: in the browser's network list, the first copy of each request shows status `503`. That is **not** the backend:
  it is the dev server (React StrictMode) cancelling the first duplicate request, and the same thing happens against a
  local mock that never returns 503. Ignore those lines; only the 500s above are real.

### B3. Errors are 500, not a clear 503 or 401 — Medium

- `POST /auth/refresh` returns `500` when the database is unreachable. It should return `503` (retry later).
  A `401 REFRESH_INVALID` should only mean the cookie is really invalid or expired.
- The frontend logs the user out on `401`, but keeps retrying on `5xx` (fixed in the frontend), so the status code matters.

### B4. Login rate limit is very strict and slow to answer — Medium

- 8 logins within about 10 seconds (all of which returned `500`, see B1) were followed by `429` for the next attempts.
  The first `429` took 5.4 s to answer, the following ones about 0.5 s.
- With the `500`s from B1 each retry counts toward the limit, so a tester gets locked out quickly.
- Please check the limit (for example 5 per minute per IP) and that **successful** logins do not count. Consider returning
  `Retry-After` so the UI can show a wait time.

### B5. CORS blocks the browser: no `access-control-allow-origin` for any origin — High

- The frontend now calls the backend URL directly from `http://localhost:4000` (fixed port). Checked at 11:04 UTC with the same
  requests a browser sends: `OPTIONS /auth/login` and `POST /auth/login` with `Origin: http://localhost:4000` return `204` / `200`
  but **no** `access-control-allow-origin` header (only `access-control-allow-credentials: true`). The same is true for
  `Origin: http://localhost:3000`, which worked earlier today. The browser will block every direct call with a CORS error.
- Fix: send `Access-Control-Allow-Origin: <the request origin>` (not `*`) for the allowed origins, with
  `Access-Control-Allow-Credentials: true`, on both the preflight and the real response. Put the allowed origins in an env variable and
  include `http://localhost:4000` (and the production frontend URL).
- The frontend has no proxy any more: `NEXT_PUBLIC_API_URL` (the backend URL) is the only API setting, so this must be fixed on the backend.

### B6. Refresh cookie is cross-site unfriendly — Low (for production)

- Cookie: `tf_refresh; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`.
- With the frontend on one site and the API on `vercel.app`, the browser does not send a `SameSite=Lax` cookie on `fetch`,
  so `/auth/refresh` returned `401 REFRESH_INVALID` when called from `localhost` without the cookie. Because the frontend logs the
  user out when a refresh fails, the user would be logged out when the 15 minute access token ends (inferred, not waited out).
- With direct calls from `localhost:4000` the cookie is cross-site, so `SameSite=None; Secure` is **required** (a `Lax` cookie is not sent
  on the refresh call and every reload logs the user out). For production either serve the frontend and API on the same
  site (for example `app.example.com` and `api.example.com` with `Domain=.example.com`), or use `SameSite=None; Secure`.

### B7. Notification `link` does not say which task — Low

- `GET /notifications` returns `link` as a project route only (for example `/projects/prj_web/list`).
  Clicking "Marcus assigned you Pricing page copy review" opens the project, not that task.
- The frontend already opens a task from `?task=<taskId>`, so if the backend returns
  `/projects/prj_web/board?task=tsk_0035` for task notifications, the click will open the task drawer directly.

### B8. `GET /dashboard/summary` returns 500 for every user, probably after a project was deleted — High

- At 09:50 UTC `/dashboard/summary` returned `200` and matched the shape the frontend expects.
  Between 09:51 and 09:52 UTC a test script on the real backend created a temporary project ("QA tmp project", then "QA tmp move"),
  added tasks, a comment and a label to it, archived/restored it, moved tasks, then **deleted the project**.
- Since then `/dashboard/summary` returns `500 INTERNAL` on **every** call for `owner@`, `admin@` and `member@demo.dev`
  (12 of 12 in a row for the owner, checked about 4 seconds apart). Every other endpoint returns `200` every time.
  `/health` says `operational`, so this is not the database being down.
- Not proven, but the timing points to data left behind by the project delete (for example activity or notification rows
  that still point to the deleted project, which the summary's `recentActivity` / `projectName` lookup cannot handle).
- Please check the function logs for the exception, make project delete remove or cascade its activity, notifications and tasks,
  and make the summary skip rows whose project is missing. The demo data may need a reseed.
- Effect in the app: the dashboard cards, charts and recent activity stay on the loading skeleton, then show
  "Could not load this" with a Try again button.
- Repro: login as any demo user, `POST /projects`, `POST /projects/:id/tasks`, `DELETE /projects/:id`, then `GET /dashboard/summary`.

### B9. `/health` says `operational` while the data endpoints return 500 — Medium

- Seen at 10:32 to 10:44 UTC (16:32 to 16:44 on the test machine clock, which is UTC+6): `GET /health` returned `operational` and login worked, but
  `/dashboard/summary`, `/dashboard/my-tasks`, `/projects` and `/projects/:id/board` all returned `500` on every call
  (30+ calls in a row). The health check does not cover the data path (database queries), so it cannot be used to know if the API works.
- Please make `/health` run a small real query (for example `SELECT 1` plus one read on a main table) and return `503` if it fails.

## Third pass: full UI test in the browser, 2026-10-12 (11:20 to 11:40 UTC)

The frontend (`http://localhost:4000`) now calls `NEXT_PUBLIC_API_URL` directly. `.env.local` pointed at the **local backend**
(`http://localhost:4040/api/v1`), so the whole UI pass ran against it, and every request in the browser's network tab was checked.
The deployed backend was re-checked with curl (sequential requests only).

### Local backend (`:4040`): everything worked

| Flow | Result |
| ---- | ------ |
| Sign-up | Empty / invalid / weak-password messages OK; valid sign-up `POST /auth/register` 201, lands on an empty dashboard ("Create your first project"); same email again 409, shown as "An account with this email already exists." |
| Login / logout / reload | Wrong password 401 "Incorrect email or password."; login 200; reload restores the session (`/auth/refresh` 200); sign-out 204 and the cookie is cleared; protected URL while signed out goes to `/login?next=...` |
| Forgot / reset password | `POST /auth/forgot-password` 204, "Check your email" screen; reset with a bad token 400, shown as "Reset link is invalid or has expired." |
| Every page (Dashboard, Projects, Board, List, Members, Activity, Settings, Notifications, Account) | All requests 200 / 201 / 204. Real data renders; no overflow at 375 or 768 px |
| Writes from the UI | create project 201, create task 201, comment 201, delete project (type-name confirm) works; dashboard summary still returns 200 afterwards (so B8 does not happen locally) |
| Load | 4, 8 and 16 parallel requests, 3 rounds each: 48 of 48 returned 200 (B2 does not happen locally) |
| CORS from `http://localhost:4000` | `Access-Control-Allow-Origin: http://localhost:4000`, `Allow-Credentials: true`, `Expose-Headers: Retry-After,X-Request-Id` |
| Cookie | `tf_refresh; HttpOnly; SameSite=Lax` (no `Secure`). Works because `localhost:4000` and `localhost:4040` are the same site |
| Login limit | 14 logins in a row all 200 (no limit hit locally) |

Only oddities locally: `/health` said `degraded` (latency 1460 ms) once at 11:22 UTC, then `operational`.

### Deployed backend (`task-forge-server-theta.vercel.app`): not updated

| Item | Result at 11:37 UTC |
| ---- | ------------------- |
| Health and reads | `operational`; summary, my-tasks, projects, notifications, board all `200` (3 of 3 each, sequential) |
| B7 notification links | Fixed (`?task=<id>` is returned) |
| B5 CORS | **Not fixed.** `OPTIONS` and `POST` with `Origin: http://localhost:4000` have no `access-control-allow-origin`, so a browser pointed at this URL will block every call |
| B6 cookie | Still `Secure; SameSite=Lax`. It must be `SameSite=None; Secure` for a cross-site frontend |
| B1, B2, B8, B9 | Not seen again in this sample (sequential only; no parallel test on purpose), but they were seen earlier today and do not happen on the local backend. They look specific to the deployed environment (database connection / pooling on the serverless deployment) |

**Main finding: the local backend code already has the CORS and `Retry-After` changes, the deployed one does not. Redeploy the current backend.**
Then re-test B1, B2, B8 and B9 on the deployed URL under normal page load (3 to 4 parallel calls per page).

### Frontend notes from this pass (not backend problems)

- The first copy of each GET in the network list shows `503`. That is the dev server cancelling a duplicate request (React StrictMode) and is not a server response.
- Responses with no body (`204`, for example logout, delete, forgot-password) are labelled `503` by the test tool, but curl confirms `204`.
- The Next.js "issues" badge and the hydration warning come from the "temp mail" browser extension adding attributes to email inputs. Not an app bug.
- Each page sends a CORS preflight (`OPTIONS`) per URL because of the `Authorization` header; `Access-Control-Max-Age: 600` is already set, so only the first call per URL pays it.

## Second pass (after the backend fixes), 2026-10-12

| Item | Result |
| ---- | ------ |
| B7 notification links | Fixed. Task notifications now return `/projects/:id/board?task=<taskId>`. |
| B8 `/dashboard/summary` | Not reliably fixed. It returned `200` 5 times in a row (about 10:30 UTC), then `500` again with the other data endpoints. |
| B1 backend down | Still happens. `/health` went `down` for about 2.5 minutes, then again around 10:47 UTC. |
| B2 failures under load | Still happens, and it looks load related. Single sequential calls returned `200` (60 of 60). Four parallel calls returned `500` about 80% of the time, and right after that burst the whole API was down for about 2.5 minutes. Every page load in the browser sends 3 to 4 calls at once and triggered the same failure. Check the database connection limit / pooling for the serverless functions first. |
| B4 login limit | Still there. The 10th successful login within a minute returned `429`; it cleared after about 15 to 60 seconds. Successful logins count toward the limit. No `Retry-After` header. |
| B5 CORS for port 4000 | Not fixed. `OPTIONS` with `Origin: http://localhost:4000` still has no `access-control-allow-origin`. |
| B3, B6 | Not changed (still `500` on refresh when the database is down; cookie still `SameSite=Lax`). |

What worked on the frontend against the real backend in this pass: wrong password shows "Incorrect email or password.", correct login
redirects to the dashboard, the session is restored after a reload, a failed data call shows "Could not load this" with Try again,
and register / forgot / reset password have no overflow at 768 px. The full page-by-page pass could not be repeated on the real backend
because it was failing again within minutes of becoming stable.

## Real backend checks (contract and writes)

With the backend healthy (09:50 UTC) every read endpoint the frontend calls returned `200` with the same fields the frontend types
expect (checked: `/auth/me`, `/projects`, `/dashboard/summary`, `/dashboard/my-tasks`, `/notifications`, `/users/search`,
`/projects/:id`, `/board`, `/tasks`, `/members`, `/labels`, `/activity`). Only harmless differences: activity items have no `actorId`,
notifications have an extra `userId`.

Writes also worked on the real backend: create project, create / get / edit / delete task, create / list comments,
move task (`{status, afterId}`), create label, archive, restore, rename project, mark all notifications read, delete project.
Note `PATCH .../move` rejects a `position` field (`property position should not exist`); the frontend sends `afterId`, which is correct.

In the browser against the real backend: login, session restore after a full reload (`/auth/refresh` 200 then `/auth/me` 200),
and the My tasks card all worked. The dashboard summary part could not load because of B8.

## Frontend fixes done while testing

- API calls go straight to `NEXT_PUBLIC_API_URL` (the only API setting; a temporary Next proxy was removed again).
- `.env.local` had `NEXT_PUBLIC_API_URL` without `/api/v1`, so every call returned 404. Now `/api/v1`.
- `/auth/refresh` is retried 2 times on `5xx` or network errors. Before, one `500` logged the user out.
- After a failed refresh the app no longer sends a pointless `/auth/me` and a second refresh.
- Dashboard showed a blank page while the summary was loading (no skeleton). It now shows the skeleton.
- Stacked avatars (project cards, project header) hid each other's initials. They are now opaque and overlap less.
- Dev and start scripts run on port 4000.
- `/favicon.ico` returned 500 in dev because `src/app/favicon.ico` and `public/favicon.ico` both existed. The duplicate was removed.
- A signed-in user opening `/register` now goes to the dashboard (like `/login`).
- After an explicit sign-out the app goes to plain `/login` (it used to add `?next=<page you were on>`).

## How the frontend was tested

The deployed backend was down or returning random 500s for most of the session (B1, B2), so the page checks below used a
local copy of the old mock API behind the same `/api/v1` proxy (same response shapes as `openapi.json`). The real backend
was used for the login, refresh and reload checks.

| Area | 375 px | 768 px | 1280+ px | Clicks tested |
| ---- | ------ | ------ | -------- | ------------- |
| Login, register, forgot / reset password, 404 | ok | not run | ok | demo chips, validation messages, sign in, sign out, `?next=` redirect |
| Dashboard | ok | ok | ok | skeleton, error + "Try again", row links |
| Projects | ok | ok | ok | All / Active / Archived, grid / list, New project dialog (validation + create) |
| Board | ok | ok | ok | New task, task drawer (edit, comment, delete + confirm), drag a card to another column |
| List | ok | ok | ok | search, status / overdue filters, clear all, inline status change |
| Members | ok | ok | ok | change role, add member search + add |
| Activity | ok | ok | ok | feed shows the changes made while testing |
| Settings | ok | ok | ok | rename + save, add label, archive / restore, member sees "only owners and admins" |
| Notifications, bell | ok | ok | ok | open item, mark all read, bell dropdown |
| Account | ok | ok | ok | wrong current password error, Light / Dark / System theme, sign out |
| Header, sidebar | ok | ok | ok | Ctrl K palette, mobile menu, mobile bottom-sheet dialog, sidebar collapse |

No horizontal overflow was found at 375 or 768 px on any page.

## Not confirmed

- Right after closing a dialog or drawer, the next click sometimes did nothing. It did not reproduce reliably and looks
  like an artifact of the background test browser (animations and timers are throttled there), so no code was changed.
- The Settings, Members, Board and List pages were only clicked through on the mock API (same shapes as the real one, see above),
  not on the real backend, because the real backend was down for most of the session.
