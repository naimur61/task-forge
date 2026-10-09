import { AtSign, Bell, MessageSquare, UserPlus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification';

const ICONS: Record<string, typeof Bell> = {
  'task.assigned': AtSign,
  'comment.added': MessageSquare,
  'member.added': UserPlus,
};

interface NotificationListProps {
  notifications: Notification[];
  onOpen: (notification: Notification) => void;
}

/** Full notification list. Unread items are highlighted. */
export function NotificationList({ notifications, onOpen }: NotificationListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {notifications.map((notification) => {
        const Icon = ICONS[notification.type] ?? Bell;
        const unread = !notification.readAt;
        return (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/50',
                unread && 'bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  unread ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm text-foreground', unread && 'font-medium')}>{notification.message}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
              </span>
              {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
