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
import { useEffect, useState } from "react";
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
  onOpenProfileImage?: (payload: {
    imageUrl?: string | null;
    displayName: string;
    username?: string | null;
  }) => void;
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
  onOpenProfileImage,
}: FeedPostHeaderProps) {
  const router = useRouter();
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);
  const [optimisticRequestedId, setOptimisticRequestedId] = useState<string | null>(null);
  const authUserId = useAuthStore((state) => state.userId);

  const effectiveIsRequested =
    isRequested || (optimisticRequestedId === creatorId && !isFollowing);

  useEffect(() => {
    if (isRequested || isFollowing) {
      setOptimisticRequestedId(null);
    }
  }, [isRequested, isFollowing]);
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
      setOptimisticRequestedId(creatorId);
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

  const handleProfileImageOpen = () => {
    if (!onOpenProfileImage) {
      return;
    }

    onOpenProfileImage({
      imageUrl: avatarUrl,
      displayName,
      username: readableUsername,
    });
  };

  return (
    <div className="flex items-center gap-3.5 px-4 pb-4 pt-4 md:gap-4 md:px-5">
      <button
        type="button"
        onClick={handleProfileImageOpen}
        title="View profile image"
        className="group shrink-0 rounded-xl p-1 transition-all duration-200 ease-out hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
      >
        <Avatar className="size-12 rounded-2xl border border-border/50 transition-transform duration-200 ease-out group-hover:scale-[1.03] md:size-13">
          <AvatarImage
            src={avatarUrl || ""}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground">
            {avatarUrl ? (
              <User className="size-5" />
            ) : (
              <span className="font-semibold">{getInitials(displayName)}</span>
            )}
          </AvatarFallback>
        </Avatar>
      </button>

      <button
        type="button"
        onClick={handleProfileOpen}
        disabled={!onOpenProfile}
        title={onOpenProfile ? "Open profile" : undefined}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1.5 text-left transition-colors duration-200 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <h3 className="truncate text-[1.05rem] font-extrabold leading-tight text-foreground transition-colors group-hover:text-primary md:text-[1.15rem]">
              {displayName}
            </h3>
            {onOpenProfile ? (
              <span className="hidden rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex">
                View profile
              </span>
            ) : null}
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
            variant={isFollowing || effectiveIsRequested ? "outline" : "default"}
            onClick={() => {
              if (!effectiveIsRequested) {
                void handleFollowToggle();
              }
            }}
            disabled={isFollowActionLoading || effectiveIsRequested}
            className={`h-8 rounded-full px-3 text-xs font-semibold ${
              isFollowing
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                : effectiveIsRequested
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  : "bg-primary text-primary-foreground"
            }`}
          >
            {isFollowing ? (
              <UserCheck className="mr-1.5 size-4" />
            ) : effectiveIsRequested ? (
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
                : effectiveIsRequested
                  ? "Requested"
                  : "Follow"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
