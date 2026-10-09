import { Crown, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MemberRole } from '@/types/project';

const ROLES: Record<MemberRole, { label: string; icon: typeof Crown; className: string }> = {
  OWNER: { label: 'Owner', icon: Crown, className: 'bg-primary/10 text-primary' },
  ADMIN: { label: 'Admin', icon: Shield, className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  MEMBER: { label: 'Member', icon: User, className: 'bg-muted text-muted-foreground' },
};

/** Small pill showing a project role with an icon. */
export function RoleBadge({ role, className }: { role: MemberRole; className?: string }) {
  const info = ROLES[role];
  const Icon = info.icon;
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', info.className, className)}>
      <Icon className="h-3 w-3" aria-hidden />
      {info.label}
    </span>
  );
}
