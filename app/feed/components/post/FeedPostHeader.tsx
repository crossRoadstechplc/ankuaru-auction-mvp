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
import { cn } from "@/lib/utils";

interface FeedPostHeaderProps {
  creatorId: string;
  lotType?: "FLEXIBLE" | "SEALED";
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
  lotType,
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
    <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-3 py-3 sm:px-4 dark:border-slate-800/80">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={handleProfileImageOpen}
          title="View profile photo"
          className={cn(
            "shrink-0 cursor-pointer rounded-full p-0.5 transition-all duration-200",
            "ring-2 ring-transparent hover:scale-[1.02] hover:bg-slate-100 hover:shadow-md hover:ring-primary/25",
            "active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
            "dark:hover:bg-slate-800/90 dark:hover:ring-primary/30",
          )}
        >
          <Avatar className="size-12 rounded-full border-2 border-slate-200/80 shadow-sm dark:border-slate-600 sm:size-14">
            <AvatarImage src={avatarUrl || ""} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {avatarUrl ? (
                <User className="size-5" />
              ) : (
                getInitials(displayName)
              )}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={handleProfileOpen}
            disabled={!onOpenProfile}
            title={onOpenProfile ? "Open profile" : undefined}
            className={cn(
              "min-w-0 max-w-full cursor-pointer truncate rounded-md px-0.5 text-left transition-colors sm:max-w-[min(100%,18rem)]",
              "text-base font-bold tracking-tight text-slate-900 sm:text-[1.05rem]",
              onOpenProfile
                ? "hover:text-primary hover:underline decoration-primary/40 underline-offset-2 dark:text-white dark:hover:text-primary"
                : "cursor-default dark:text-white",
            )}
          >
            {displayName}
          </button>

          {canShowFollowButton ? (
            <Button
              type="button"
              size="sm"
              variant={isFollowing || effectiveIsRequested ? "outline" : "default"}
              onClick={() => {
                if (!effectiveIsRequested) void handleFollowToggle();
              }}
              disabled={isFollowActionLoading || effectiveIsRequested}
              className={cn(
                "h-6 shrink-0 rounded-full px-2 text-[11px] font-semibold leading-none transition-colors",
                isFollowing
                  ? "border-emerald-200/90 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                  : effectiveIsRequested
                    ? "border-amber-300/90 bg-amber-50 text-amber-800 hover:bg-amber-100/80 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-300 dark:hover:bg-amber-950/50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {isFollowing ? (
                <UserCheck className="mr-0.5 size-3" />
              ) : effectiveIsRequested ? (
                <span className="material-symbols-outlined mr-0.5 text-[13px] leading-none">schedule</span>
              ) : (
                <UserPlus className="mr-0.5 size-3" />
              )}
              {isFollowActionLoading
                ? "…"
                : isFollowing
                  ? "Following"
                  : effectiveIsRequested
                    ? "Requested"
                    : "Follow"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5">
        {lotType === "SEALED" ? (
          <span className="inline-flex min-h-8 items-center rounded-full border-2 border-slate-400/70 bg-slate-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-800 shadow-sm dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            Sealed
          </span>
        ) : lotType === "FLEXIBLE" ? (
          <span className="inline-flex min-h-8 items-center rounded-full border-2 border-emerald-500/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-emerald-900 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-200">
            Flexible
          </span>
        ) : null}
        {formattedTime ? (
          <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400 sm:max-w-[9rem] sm:text-right">
            {formattedTime}
          </span>
        ) : null}
      </div>
    </div>
  );
}
