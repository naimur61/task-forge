'use client';

import { Check, Loader2, Search } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { UserSummary } from '@/types/common';
import type { AddMemberInput } from '@/types/member';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: UserSummary[];
  isSearching: boolean;
  /** Ids of people already in the project. */
  memberIds: string[];
  selected: UserSummary | null;
  onSelect: (user: UserSummary) => void;
  role: AddMemberInput['role'];
  onRoleChange: (role: AddMemberInput['role']) => void;
  /** Only owners may add admins. */
  canAddAdmin: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

/** Search registered users and add one to the project with a role. State lives in the container. */
export function AddMemberDialog({
  open,
  onOpenChange,
  query,
  onQueryChange,
  results,
  isSearching,
  memberIds,
  selected,
  onSelect,
  role,
  onRoleChange,
  canAddAdmin,
  onSubmit,
  isPending,
}: AddMemberDialogProps) {
  const tooShort = query.trim().length < 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Search people who already have a TaskForge account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Name or email"
              className="pl-9"
              aria-label="Search users"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
            )}
          </div>

          <ul className="max-h-60 space-y-1 overflow-y-auto" aria-label="Search results">
            {tooShort && <li className="py-4 text-center text-sm text-muted-foreground">Type at least 2 characters</li>}
            {!tooShort && !isSearching && results.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">No users found</li>
            )}
            {!tooShort &&
              results.map((user) => {
                const isMember = memberIds.includes(user.id);
                const isSelected = selected?.id === user.id;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      disabled={isMember}
                      onClick={() => onSelect(user)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        isSelected ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-accent',
                        isMember && 'cursor-not-allowed opacity-60',
                      )}
                    >
                      <UserAvatar user={user} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      </span>
                      {isMember && <span className="text-xs text-muted-foreground">Already a member</span>}
                      {isSelected && <Check className="h-4 w-4 text-primary" aria-hidden />}
                    </button>
                  </li>
                );
              })}
          </ul>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Role</legend>
            <div className="flex gap-2">
              {(['MEMBER', 'ADMIN'] as const).map((option) => (
                <label
                  key={option}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm',
                    role === option && 'border-primary bg-primary/5',
                    option === 'ADMIN' && !canAddAdmin && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option}
                    checked={role === option}
                    disabled={option === 'ADMIN' && !canAddAdmin}
                    onChange={() => onRoleChange(option)}
                    className="accent-[hsl(var(--primary))]"
                  />
                  {option === 'MEMBER' ? 'Member' : 'Admin'}
                </label>
              ))}
            </div>
            {!canAddAdmin && <p className="text-xs text-muted-foreground">Only the owner can add admins.</p>}
          </fieldset>
        </div>

        <DialogFooter className="gap-2">
          <ActionButton variant="outline" handleOpen={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </ActionButton>
          <ActionButton isPending={isPending} disabled={!selected} handleOpen={onSubmit}>
            Add member
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
