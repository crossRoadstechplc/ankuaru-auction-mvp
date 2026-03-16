"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "@/lib/utils"

export interface FollowUserRowProps {
  userId: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  isFollowing?: boolean
  isRequested?: boolean
  isBlocked?: boolean
  isLoading?: boolean
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
  onBlock?: (userId: string) => void
  onUnblock?: (userId: string) => void
  className?: string
}

export function FollowUserRow({
  userId,
  username,
  displayName,
  avatarUrl,
  isFollowing,
  isRequested,
  isBlocked,
  isLoading,
  onFollow,
  onUnfollow,
  onBlock,
  onUnblock,
  className,
}: FollowUserRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar src={avatarUrl} name={displayName || username} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-foreground truncate">
            {displayName || username}
          </span>
          <span className="text-xs text-muted-foreground truncate">@{username}</span>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {isBlocked ? (
          onUnblock ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => onUnblock(userId)}
              className="text-xs gap-1"
              aria-label={`Unblock ${username}`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">lock_open</span>
              {isLoading ? "..." : "Unblock"}
            </Button>
          ) : null
        ) : (
          <>
            {isFollowing && onUnfollow ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => onUnfollow(userId)}
                className="text-xs gap-1"
                aria-label={`Unfollow ${username}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">person_remove</span>
                {isLoading ? "..." : "Unfollow"}
              </Button>
            ) : isRequested ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="text-xs gap-1 border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                aria-label={`Follow request sent to ${username}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
                Requested
              </Button>
            ) : !isFollowing && onFollow ? (
              <Button
                size="sm"
                disabled={isLoading}
                onClick={() => onFollow(userId)}
                className="text-xs gap-1"
                aria-label={`Follow ${username}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">person_add</span>
                {isLoading ? "..." : "Follow"}
              </Button>
            ) : null}

            {onBlock ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => onBlock(userId)}
                className="text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                aria-label={`Block ${username}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">block</span>
                {isLoading ? "..." : "Block"}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
