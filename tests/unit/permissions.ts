import { describe, expect, it } from 'vitest';
import { can, canDeleteTask, canEditTask } from '@/lib/permissions';

describe('can()', () => {
  it('lets only the owner archive, delete and transfer', () => {
    expect(can('OWNER', 'project.delete')).toBe(true);
    expect(can('ADMIN', 'project.delete')).toBe(false);
    expect(can('MEMBER', 'project.archive')).toBe(false);
    expect(can('ADMIN', 'project.transfer')).toBe(false);
  });

  it('lets owners and admins edit the project and add members', () => {
    expect(can('OWNER', 'project.update')).toBe(true);
    expect(can('ADMIN', 'member.add')).toBe(true);
    expect(can('MEMBER', 'member.add')).toBe(false);
  });

  it('lets everyone create tasks, but the owner cannot leave', () => {
    expect(can('MEMBER', 'task.create')).toBe(true);
    expect(can('OWNER', 'project.leave')).toBe(false);
    expect(can('MEMBER', 'project.leave')).toBe(true);
  });

  it('denies everything without a role', () => {
    expect(can(null, 'task.create')).toBe(false);
    expect(can(undefined, 'project.update')).toBe(false);
  });
});

describe('canEditTask() and canDeleteTask()', () => {
  const task = { creatorId: 'u_creator', assigneeId: 'u_assignee' };

  it('lets admins edit and delete any task', () => {
    expect(canEditTask('ADMIN', 'someone', task)).toBe(true);
    expect(canDeleteTask('ADMIN', 'someone', task)).toBe(true);
  });

  it('lets a member edit tasks they created or are assigned to', () => {
    expect(canEditTask('MEMBER', 'u_creator', task)).toBe(true);
    expect(canEditTask('MEMBER', 'u_assignee', task)).toBe(true);
    expect(canEditTask('MEMBER', 'stranger', task)).toBe(false);
  });

  it('lets a member delete only tasks they created', () => {
    expect(canDeleteTask('MEMBER', 'u_creator', task)).toBe(true);
    expect(canDeleteTask('MEMBER', 'u_assignee', task)).toBe(false);
  });
});
