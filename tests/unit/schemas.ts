import { describe, expect, it } from 'vitest';
import { changePasswordSchema } from '@/components/common/forms/schemas/account';
import { projectSchema } from '@/components/common/forms/schemas/project';
import { emptyTaskForm, formToTaskInput, taskSchema, taskToForm } from '@/components/common/forms/schemas/task';
import { fixtureTask } from '@/mocks/fixtures/tasks';

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
    const task = fixtureTask(1);
    const form = taskToForm(task);
    expect(form.title).toBe(task.title);
    expect(form.assigneeId).toBe(task.assignee?.id);
    expect(form.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formToTaskInput(form).labelIds).toEqual(task.labels.map((l) => l.id));
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
