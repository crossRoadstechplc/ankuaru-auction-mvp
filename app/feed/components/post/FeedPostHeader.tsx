"use client";

import { User, UserCheck, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUserInfoQuery,
} from "@/src/features/profile/queries/hooks";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

interface FeedPostHeaderProps {
  creatorId: string;
  creator?: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt?: string;
  isFollowing?: boolean;
  isRequested?: boolean;
  onOpenProfile?: (userId: string) => void;
}

function isSyntheticIdentity(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return /^User\s+[A-Za-z0-9-]{4,}\.\.\.$/.test(value.trim());
}

function pickReadableIdentity(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed || isSyntheticIdentity(trimmed)) {
      continue;
    }

    return trimmed;
  }

  return undefined;
}

export function FeedPostHeader({
  creatorId,
  creator,
  createdAt,
  isFollowing,
  isRequested,
  onOpenProfile,
}: FeedPostHeaderProps) {
  const router = useRouter();
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);
  const authUserId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();
  const needsProfileLookup = !!creatorId && !pickReadableIdentity(
    creator?.fullName,
    creator?.username,
  );
  const { data: creatorProfile } = useUserInfoQuery(
    creatorId,
    needsProfileLookup,
  );
  const displayName =
    pickReadableIdentity(
      creator?.fullName,
      creatorProfile?.fullName,
      creator?.username,
      creatorProfile?.username,
    ) ?? "Auction Creator";
  const readableUsername = pickReadableIdentity(
    creator?.username,
    creatorProfile?.username,
  );
  const subtitle =
    readableUsername && readableUsername !== displayName
      ? `@${readableUsername}`
      : null;
  const avatarUrl =
    creator?.avatar || creatorProfile?.avatar || creatorProfile?.profileImageUrl;

  // Provide an initial fallback for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formattedTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : null;
  const canShowFollowButton = !!creatorId && authUserId !== creatorId;

  const handleFollowToggle = async () => {
    if (!creatorId || isFollowActionLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setIsFollowActionLoading(true);

      if (isFollowing) {
        await unfollowUserMutation.mutateAsync(creatorId);
        return;
      }

      await followUserMutation.mutateAsync(creatorId);
    } catch (error) {
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setIsFollowActionLoading(false);
    }
  };

  const handleProfileOpen = () => {
    if (!creatorId || !onOpenProfile) {
      return;
    }

    onOpenProfile(creatorId);
  };

  return (
    <div className="flex items-start gap-3 px-4 pb-4 pt-4 md:px-5">
      <button
        type="button"
        onClick={handleProfileOpen}
        disabled={!onOpenProfile}
        title={onOpenProfile ? "Open profile" : undefined}
        className="group flex min-w-0 flex-1 items-start gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <Avatar className="size-11 rounded-xl border border-border/50 transition-transform group-hover:scale-[1.03]">
          <AvatarImage
            src={avatarUrl || ""}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-xl bg-muted text-muted-foreground">
            {avatarUrl ? (
              <User className="size-5" />
            ) : (
              <span className="font-semibold">{getInitials(displayName)}</span>
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
              {displayName}
            </h3>
            {onOpenProfile ? (
              <span className="hidden rounded-full border border-border/70 bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex">
                View profile
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            Auction creator
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        {formattedTime ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {formattedTime}
          </span>
        ) : null}

        {canShowFollowButton ? (
          <Button
            type="button"
            size="sm"
            variant={isFollowing || isRequested ? "outline" : "default"}
            onClick={() => {
              if (!isRequested) {
                void handleFollowToggle();
              }
            }}
            disabled={isFollowActionLoading || isRequested}
            className={`h-8 rounded-full px-3 text-xs font-semibold shadow-sm ${
              isFollowing
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                : isRequested
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isFollowing ? (
              <UserCheck className="mr-1.5 size-4" />
            ) : isRequested ? (
              <span className="material-symbols-outlined mr-1.5 text-[16px]">
                schedule
              </span>
            ) : (
              <UserPlus className="mr-1.5 size-4" />
            )}
            {isFollowActionLoading
              ? "..."
              : isFollowing
                ? "Following"
                : isRequested
                  ? "Requested"
                  : "Follow"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
