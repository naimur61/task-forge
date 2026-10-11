import { describe, expect, it } from 'vitest';
import { changePasswordSchema } from '@/components/common/forms/schemas/account';
import { projectSchema } from '@/components/common/forms/schemas/project';
import { emptyTaskForm, formToTaskInput, taskSchema, taskToForm } from '@/components/common/forms/schemas/task';
import type { Task } from '@/types/task';
import type { UserSummary } from '@/types/common';

/** Minimal Task for form round-trip tests. */
const sampleTask: Task = {
  id: 'tsk_sample',
  projectId: 'prj_sample',
  title: 'Ship the report',
  description: 'End of day.',
  status: 'TODO',
  priority: 'HIGH',
  position: 1000,
  dueDate: '2026-11-15T17:00:00.000Z',
  assignee: { id: 'usr_sample', name: 'Ava Chen', email: 'ava@demo.dev', avatarUrl: null } satisfies UserSummary,
  creator: { id: 'usr_owner', name: 'Ava Chen', email: 'ava@demo.dev', avatarUrl: null } satisfies UserSummary,
  labels: [{ id: 'lbl_feature', projectId: 'prj_sample', name: 'Feature', color: '#6366f1' }],
  commentCount: 0,
  completedAt: null,
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-02T09:00:00.000Z',
};

describe('taskSchema', () => {
  it('accepts a minimal task', () => {
    expect(taskSchema.safeParse({ ...emptyTaskForm(), title: 'Write docs' }).success).toBe(true);
  });

  it('requires a title and limits its length', () => {
    expect(taskSchema.safeParse(emptyTaskForm()).success).toBe(false);
    expect(taskSchema.safeParse({ ...emptyTaskForm(), title: 'x'.repeat(201) }).success).toBe(false);
  });

  it('rejects unknown status values', () => {
    expect(taskSchema.safeParse({ ...emptyTaskForm(), title: 'A', status: 'LATER' }).success).toBe(false);
  });
});

describe('task form converters', () => {
  it('turns empty strings into nulls for the API', () => {
    const input = formToTaskInput({ ...emptyTaskForm(), title: '  Ship it  ' });
    expect(input).toMatchObject({ title: 'Ship it', description: null, assigneeId: null, dueDate: null });
  });

  it('round-trips a task through the form', () => {
    const form = taskToForm(sampleTask);
    expect(form.title).toBe(sampleTask.title);
    expect(form.assigneeId).toBe(sampleTask.assignee?.id);
    expect(form.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formToTaskInput(form).labelIds).toEqual(sampleTask.labels.map((l) => l.id));
  });
});

describe('projectSchema', () => {
  it('needs a name of at least 2 characters', () => {
    expect(projectSchema.safeParse({ name: 'A', description: '' }).success).toBe(false);
    expect(projectSchema.safeParse({ name: 'API', description: '' }).success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  it('requires matching passwords with a letter and a number', () => {
    const base = { currentPassword: 'old', newPassword: 'abcdefg1', confirmPassword: 'abcdefg1' };
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
    expect(changePasswordSchema.safeParse({ ...base, confirmPassword: 'nope' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...base, newPassword: 'abcdefgh', confirmPassword: 'abcdefgh' }).success).toBe(false);
  });
});
