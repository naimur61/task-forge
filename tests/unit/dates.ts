import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isTaskOverdue } from '@/config/task';
import { formatDue } from '@/lib/date-utils/due';

describe('formatDue()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('uses friendly words near today', () => {
    expect(formatDue('2026-10-10T17:00:00')).toBe('Today');
    expect(formatDue('2026-10-11T17:00:00')).toBe('Tomorrow');
    expect(formatDue('2026-10-09T17:00:00')).toBe('Yesterday');
  });

  it('counts overdue days and shows dates further out', () => {
    expect(formatDue('2026-10-07T17:00:00')).toBe('3d overdue');
    expect(formatDue('2026-10-20T17:00:00')).toBe('Oct 20');
  });

  it('never says overdue for finished tasks', () => {
    expect(formatDue('2026-10-07T17:00:00', true)).toBe('Oct 7');
  });

  it('marks only unfinished past-due tasks as overdue', () => {
    expect(isTaskOverdue({ dueDate: '2026-10-01T00:00:00', status: 'TODO' })).toBe(true);
    expect(isTaskOverdue({ dueDate: '2026-10-01T00:00:00', status: 'DONE' })).toBe(false);
    expect(isTaskOverdue({ dueDate: null, status: 'TODO' })).toBe(false);
  });
});
