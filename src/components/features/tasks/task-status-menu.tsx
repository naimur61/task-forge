'use client';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TASK_STATUSES } from '@/config/task';
import type { TaskStatus } from '@/types/task';
import { StatusBadge } from './task-badges';

interface TaskStatusMenuProps {
  status: TaskStatus;
  /** When false, shows a plain badge (no permission to change). */
  canChange: boolean;
  onChange: (status: TaskStatus) => void;
}

/** Status badge that opens a menu to change the status in one click. */
export function TaskStatusMenu({ status, canChange, onChange }: TaskStatusMenuProps) {
  if (!canChange) return <StatusBadge status={status} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center gap-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Change status"
        // Don't open the task when clicking the menu.
        onClick={(e) => e.stopPropagation()}
      >
        <StatusBadge status={status} className="group-hover:border-primary/40" />
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuRadioGroup value={status} onValueChange={(value) => onChange(value as TaskStatus)}>
          {TASK_STATUSES.map((s) => (
            <DropdownMenuRadioItem key={s.value} value={s.value}>
              <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
