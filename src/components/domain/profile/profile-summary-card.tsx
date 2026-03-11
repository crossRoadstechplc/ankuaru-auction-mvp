import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import { UserAvatar } from "../user/user-avatar";

export interface ProfileSummaryCardProps {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  joinedAt?: string | null;
  actions?: React.ReactNode;
  isVerified?: boolean;
  className?: string;
}

export function ProfileSummaryCard({
  username,
  displayName,
  bio,
  avatarUrl,
  followersCount = 0,
  followingCount = 0,
  joinedAt,
  actions,
  isVerified,
  className,
}: ProfileSummaryCardProps) {
  const joinedDate = joinedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(joinedAt))
    : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="px-4 pb-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between gap-3">
          <div className="relative">
            <UserAvatar
              src={avatarUrl}
              name={displayName || username}
              size="md"
              className="ring-2 ring-card shadow-md"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary border border-card">
                <span className="material-symbols-outlined text-white text-[8px]">
                  verified
                </span>
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Name and bio */}
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {displayName || username}
            </h2>
            {isVerified && (
              <Badge variant="default" className="text-xs px-1.5">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{username}</p>
          {bio && (
            <p className="text-xs text-foreground mt-0.5 leading-relaxed line-clamp-2">
              {bio}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-foreground">
              {followersCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Followers
            </span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-foreground">
              {followingCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Following
            </span>
          </div>
          {joinedDate && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  Joined
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {joinedDate}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
