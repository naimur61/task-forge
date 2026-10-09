'use client';

import { useState, type ReactNode } from 'react';
import { ActionButton } from '@/components/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** Red confirm button for destructive actions. */
  destructive?: boolean;
  /** When set, the user must type this text before confirming (e.g. the project name). */
  confirmText?: string;
  isPending?: boolean;
  onConfirm: () => void;
}

/** "Are you sure?" dialog. Optionally asks the user to type a word to confirm. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  confirmText,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const canConfirm = !confirmText || typed === confirmText;

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {confirmText && (
          <div className="space-y-2">
            <label htmlFor="confirm-text" className="text-sm text-muted-foreground">
              Type <span className="font-semibold text-foreground">{confirmText}</span> to confirm
            </label>
            <Input id="confirm-text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        )}

        <DialogFooter className="gap-2">
          <ActionButton variant="outline" handleOpen={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </ActionButton>
          <ActionButton
            variant={destructive ? 'destructive' : 'default'}
            isPending={isPending}
            disabled={!canConfirm}
            handleOpen={onConfirm}
          >
            {confirmLabel}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
