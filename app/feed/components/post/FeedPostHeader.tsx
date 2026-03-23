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
  if (!value) return false;
  return /^User\s+[A-Za-z0-9-]{4,}\.\.\.$/.test(value.trim());
}

function pickReadableIdentity(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (!value) continue;
    const trimmed = value.trim();
    if (!trimmed || isSyntheticIdentity(trimmed)) continue;
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
  const needsProfileLookup =
    !!creatorId &&
    !pickReadableIdentity(creator?.fullName, creator?.username);
  const { data: creatorProfile } = useUserInfoQuery(creatorId, needsProfileLookup);

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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const formattedTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : null;
  const canShowFollowButton = !!creatorId && authUserId !== creatorId;

  const handleFollowToggle = async () => {
    if (!creatorId || isFollowActionLoading) return;
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
    if (creatorId && onOpenProfile) onOpenProfile(creatorId);
  };

  const handleProfileImageOpen = () => {
    if (onOpenProfileImage) {
      onOpenProfileImage({
        imageUrl: avatarUrl,
        displayName,
        username: readableUsername,
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 px-3 py-2 dark:border-slate-800/80">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={handleProfileImageOpen}
          title="View profile image"
          className="shrink-0 rounded-lg p-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Avatar className="size-9 rounded-lg border border-slate-200/60 dark:border-slate-700">
            <AvatarImage src={avatarUrl || ""} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {avatarUrl ? (
                <User className="size-4" />
              ) : (
                <span className="text-card-caption font-semibold">{getInitials(displayName)}</span>
              )}
            </AvatarFallback>
          </Avatar>
        </button>

        <button
          type="button"
          onClick={handleProfileOpen}
          disabled={!onOpenProfile}
          title={onOpenProfile ? "Open profile" : undefined}
          className="min-w-0 truncate text-left text-card-body font-semibold text-slate-900 transition-colors hover:text-primary dark:text-white"
        >
          {displayName}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {formattedTime ? (
          <span className="text-card-meta font-medium text-slate-500 dark:text-slate-400">
            {formattedTime}
          </span>
        ) : null}

        {canShowFollowButton ? (
          <Button
            type="button"
            size="sm"
            variant={isFollowing || effectiveIsRequested ? "outline" : "default"}
            onClick={() => {
              if (!effectiveIsRequested) void handleFollowToggle();
            }}
            disabled={isFollowActionLoading || effectiveIsRequested}
            className={`h-7 shrink-0 rounded-lg px-2.5 text-card-meta font-semibold ${
              isFollowing
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                : effectiveIsRequested
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  : "bg-primary text-primary-foreground"
            }`}
          >
            {isFollowing ? (
              <UserCheck className="mr-1 size-3.5" />
            ) : effectiveIsRequested ? (
              <span className="material-symbols-outlined mr-1 text-sm">schedule</span>
            ) : (
              <UserPlus className="mr-1 size-3.5" />
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
