# Backend issues

Open issues found while testing TaskForge against the deployed backend
(`https://task-forge-server-theta.vercel.app/api/v1`). Last checked 2026-10-12, 11:40 UTC.

Severity: **High** blocks normal use, **Medium** breaks a flow sometimes, **Low** polish.

Note: the local backend (`http://localhost:4040/api/v1`) does not have B1, B2, B3, B4 or B5 (its CORS already allows `http://localhost:4000`),
so these look like problems of the deployed environment or of code that is not deployed yet. Redeploy the current backend first, then re-check.

## B1. Backend goes down and returns 500 on every endpoint — High

- `GET /health` returns `503` with `{"status":"down","latency":~600}` for minutes at a time, then recovers.
- While down, `POST /auth/login`, `POST /auth/refresh`, `GET /dashboard/*`, `GET /notifications`, `GET /projects` return
  `500 {"code":"INTERNAL","message":"Internal server error."}`. Seen several times on 2026-10-12 (for example 08:06, 08:26–08:32,
  08:35, 10:32–10:44, 10:47 UTC); 10 logins in a row gave 10 × `500`.
- Looks like a lost or exhausted database connection on the serverless deployment. Check the DB connection string,
  connection pooling for Vercel, and the function logs.
- Effect: login shows "Internal server error.", and a page reload logs the user out (the refresh call fails).

## B2. Failures under load (parallel requests) — High

- Sequential calls were `200` (60 of 60), but 4 parallel calls with a valid token returned `500` about 80% of the time, and right after
  that burst the whole API was down for about 2.5 minutes. A normal page load sends 3 to 4 calls at once and triggers the same failure.
- Likely too many database connections opened at once (one per request). Reuse one DB client per function instance and add pooling.

## B3. `GET /dashboard/summary` returns 500 for every user — High

- Returned `200` at 09:50 UTC. After a test created and then **deleted a project** (09:51–09:52 UTC), it returned `500 INTERNAL`
  on every call for `owner@`, `admin@` and `member@demo.dev` (12 of 12), while all other endpoints returned `200`.
  It later returned `200` again (5 in a row), then `500` again together with the other endpoints (see B1, B2).
- Not proven: data left behind by a project delete (activity or notification rows that still point to the deleted project) may break the
  summary's `recentActivity` / `projectName` lookup. Check the function logs, cascade project delete, and make the summary skip rows
  whose project is missing. The demo data may need a reseed.
- Repro: login, `POST /projects`, `POST /projects/:id/tasks`, `DELETE /projects/:id`, then `GET /dashboard/summary`.
- Effect: the dashboard cards, charts and recent activity stay on the loading skeleton, then show "Could not load this".

## B4. `/health` says `operational` while data endpoints return 500 — Medium

- At 10:32–10:44 UTC `GET /health` returned `operational` and login worked, but `/dashboard/summary`, `/dashboard/my-tasks`,
  `/projects` and `/projects/:id/board` all returned `500` on 30+ calls in a row. `/health` does not cover the data path.
- Make `/health` run a small real query (for example `SELECT 1` plus one read on a main table) and return `503` if it fails.

## B5. CORS: no `access-control-allow-origin` on the deployed backend — High

- `OPTIONS` and `POST /auth/login` with `Origin: http://localhost:4000` return `204` / `200` but **no** `access-control-allow-origin`
  (only `access-control-allow-credentials: true`; same for `http://localhost:3000`). The browser blocks every direct call.
- The frontend calls `NEXT_PUBLIC_API_URL` directly (fixed port 4000) and has no proxy, so this must be fixed on the backend.
- Send `Access-Control-Allow-Origin: <the request origin>` (not `*`) for the allowed origins with `Access-Control-Allow-Credentials: true`,
  on both the preflight and the real response. Put the allowed origins in an env variable and include `http://localhost:4000`
  and the production frontend URL. The local backend already does this.

## B6. Refresh cookie is `SameSite=Lax` — High for a cross-site frontend

- Cookie: `tf_refresh; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`.
- With the frontend on another site than the API (for example `localhost` calling `vercel.app`), the browser does not send a `Lax` cookie
  on `fetch`, so `POST /auth/refresh` returns `401 REFRESH_INVALID` and every page reload logs the user out.
- Use `SameSite=None; Secure`, or serve the frontend and API on the same site (for example `app.example.com` and `api.example.com`
  with `Domain=.example.com`).

## B7. `POST /auth/refresh` returns 500 instead of 503 when the database is down — Medium

- A `401 REFRESH_INVALID` should only mean the cookie is invalid or expired. A database failure should return `503` (retry later).
  The frontend logs the user out on `401` but retries on `5xx`, so the status code matters.

## B8. Login rate limit is strict and slow to answer — Medium

- On the deployed backend the 10th **successful** login within about a minute returned `429`; it cleared after 15 to 60 seconds.
  The first `429` took 5.4 s to answer, later ones about 0.5 s. No `Retry-After` header on the deployed backend.
- Failed requests (the `500`s from B1) also count, so a tester is locked out quickly.
- Check the limit (for example 5 per minute per IP), do not count successful logins, and return `Retry-After`
  (the local backend already exposes `Retry-After`; it hit no limit in 14 logins).
