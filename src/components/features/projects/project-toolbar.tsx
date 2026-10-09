'use client';

import { LayoutGrid, List } from 'lucide-react';
import { SearchInput } from '@/components/common/search-input/search-input';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

export type ProjectView = 'grid' | 'list';

interface ProjectToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  status: ProjectStatus | undefined;
  onStatusChange: (status: ProjectStatus | undefined) => void;
  view: ProjectView;
  onViewChange: (view: ProjectView) => void;
}

const STATUS_TABS: { label: string; value: ProjectStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

/** Search box, status tabs and grid/list toggle above the projects. */
export function ProjectToolbar({ search, onSearch, status, onStatusChange, view, onViewChange }: ProjectToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput value={search} onSearch={onSearch} placeholder="Search projects…" className="sm:w-72" />

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border bg-card p-0.5" role="tablist" aria-label="Project status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                status === tab.value ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {(['grid', 'list'] as const).map((option) => {
            const Icon = option === 'grid' ? LayoutGrid : List;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onViewChange(option)}
                aria-label={option === 'grid' ? 'Grid view' : 'List view'}
                aria-pressed={view === option}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  view === option ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
