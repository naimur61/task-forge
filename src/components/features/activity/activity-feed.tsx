import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { formatRelativeTime } from '@/lib/date-utils';
import type { Activity } from '@/types/activity';

interface ActivityFeedProps {
  items: Activity[];
  /** Show which project each entry belongs to (for cross-project feeds). */
  showProject?: boolean;
}

/** Timeline of "who did what, when". */
export function ActivityFeed({ items, showProject = false }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <UserAvatar user={item.actor} size="sm" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-foreground">
              <span className="font-medium">{item.actor.name}</span>{' '}
              <span className="text-muted-foreground">{item.message}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatRelativeTime(item.createdAt)}
              {showProject && item.projectName && <> · {item.projectName}</>}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
