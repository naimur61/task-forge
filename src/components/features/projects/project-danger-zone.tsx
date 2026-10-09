'use client';

import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { ActionButton } from '@/components/common/button';

interface ProjectDangerZoneProps {
  isArchived: boolean;
  onArchiveToggle: () => void;
  isArchivePending: boolean;
  onDelete: () => void;
}

/** Owner-only actions: archive/restore and delete. */
export function ProjectDangerZone({ isArchived, onArchiveToggle, isArchivePending, onDelete }: ProjectDangerZoneProps) {
  return (
    <section className="rounded-xl border border-destructive/30 bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-foreground">Danger zone</h2>
      <div className="mt-4 divide-y divide-border">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{isArchived ? 'Restore project' : 'Archive project'}</p>
            <p className="text-sm text-muted-foreground">
              {isArchived ? 'Make the project editable again.' : 'Keep everything, but make tasks read-only.'}
            </p>
          </div>
          <ActionButton
            variant="outline"
            icon={isArchived ? <ArchiveRestore /> : <Archive />}
            isPending={isArchivePending}
            handleOpen={onArchiveToggle}
          >
            {isArchived ? 'Restore' : 'Archive'}
          </ActionButton>
        </div>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delete project</p>
            <p className="text-sm text-muted-foreground">Removes the project, its tasks and comments for everyone.</p>
          </div>
          <ActionButton variant="destructive" icon={<Trash2 />} handleOpen={onDelete}>
            Delete
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
