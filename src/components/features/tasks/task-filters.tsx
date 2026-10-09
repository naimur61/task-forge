'use client';

import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronDown, X } from 'lucide-react';
import { SearchInput } from '@/components/common/search-input/search-input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TASK_PRIORITIES, TASK_SORT_OPTIONS, TASK_STATUSES } from '@/config/task';
import { cn } from '@/lib/utils';
import type { Member } from '@/types/member';
import type { TaskFilters as Filters, TaskPriority, TaskSortBy, TaskStatus } from '@/types/task';

interface TaskFiltersProps {
  filters: Filters;
  members: Member[];
  onChange: (changes: Partial<Filters>) => void;
  onClearAll: () => void;
}

/** Add or remove one value from a list. */
const toggle = <T,>(list: T[] | undefined, value: T): T[] =>
  list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];

const triggerClass =
  'inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm text-foreground hover:bg-accent';

/** Search, filter menus, sort, and removable chips for the active filters. */
export function TaskFilters({ filters, members, onChange, onClearAll }: TaskFiltersProps) {
  const assigneeName = (id: string) =>
    id === 'me' ? 'Me' : id === 'unassigned' ? 'Unassigned' : (members.find((m) => m.user.id === id)?.user.name ?? 'Someone');

  // One chip per active filter value. Clicking a chip removes it.
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(filters.status ?? []).map((s) => ({
      key: `status-${s}`,
      label: TASK_STATUSES.find((x) => x.value === s)!.label,
      remove: () => onChange({ status: toggle(filters.status, s) }),
    })),
    ...(filters.priority ?? []).map((p) => ({
      key: `priority-${p}`,
      label: `${TASK_PRIORITIES.find((x) => x.value === p)!.label} priority`,
      remove: () => onChange({ priority: toggle(filters.priority, p) }),
    })),
    ...(filters.assigneeId
      ? [{ key: 'assignee', label: `Assignee: ${assigneeName(filters.assigneeId)}`, remove: () => onChange({ assigneeId: undefined }) }]
      : []),
    ...(filters.overdue ? [{ key: 'overdue', label: 'Overdue', remove: () => onChange({ overdue: undefined }) }] : []),
    ...(filters.search ? [{ key: 'search', label: `“${filters.search}”`, remove: () => onChange({ search: undefined }) }] : []),
  ];

  const isDesc = (filters.order ?? 'desc') === 'desc';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={filters.search ?? ''}
          onSearch={(search) => onChange({ search: search || undefined })}
          placeholder="Search tasks…"
          className="w-full sm:w-64"
        />

        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass}>
            Status {filters.status?.length ? `(${filters.status.length})` : ''} <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TASK_STATUSES.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.value}
                checked={filters.status?.includes(s.value) ?? false}
                onCheckedChange={() => onChange({ status: toggle<TaskStatus>(filters.status, s.value) })}
                onSelect={(e) => e.preventDefault()}
              >
                <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                {s.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass}>
            Priority {filters.priority?.length ? `(${filters.priority.length})` : ''} <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TASK_PRIORITIES.map((p) => (
              <DropdownMenuCheckboxItem
                key={p.value}
                checked={filters.priority?.includes(p.value) ?? false}
                onCheckedChange={() => onChange({ priority: toggle<TaskPriority>(filters.priority, p.value) })}
                onSelect={(e) => e.preventDefault()}
              >
                {p.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass}>
            Assignee <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            <DropdownMenuRadioGroup
              value={filters.assigneeId ?? 'any'}
              onValueChange={(value) => onChange({ assigneeId: value === 'any' ? undefined : value })}
            >
              <DropdownMenuRadioItem value="any">Anyone</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="me">Me</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unassigned">Unassigned</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              {members.map((m) => (
                <DropdownMenuRadioItem key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => onChange({ overdue: filters.overdue ? undefined : true })}
          aria-pressed={!!filters.overdue}
          className={cn(triggerClass, filters.overdue && 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15')}
        >
          Overdue
        </button>

        <div className="flex items-center gap-1 sm:ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              Sort: {TASK_SORT_OPTIONS.find((o) => o.value === (filters.sortBy ?? 'createdAt'))?.label}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.sortBy ?? 'createdAt'}
                onValueChange={(value) => onChange({ sortBy: value as TaskSortBy })}
              >
                {TASK_SORT_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => onChange({ order: isDesc ? 'asc' : 'desc' })}
            className={cn(triggerClass, 'px-2')}
            aria-label={isDesc ? 'Sorted descending, switch to ascending' : 'Sorted ascending, switch to descending'}
          >
            {isDesc ? <ArrowDownWideNarrow className="h-4 w-4" aria-hidden /> : <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
          <button type="button" onClick={onClearAll} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
