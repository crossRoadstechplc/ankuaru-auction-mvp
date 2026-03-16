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
  postsCount?: number;
  ratingValue?: number | null;
  joinedAt?: string | null;
  actions?: React.ReactNode;
  isVerified?: boolean;
  className?: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function ProfileSummaryCard({
  username,
  displayName,
  bio,
  avatarUrl,
  followersCount = 0,
  followingCount = 0,
  postsCount,
  ratingValue,
  joinedAt,
  actions,
  isVerified,
  className,
  onFollowersClick,
  onFollowingClick,
}: ProfileSummaryCardProps) {
  const joinedDate = joinedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(joinedAt))
    : null;
  const stats = [
    {
      label: "Followers",
      value: followersCount.toLocaleString(),
      onClick: onFollowersClick,
    },
    {
      label: "Following",
      value: followingCount.toLocaleString(),
      onClick: onFollowingClick,
    },
    ...(postsCount !== undefined
      ? [
          {
            label: "Lots",
            value: postsCount.toLocaleString(),
            onClick: undefined,
          },
        ]
      : []),
    ...(ratingValue !== undefined && ratingValue !== null
      ? [
          {
            label: "Rating",
            value: ratingValue > 0 ? ratingValue.toFixed(1) : "-",
            onClick: undefined,
          },
        ]
      : []),
  ];

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
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) =>
            stat.onClick ? (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-left transition-colors hover:bg-muted/35"
              >
                <span className="block text-sm font-black text-foreground">
                  {stat.value}
                </span>
                <span className="block text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </button>
            ) : (
              <div
                key={stat.label}
                className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
              >
                <span className="block text-sm font-black text-foreground">
                  {stat.value}
                </span>
                <span className="block text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ),
          )}
        </div>
        {joinedDate ? (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Joined {joinedDate}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
