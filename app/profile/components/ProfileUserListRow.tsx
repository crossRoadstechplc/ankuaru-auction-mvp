"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { User } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileUserListRowProps {
  user: User;
  action?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function ProfileUserListRow({
  user,
  action,
  subtitle,
  className,
}: ProfileUserListRowProps) {
  const displayName = user.fullName || user.username || "User";
  const username = user.username ? `@${user.username}` : undefined;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-slate-200/50 px-4 py-3 last:border-b-0 dark:border-slate-800/80",
        className,
      )}
    >
      <Link
        href={`/profile/${user.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
      >
        <UserAvatar
          src={user.avatar || user.profileImageUrl}
          name={displayName}
          size="md"
          className="size-11 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-white">
            {displayName}
          </p>
          {username ? (
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {username}
            </p>
          ) : null}
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Link>

      {action ? (
        <div className="shrink-0">{action}</div>
      ) : null}
    </div>
  );
}
