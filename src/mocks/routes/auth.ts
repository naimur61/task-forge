import { db, newId, now, type UserRow } from '../db';
import {
  fail,
  invalid,
  json,
  makeAccessToken,
  noContent,
  refreshCookie,
  userIdFromRefreshCookie,
  type MockRoute,
} from '../helpers';

/** User object the auth endpoints return (matches `src/auth/jwt/types.ts`). */
const toAuthUser = (user: UserRow) => ({ id: user.id, name: user.name, email: user.email, avatar: user.avatarUrl });

/** `{ user, accessToken }` plus the refresh cookie. */
function sessionResponse(user: UserRow, status = 200): Response {
  const res = json({ user: toAuthUser(user), accessToken: makeAccessToken(user.id) }, status);
  res.headers.set('Set-Cookie', refreshCookie(user.id));
  return res;
}

export const authRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/auth/login',
    isPublic: true,
    handler: ({ body }) => {
      const user = db.users.find((u) => u.email.toLowerCase() === String(body.email ?? '').toLowerCase());
      if (!user || user.password !== body.password) return fail(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
      return sessionResponse(user);
    },
  },
  {
    method: 'POST',
    path: '/auth/register',
    isPublic: true,
    handler: ({ body }) => {
      const email = String(body.email ?? '').trim().toLowerCase();
      if (String(body.name ?? '').trim().length < 2) return invalid('name', 'Name must be at least 2 characters');
      if (!email.includes('@')) return invalid('email', 'Enter a valid email address');
      if (String(body.password ?? '').length < 8) return invalid('password', 'Use at least 8 characters');
      if (db.users.some((u) => u.email === email)) return fail(409, 'EMAIL_TAKEN', 'An account with this email already exists');
      const user: UserRow = { id: newId('usr'), name: body.name.trim(), email, password: body.password, avatarUrl: null, createdAt: now() };
      db.users.push(user);
      return sessionResponse(user, 201);
    },
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    isPublic: true,
    handler: ({ req }) => {
      const userId = userIdFromRefreshCookie(req);
      if (!userId) return fail(401, 'REFRESH_INVALID', 'Session expired');
      const res = json({ accessToken: makeAccessToken(userId) });
      res.headers.set('Set-Cookie', refreshCookie(userId));
      return res;
    },
  },
  {
    method: 'POST',
    path: '/auth/logout',
    isPublic: true,
    handler: () => {
      const res = noContent();
      res.headers.set('Set-Cookie', refreshCookie(null));
      return res;
    },
  },
  {
    method: 'GET',
    path: '/auth/me',
    handler: ({ userId }) => json(toAuthUser(db.users.find((u) => u.id === userId)!)),
  },
  {
    method: 'PUT',
    path: '/auth/profile',
    handler: ({ userId, body }) => {
      const user = db.users.find((u) => u.id === userId)!;
      if (body.name !== undefined) {
        if (String(body.name).trim().length < 2) return invalid('name', 'Name must be at least 2 characters');
        user.name = String(body.name).trim();
      }
      if (body.avatar !== undefined) user.avatarUrl = body.avatar || null;
      return json(toAuthUser(user));
    },
  },
  {
    method: 'POST',
    path: '/auth/change-password',
    handler: ({ userId, body }) => {
      const user = db.users.find((u) => u.id === userId)!;
      if (user.password !== body.currentPassword) return invalid('currentPassword', 'Current password is incorrect');
      if (String(body.newPassword ?? '').length < 8) return invalid('newPassword', 'Use at least 8 characters');
      user.password = body.newPassword;
      return noContent();
    },
  },
  { method: 'POST', path: '/auth/forgot-password', isPublic: true, handler: () => noContent() },
  { method: 'POST', path: '/auth/reset-password', isPublic: true, handler: () => noContent() },
];
