'use client';

import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Notification } from '@/types/notification';
import { formatRelativeTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  notifications: Notification[];
  unread: number;
  isLoading: boolean;
  onOpen: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

/** Bell icon with an unread badge and a dropdown of the latest notifications. */
export function NotificationBell({ notifications, unread, isLoading, onOpen, onMarkAllRead }: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading notifications" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
        )}

        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            onSelect={() => onOpen(notification)}
            className="flex cursor-pointer items-start gap-2 py-2"
          >
            <span
              className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', notification.readAt ? 'bg-transparent' : 'bg-primary')}
              aria-hidden
            />
            <span className="space-y-0.5">
              <span className={cn('block text-sm', !notification.readAt && 'font-medium')}>{notification.message}</span>
              <span className="block text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
            </span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm font-medium text-primary">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
