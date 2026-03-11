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
  isLoading?: boolean
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
  className?: string
}

export function FollowUserRow({
  userId,
  username,
  displayName,
  avatarUrl,
  isFollowing,
  isLoading,
  onFollow,
  onUnfollow,
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

      <div className="flex-shrink-0">
        {isFollowing ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={() => onUnfollow?.(userId)}
            className="text-xs gap-1"
            aria-label={`Unfollow ${username}`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">person_remove</span>
            {isLoading ? "..." : "Unfollow"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={isLoading}
            onClick={() => onFollow?.(userId)}
            className="text-xs gap-1"
            aria-label={`Follow ${username}`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">person_add</span>
            {isLoading ? "..." : "Follow"}
          </Button>
        )}
      </div>
    </div>
  )
}
