import { fail, userIdFromToken, type MockRoute } from './helpers';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { memberRoutes } from './routes/members';
import { taskRoutes } from './routes/tasks';
import { dashboardRoutes } from './routes/dashboard';

/** Every mock endpoint. The first matching route wins. */
const ROUTES: MockRoute[] = [...authRoutes, ...projectRoutes, ...memberRoutes, ...taskRoutes, ...dashboardRoutes];

/** Fake network delay so loading states are visible. */
const DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 300;

/** Match `/projects/prj_1/tasks` against `/projects/:projectId/tasks`. Returns the params or null. */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    else if (patternParts[i] !== pathParts[i]) return null;
  }
  return params;
}

/** Read the JSON body, or an empty object when there is none. */
async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/** Handle one request to the fake API. `path` is everything after `/api/mock`. */
export async function handleMockRequest(req: Request, path: string): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  for (const route of ROUTES) {
    if (route.method !== req.method) continue;
    const params = matchPath(route.path, path);
    if (!params) continue;

    const userId = route.isPublic ? '' : userIdFromToken(req);
    if (userId === null) return fail(401, 'UNAUTHORIZED', 'Please sign in');

    const query = new URL(req.url).searchParams;
    const body = await readJson(req);
    return route.handler({ req, params, query, body, userId });
  }

  return fail(404, 'ROUTE_NOT_FOUND', `No mock for ${req.method} ${path}`);
}
