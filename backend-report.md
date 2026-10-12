# Backend report

Issues found while testing the TaskForge frontend against the deployed backend
(`https://task-forge-server-theta.vercel.app/api/v1`). Frontend problems were fixed in
the frontend; everything below needs a backend fix.

Last updated: 2026-10-12.

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

### B2. Random 500 / 503 even when `/health` says operational — High

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

- 8 failed logins within about 10 seconds were followed by `429` for the next attempts.
  The first `429` took 5.4 s to answer, the following ones about 0.5 s.
- With the `500`s from B1 each retry counts toward the limit, so a tester gets locked out quickly.
- Please check the limit (for example 5 per minute per IP) and that **successful** logins do not count. Consider returning
  `Retry-After` so the UI can show a wait time.

### B5. CORS only allows `http://localhost:3000` — Low

- `OPTIONS /auth/login` with `Origin: http://localhost:4000`, `:3100` or `:5173` returns no `access-control-allow-origin`,
  so the browser blocks the call (the extension shows it as a 503).
- The frontend now calls the API through a Next.js proxy (`/api/v1` → backend), so this no longer blocks us.
  Still, make the allowed origins a config list (env variable) instead of one fixed value.

### B6. Refresh cookie is cross-site unfriendly — Low (for production)

- Cookie: `tf_refresh; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`.
- With the frontend on one site and the API on `vercel.app`, the browser does not send a `SameSite=Lax` cookie on `fetch`,
  so `/auth/refresh` returned `401 REFRESH_INVALID` and the user was logged out after the 15 minute access token ended.
- Fixed for now with the proxy (cookie becomes first-party). For production either serve the frontend and API on the same
  site (for example `app.example.com` and `api.example.com` with `Domain=.example.com`), or use `SameSite=None; Secure`.

### B7. Notification `link` does not say which task — Low

- `GET /notifications` returns `link` as a project route only (for example `/projects/prj_web/list`).
  Clicking "Marcus assigned you Pricing page copy review" opens the project, not that task.
- The frontend already opens a task from `?task=<taskId>`, so if the backend returns
  `/projects/prj_web/board?task=tsk_0035` for task notifications, the click will open the task drawer directly.

## Frontend fixes done while testing

- API calls now go through a Next.js rewrite (`/api/v1` → `BACKEND_URL`): no CORS, refresh cookie is first-party.
- `.env.local` had `NEXT_PUBLIC_API_URL` without `/api/v1`, so every call returned 404. Now `/api/v1`.
- `/auth/refresh` is retried 2 times on `5xx` or network errors. Before, one `500` logged the user out.
- After a failed refresh the app no longer sends a pointless `/auth/me` and a second refresh.
- Dashboard showed a blank page while the summary was loading (no skeleton). It now shows the skeleton.
- Stacked avatars (project cards, project header) hid each other's initials. They are now opaque and overlap less.
- Dev and start scripts run on port 4000.

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
- Reload keeping the user signed in was seen working once against the real backend (`/auth/refresh` returned 200).
  Re-check it when B1 and B2 are fixed.
