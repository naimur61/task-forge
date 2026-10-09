'use client';

import { Crown, LogOut, MoreHorizontal, Shield, User, UserMinus } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/features/projects/role-badge';
import { formatShortDate } from '@/lib/date-utils/due';
import type { Member } from '@/types/member';
import type { MemberRole } from '@/types/project';

export type MemberAction = 'make-admin' | 'make-member' | 'transfer' | 'remove' | 'leave';

interface MemberListProps {
  members: Member[];
  currentUserId: string;
  /** My role in this project; decides which actions I see. */
  myRole: MemberRole;
  onAction: (action: MemberAction, member: Member) => void;
}

/** Which actions I may take on this member row. Mirrors the API rules. */
function actionsFor(member: Member, myRole: MemberRole, currentUserId: string): MemberAction[] {
  const isMe = member.user.id === currentUserId;
  if (isMe) return member.role === 'OWNER' ? [] : ['leave'];
  if (myRole === 'OWNER') {
    return [member.role === 'ADMIN' ? 'make-member' : 'make-admin', 'transfer', 'remove'];
  }
  if (myRole === 'ADMIN' && member.role === 'MEMBER') return ['remove'];
  return [];
}

const ACTION_LABELS: Record<MemberAction, { label: string; icon: typeof Crown; destructive?: boolean }> = {
  'make-admin': { label: 'Make admin', icon: Shield },
  'make-member': { label: 'Make member', icon: User },
  transfer: { label: 'Transfer ownership', icon: Crown },
  remove: { label: 'Remove from project', icon: UserMinus, destructive: true },
  leave: { label: 'Leave project', icon: LogOut, destructive: true },
};

/** Menu with the allowed actions for one member. Hidden when there are none. */
function MemberActions({ member, actions, onAction }: { member: Member; actions: MemberAction[]; onAction: MemberListProps['onAction'] }) {
  if (actions.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={`Actions for ${member.user.name}`}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{member.user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => {
          const info = ACTION_LABELS[action];
          const Icon = info.icon;
          return (
            <DropdownMenuItem
              key={action}
              onSelect={() => onAction(action, member)}
              className={info.destructive ? 'text-destructive focus:text-destructive' : undefined}
            >
              <Icon className="mr-2 h-4 w-4" aria-hidden />
              {info.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Project members: a table on desktop, cards on phones. */
export function MemberList({ members, currentUserId, myRole, onAction }: MemberListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={member.user} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {member.user.name}
                        {member.user.id === currentUserId && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatShortDate(member.joinedAt)}</TableCell>
                <TableCell>
                  <MemberActions member={member} actions={actionsFor(member, myRole, currentUserId)} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-2 md:hidden">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            <UserAvatar user={member.user} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {member.user.name}
                {member.user.id === currentUserId && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
              <RoleBadge role={member.role} className="mt-1.5" />
            </div>
            <MemberActions member={member} actions={actionsFor(member, myRole, currentUserId)} onAction={onAction} />
          </li>
        ))}
      </ul>
    </>
  );
}
