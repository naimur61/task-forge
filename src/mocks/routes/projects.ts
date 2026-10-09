import { can } from '@/lib/permissions';
import { db, newId, now, type ProjectRow } from '../db';
import {
  byNewest,
  findMembership,
  forbidden,
  invalid,
  logActivity,
  noContent,
  notFound,
  ok,
  paginate,
  toActivity,
  toProject,
  toUserSummary,
  type MockRoute,
} from '../helpers';

/** Check name/description rules. Returns an error response or null. */
function validateProject(body: Record<string, any>, partial: boolean): Response | null {
  const name = body.name === undefined ? undefined : String(body.name).trim();
  if (!partial || name !== undefined) {
    if (!name || name.length < 2) return invalid('name', 'Name must be at least 2 characters');
    if (name.length > 100) return invalid('name', 'Name must be at most 100 characters');
  }
  if (body.description && String(body.description).length > 1000) {
    return invalid('description', 'Description must be at most 1000 characters');
  }
  return null;
}

export const projectRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/projects',
    handler: ({ userId, query }) => {
      const search = query.get('search')?.toLowerCase() ?? '';
      const status = query.get('status');
      const list = db.projects
        .filter((p) => findMembership(p.id, userId))
        .filter((p) => !status || p.status === status)
        .filter((p) => !search || p.name.toLowerCase().includes(search))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const page = paginate(list, query);
      return ok(page.data.map((p) => toProject(p, userId)), page.meta);
    },
  },
  {
    method: 'POST',
    path: '/projects',
    handler: ({ userId, body }) => {
      const error = validateProject(body, false);
      if (error) return error;
      const project: ProjectRow = {
        id: newId('prj'),
        name: String(body.name).trim(),
        description: body.description ? String(body.description).trim() : null,
        status: 'ACTIVE',
        ownerId: userId,
        createdAt: now(),
        updatedAt: now(),
      };
      db.projects.push(project);
      db.members.push({ id: newId('mbr'), projectId: project.id, userId, role: 'OWNER', joinedAt: now() });
      logActivity(project.id, userId, 'project.created', `created the project`);
      return ok(toProject(project, userId), undefined, 201);
    },
  },
  {
    method: 'GET',
    path: '/projects/:projectId',
    handler: ({ userId, params }) => {
      const project = db.projects.find((p) => p.id === params.projectId);
      if (!project || !findMembership(project.id, userId)) return notFound('Project');
      return ok(toProject(project, userId));
    },
  },
  {
    method: 'PATCH',
    path: '/projects/:projectId',
    handler: ({ userId, params, body }) => {
      const project = db.projects.find((p) => p.id === params.projectId);
      const member = project && findMembership(project.id, userId);
      if (!project || !member) return notFound('Project');
      if (!can(member.role, 'project.update')) return forbidden();
      const error = validateProject(body, true);
      if (error) return error;
      if (body.name !== undefined) project.name = String(body.name).trim();
      if (body.description !== undefined) project.description = body.description ? String(body.description).trim() : null;
      project.updatedAt = now();
      logActivity(project.id, userId, 'project.updated', 'updated the project details');
      return ok(toProject(project, userId));
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/archive',
    handler: ({ userId, params }) => {
      const project = db.projects.find((p) => p.id === params.projectId);
      const member = project && findMembership(project.id, userId);
      if (!project || !member) return notFound('Project');
      if (!can(member.role, 'project.archive')) return forbidden();
      project.status = 'ARCHIVED';
      project.updatedAt = now();
      logActivity(project.id, userId, 'project.archived', 'archived the project');
      return ok(toProject(project, userId));
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/restore',
    handler: ({ userId, params }) => {
      const project = db.projects.find((p) => p.id === params.projectId);
      const member = project && findMembership(project.id, userId);
      if (!project || !member) return notFound('Project');
      if (!can(member.role, 'project.archive')) return forbidden();
      project.status = 'ACTIVE';
      project.updatedAt = now();
      logActivity(project.id, userId, 'project.restored', 'restored the project');
      return ok(toProject(project, userId));
    },
  },
  {
    method: 'DELETE',
    path: '/projects/:projectId',
    handler: ({ userId, params }) => {
      const project = db.projects.find((p) => p.id === params.projectId);
      const member = project && findMembership(project.id, userId);
      if (!project || !member) return notFound('Project');
      if (!can(member.role, 'project.delete')) return forbidden();
      db.projects = db.projects.filter((p) => p.id !== project.id);
      db.members = db.members.filter((m) => m.projectId !== project.id);
      db.tasks = db.tasks.filter((t) => t.projectId !== project.id);
      db.activity = db.activity.filter((a) => a.projectId !== project.id);
      return noContent();
    },
  },
  {
    method: 'GET',
    path: '/users/search',
    handler: ({ query }) => {
      const q = query.get('q')?.trim().toLowerCase() ?? '';
      if (q.length < 2) return ok([]);
      const users = db.users
        .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        .slice(0, 10)
        .map((u) => toUserSummary(u.id));
      return ok(users);
    },
  },
  {
    method: 'GET',
    path: '/projects/:projectId/activity',
    handler: ({ userId, params, query }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      const list = db.activity.filter((a) => a.projectId === params.projectId).sort(byNewest);
      const page = paginate(list, query);
      return ok(page.data.map(toActivity), page.meta);
    },
  },
];
