'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LOGIN_PATH } from '@/auth/jwt/config';

/** Signed-in user's avatar with a menu: account and sign out. */
export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  if (!user) return null;

  const signOut = async () => {
    await logout();
    // Drop every cached response so the next user starts clean.
    queryClient.clear();
    router.replace(LOGIN_PATH);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
        <UserAvatar user={{ name: user.name, avatarUrl: user.avatar }} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <UserRound className="mr-2 h-4 w-4" aria-hidden /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
