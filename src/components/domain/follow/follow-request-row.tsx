"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "../user/user-avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type FollowRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface FollowRequestRowProps {
  requestId: string
  userId: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  requestedAt?: string
  status?: FollowRequestStatus
  isLoading?: boolean
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  className?: string
}

export function FollowRequestRow({
  requestId,
  userId,
  username,
  displayName,
  avatarUrl,
  requestedAt,
  status = "PENDING",
  isLoading,
  onApprove,
  onReject,
  className,
}: FollowRequestRowProps) {
  const formattedDate = requestedAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(requestedAt))
    : null

  return (
    <div className={cn("flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar src={avatarUrl} name={displayName || username} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-foreground truncate">
            {displayName || username}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            @{username}{formattedDate ? ` · ${formattedDate}` : ""}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0">
        {status === "PENDING" ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => onApprove?.(requestId)}
              className="text-xs gap-1"
              aria-label={`Approve follow request from ${username}`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => onReject?.(requestId)}
              className="text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
              aria-label={`Reject follow request from ${username}`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
              Reject
            </Button>
          </div>
        ) : (
          <Badge variant={status === "APPROVED" ? "success" : "secondary"} className="text-xs">
            {status === "APPROVED" ? "Approved" : "Rejected"}
          </Badge>
        )}
      </div>
    </div>
  )
}
