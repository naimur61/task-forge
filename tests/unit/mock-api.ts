import { beforeAll, describe, expect, it } from 'vitest';
import { handleMockRequest } from '@/mocks/handle-request';

const BASE = 'http://test.local/api/mock';

/** Call the demo API like the browser would. */
async function call(method: string, path: string, token?: string, body?: unknown) {
  const req = new Request(`${BASE}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const res = await handleMockRequest(req, path.split('?')[0]);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers };
}

/** Sign in a seeded demo user and return the access token. */
async function login(email: string) {
  const res = await call('POST', '/auth/login', undefined, { email, password: 'Demo1234!' });
  return res.body.accessToken as string;
}

let owner = '';
let member = '';

beforeAll(async () => {
  owner = await login('owner@demo.dev');
  member = await login('member@demo.dev');
});

describe('auth', () => {
  it('rejects a wrong password with 401', async () => {
    const res = await call('POST', '/auth/login', undefined, { email: 'owner@demo.dev', password: 'nope' });
    expect(res.status).toBe(401);
  });

  it('sets an httpOnly refresh cookie on login', async () => {
    const res = await call('POST', '/auth/login', undefined, { email: 'owner@demo.dev', password: 'Demo1234!' });
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
  });

  it('needs a token for protected routes', async () => {
    expect((await call('GET', '/projects')).status).toBe(401);
  });
});

describe('tasks list', () => {
  it('filters by status and paginates', async () => {
    const res = await call('GET', '/projects/prj_web/tasks?status=TODO&limit=2&page=1', owner);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((t: { status: string }) => t.status === 'TODO')).toBe(true);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 2, hasPrev: false });
  });

  it('sorts by priority, highest first', async () => {
    const res = await call('GET', '/projects/prj_web/tasks?sortBy=priority&order=desc&limit=100', owner);
    const order = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const ranks = res.body.data.map((t: { priority: string }) => order.indexOf(t.priority));
    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
  });
});

describe('permissions', () => {
  it('hides projects from non-members with 404', async () => {
    expect((await call('GET', '/projects/prj_api', member)).status).toBe(404);
  });

  it('forbids a member from archiving a project', async () => {
    expect((await call('POST', '/projects/prj_web/archive', member)).status).toBe(403);
  });

  it('rejects an assignee who is not a member', async () => {
    const res = await call('POST', '/projects/prj_web/tasks', owner, { title: 'X', assigneeId: 'usr_dev3' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('ASSIGNEE_NOT_MEMBER');
  });

  it('returns field details for validation errors', async () => {
    const res = await call('POST', '/projects/prj_web/tasks', owner, { title: '' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('title');
  });
});
