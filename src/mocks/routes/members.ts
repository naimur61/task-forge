import { can } from '@/lib/permissions';
import type { MemberRole } from '@/types/project';
import { db, newId, now } from '../db';
import { fail, findMembership, forbidden, invalid, logActivity, noContent, notFound, ok, toMember, type MockRoute } from '../helpers';

const ROLES_TO_GIVE: MemberRole[] = ['ADMIN', 'MEMBER'];

export const memberRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/projects/:projectId/members',
    handler: ({ userId, params }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      const order: Record<MemberRole, number> = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
      const list = db.members
        .filter((m) => m.projectId === params.projectId)
        .sort((a, b) => order[a.role] - order[b.role] || a.joinedAt.localeCompare(b.joinedAt));
      return ok(list.map(toMember));
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/members',
    handler: ({ userId, params, body }) => {
      const me = findMembership(params.projectId, userId);
      if (!me) return notFound('Project');
      if (!can(me.role, 'member.add')) return forbidden();
      const role = (body.role ?? 'MEMBER') as MemberRole;
      if (!ROLES_TO_GIVE.includes(role)) return invalid('role', 'Role must be ADMIN or MEMBER');
      // Admins may only add plain members.
      if (me.role === 'ADMIN' && role !== 'MEMBER') return forbidden();
      const user = db.users.find((u) => u.id === body.userId);
      if (!user) return invalid('userId', 'User not found');
      if (findMembership(params.projectId, user.id)) return fail(409, 'ALREADY_MEMBER', `${user.name} is already a member`);
      const member = { id: newId('mbr'), projectId: params.projectId, userId: user.id, role, joinedAt: now() };
      db.members.push(member);
      logActivity(params.projectId, userId, 'member.added', `added ${user.name} as ${role.toLowerCase()}`);
      const project = db.projects.find((p) => p.id === params.projectId);
      db.notifications.push({
        id: newId('ntf'),
        userId: user.id,
        type: 'member.added',
        message: `You were added to ${project?.name ?? 'a project'}`,
        link: `/projects/${params.projectId}/board`,
        readAt: null,
        createdAt: now(),
      });
      return ok(toMember(member), undefined, 201);
    },
  },
  {
    method: 'PATCH',
    path: '/projects/:projectId/members/:userId',
    handler: ({ userId, params, body }) => {
      const me = findMembership(params.projectId, userId);
      if (!me) return notFound('Project');
      if (!can(me.role, 'member.changeRole')) return forbidden();
      const target = findMembership(params.projectId, params.userId);
      if (!target) return notFound('Member');
      if (target.role === 'OWNER') return fail(422, 'OWNER_ROLE_LOCKED', 'Transfer ownership to change the owner role');
      if (!ROLES_TO_GIVE.includes(body.role)) return invalid('role', 'Role must be ADMIN or MEMBER');
      target.role = body.role;
      logActivity(params.projectId, userId, 'member.role_changed', `changed a member's role to ${String(body.role).toLowerCase()}`);
      return ok(toMember(target));
    },
  },
  {
    method: 'DELETE',
    path: '/projects/:projectId/members/:userId',
    handler: ({ userId, params }) => {
      const me = findMembership(params.projectId, userId);
      if (!me) return notFound('Project');
      const target = findMembership(params.projectId, params.userId);
      if (!target) return notFound('Member');
      const isLeaving = target.userId === userId;
      if (target.role === 'OWNER') return fail(422, 'OWNER_CANNOT_LEAVE', 'Transfer ownership before leaving the project');
      if (!isLeaving) {
        if (!can(me.role, 'member.remove')) return forbidden();
        // Admins may only remove plain members.
        if (me.role === 'ADMIN' && target.role !== 'MEMBER') return forbidden();
      }
      db.members = db.members.filter((m) => m.id !== target.id);
      // Removed members lose their task assignments.
      db.tasks.forEach((t) => {
        if (t.projectId === params.projectId && t.assigneeId === target.userId) t.assigneeId = null;
      });
      logActivity(params.projectId, userId, 'member.removed', isLeaving ? 'left the project' : 'removed a member');
      return noContent();
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/transfer-ownership',
    handler: ({ userId, params, body }) => {
      const me = findMembership(params.projectId, userId);
      if (!me) return notFound('Project');
      if (!can(me.role, 'project.transfer')) return forbidden();
      const target = findMembership(params.projectId, body.userId);
      if (!target || target.userId === userId) return invalid('userId', 'Pick another member of this project');
      const project = db.projects.find((p) => p.id === params.projectId)!;
      me.role = 'ADMIN';
      target.role = 'OWNER';
      project.ownerId = target.userId;
      logActivity(params.projectId, userId, 'project.transferred', 'transferred ownership');
      return ok(toMember(target));
    },
  },
];
