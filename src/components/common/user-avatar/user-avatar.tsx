import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: { name: string; avatarUrl?: string | null } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { xs: 'h-5 w-5 text-[9px]', sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-base' };

/** Soft background colors, picked from the name so each person keeps the same color. */
const COLORS = [
  'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
];

/** "Ava Chen" → "AC". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

function colorFor(name: string): string {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

/** Round user picture, or colored initials when there is no picture. */
export function UserAvatar({ user, size = 'sm', className }: UserAvatarProps) {
  const name = user?.name ?? 'Unassigned';
  return (
    <Avatar className={cn(SIZES[size], className)} title={name}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
      <AvatarFallback className={cn('font-semibold', user ? colorFor(name) : 'bg-muted text-muted-foreground')}>
        {user ? initials(name) : '?'}
      </AvatarFallback>
    </Avatar>
  );
}

interface AvatarStackProps {
  users: { id: string; name: string; avatarUrl?: string | null }[];
  /** Total count, when more people exist than are in `users`. */
  total?: number;
  max?: number;
}

/** Overlapping avatars with a "+N" bubble for the rest. */
export function AvatarStack({ users, total = users.length, max = 4 }: AvatarStackProps) {
  const shown = users.slice(0, max);
  const extra = total - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((user) => (
        <UserAvatar key={user.id} user={user} size="sm" className="ring-2 ring-background" />
      ))}
      {extra > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-2 ring-background">
          +{extra}
        </span>
      )}
    </div>
  );
}
