'use client';

import { Check, Plus } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { LabelChip } from '@/components/features/tasks/task-badges';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Label } from '@/types/task';

/** Colors offered for new labels. */
export const LABEL_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#ec4899', '#64748b'];

interface ProjectLabelsProps {
  labels: Label[];
  name: string;
  onNameChange: (name: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  onCreate: () => void;
  isPending: boolean;
}

/** "Labels" card: see the project's labels and add new ones. State lives in the container. */
export function ProjectLabels({ labels, name, onNameChange, color, onColorChange, onCreate, isPending }: ProjectLabelsProps) {
  const canCreate = name.trim().length > 0 && !labels.some((l) => l.name.toLowerCase() === name.trim().toLowerCase());

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-foreground">Labels</h2>
      <p className="mt-1 text-sm text-muted-foreground">Group tasks by type, like Bug, Feature or Design.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {labels.length === 0 && <p className="text-sm text-muted-foreground">No labels yet.</p>}
        {labels.map((label) => (
          <LabelChip key={label.id} name={label.name} color={label.color} />
        ))}
      </div>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (canCreate) onCreate();
        }}
      >
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="New label name"
          aria-label="New label name"
          maxLength={30}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1.5" role="radiogroup" aria-label="Label color">
          {LABEL_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={color === option}
              aria-label={`Color ${option}`}
              onClick={() => onColorChange(option)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110',
                color === option && 'ring-2 ring-foreground/60',
              )}
              style={{ backgroundColor: option }}
            >
              {color === option && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
            </button>
          ))}
        </div>
        <ActionButton type="submit" variant="outline" icon={<Plus />} isPending={isPending} disabled={!canCreate}>
          Add label
        </ActionButton>
      </form>
    </section>
  );
}
