'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { UserPlus } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { ErrorState } from '@/components/common/error-state/error-state';
import { AddMemberDialog } from '@/components/features/members/add-member-dialog';
import { MemberList, type MemberAction } from '@/components/features/members/member-list';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { can } from '@/lib/permissions';
import { MEMBERS_FIXTURE } from '@/mocks/fixtures/members';
import type { UserSummary } from '@/types/common';
import type { AddMemberInput, Member } from '@/types/member';
import {
  useAddMember,
  useChangeRole,
  useMembers,
  useProject,
  useRemoveMember,
  useTransferOwnership,
  useUserSearch,
} from '../service';

/** Actions that need an "Are you sure?" step. */
type PendingConfirm = { action: 'remove' | 'leave' | 'transfer'; member: Member } | null;

export default function MembersContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const project = useProject(projectId).data?.data;
  const myRole = project?.myRole ?? 'MEMBER';
  const membersQuery = useMembers(projectId);
  const members = membersQuery.data?.data ?? [];

  // Add member dialog
  const [isAddOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<AddMemberInput['role']>('MEMBER');
  const debouncedQuery = useDebounce(query, 300);
  const searchQuery = useUserSearch(debouncedQuery);

  const closeAddDialog = () => {
    setAddOpen(false);
    setQuery('');
    setSelected(null);
    setRole('MEMBER');
  };
  const addMember = useAddMember(projectId, closeAddDialog);

  // Row actions
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  const changeRole = useChangeRole(projectId);
  const transfer = useTransferOwnership(projectId);
  const removeMember = useRemoveMember(projectId, () => {
    // After leaving, this project is no longer visible to me.
    if (confirm?.action === 'leave') router.replace('/projects');
    setConfirm(null);
  });

  const handleAction = (action: MemberAction, member: Member) => {
    if (action === 'make-admin') changeRole.mutate({ userId: member.user.id, role: 'ADMIN' });
    else if (action === 'make-member') changeRole.mutate({ userId: member.user.id, role: 'MEMBER' });
    else setConfirm({ action, member });
  };

  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.action === 'transfer') transfer.mutate(confirm.member.user.id, { onSuccess: () => setConfirm(null) });
    else removeMember.mutate(confirm.member.user.id);
  };

  const confirmText: Record<'remove' | 'leave' | 'transfer', { title: string; description: string; label: string }> = {
    remove: {
      title: `Remove ${confirm?.member.user.name}?`,
      description: 'They lose access to this project. Tasks assigned to them become unassigned.',
      label: 'Remove',
    },
    leave: {
      title: 'Leave this project?',
      description: 'You will lose access until someone adds you again. Your tasks become unassigned.',
      label: 'Leave project',
    },
    transfer: {
      title: `Make ${confirm?.member.user.name} the owner?`,
      description: 'You will become an admin. Only the new owner can transfer it back.',
      label: 'Transfer ownership',
    },
  };

  if (membersQuery.isError) return <ErrorState error={membersQuery.error} onRetry={() => membersQuery.refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {members.length} {members.length === 1 ? 'person' : 'people'} in this project
        </p>
        {can(myRole, 'member.add') && (
          <ActionButton icon={<UserPlus />} handleOpen={() => setAddOpen(true)}>
            Add member
          </ActionButton>
        )}
      </div>

      <Skeleton
        name="members-list"
        loading={membersQuery.isPending}
        fixture={<MemberList members={MEMBERS_FIXTURE} currentUserId="" myRole="MEMBER" onAction={() => undefined} />}
      >
        <MemberList members={members} currentUserId={userId} myRole={myRole} onAction={handleAction} />
      </Skeleton>

      <AddMemberDialog
        open={isAddOpen}
        onOpenChange={(open) => (open ? setAddOpen(true) : closeAddDialog())}
        query={query}
        onQueryChange={setQuery}
        results={searchQuery.data?.data ?? []}
        isSearching={searchQuery.isFetching}
        memberIds={members.map((m) => m.user.id)}
        selected={selected}
        onSelect={setSelected}
        role={role}
        onRoleChange={setRole}
        canAddAdmin={myRole === 'OWNER'}
        onSubmit={() => selected && addMember.mutate({ userId: selected.id, role })}
        isPending={addMember.isPending}
      />

      {confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirm(null)}
          title={confirmText[confirm.action].title}
          description={confirmText[confirm.action].description}
          confirmLabel={confirmText[confirm.action].label}
          destructive={confirm.action !== 'transfer'}
          isPending={removeMember.isPending || transfer.isPending}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}
