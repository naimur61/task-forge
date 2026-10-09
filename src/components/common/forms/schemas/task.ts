import { format } from 'date-fns';
import { z } from 'zod';
import type { Task, TaskInput } from '@/types/task';

/** Create/edit task form. Mirrors the API rules. Empty strings mean "not set". */
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  /** Member user id, or '' for unassigned. */
  assigneeId: z.string(),
  /** `YYYY-MM-DD`, or '' for no due date. */
  dueDate: z.string(),
  labelIds: z.array(z.string()),
});

export type TaskFormData = z.infer<typeof taskSchema>;

/** Empty form for a new task. */
export const emptyTaskForm = (status: TaskFormData['status'] = 'TODO'): TaskFormData => ({
  title: '',
  description: '',
  status,
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
  labelIds: [],
});

/** Fill the form from an existing task. */
export const taskToForm = (task: Task): TaskFormData => ({
  title: task.title,
  description: task.description ?? '',
  status: task.status,
  priority: task.priority,
  assigneeId: task.assignee?.id ?? '',
  dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
  labelIds: task.labels.map((label) => label.id),
});

/** Turn form values into the API body. The due date is set to the end of the working day (17:00 local). */
export const formToTaskInput = (values: TaskFormData): TaskInput => ({
  title: values.title.trim(),
  description: values.description.trim() || null,
  status: values.status,
  priority: values.priority,
  assigneeId: values.assigneeId || null,
  dueDate: values.dueDate ? new Date(`${values.dueDate}T17:00:00`).toISOString() : null,
  labelIds: values.labelIds,
});
