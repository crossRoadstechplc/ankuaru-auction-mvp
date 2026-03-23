"use client";

import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { FeedPostCard } from "@/app/feed/components/post/FeedPostCard";
import { ProfileUserListRow } from "./ProfileUserListRow";
import { getImageWithFallback } from "@/lib/imageUtils";
import type { Auction, FollowRequest, User } from "@/lib/types";
import type { ProfileTab } from "./ProfileTabs";
import {
  useApproveFollowRequestMutation,
  useFollowUserMutation,
  useRejectFollowRequestMutation,
  useUnblockUserMutation,
  useUnfollowUserMutation,
} from "@/src/features/profile/queries/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";

interface ProfileContentProps {
  activeTab: ProfileTab;
  auctions: Auction[];
  isLoadingAuctions: boolean;
  followers: User[];
  following: User[];
  followRequests: FollowRequest[];
  blockedUsers: User[];
  getImageWithFallback?: (image?: string) => string;
}

export function ProfileContent({
  activeTab,
  auctions,
  isLoadingAuctions,
  followers,
  following,
  followRequests,
  blockedUsers,
  getImageWithFallback: getImageFn,
}: ProfileContentProps) {
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();
  const approveRequestMutation = useApproveFollowRequestMutation();
  const rejectRequestMutation = useRejectFollowRequestMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleFollow = async (userId: string) => {
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await followUserMutation.mutateAsync(userId);
      toast.success("Following!");
    } catch {
      toast.error("Failed to follow");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await unfollowUserMutation.mutateAsync(userId);
      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleApprove = async (requestId: string) => {
    setLoadingIds((prev) => new Set(prev).add(requestId));
    try {
      await approveRequestMutation.mutateAsync(requestId);
      toast.success("Request approved!");
    } catch {
      toast.error("Failed to approve");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setLoadingIds((prev) => new Set(prev).add(requestId));
    try {
      await rejectRequestMutation.mutateAsync(requestId);
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleUnblock = async (userId: string) => {
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await unblockUserMutation.mutateAsync(userId);
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getImage = getImageFn ?? getImageWithFallback;

  // Auctions tab
  if (activeTab === "auctions") {
    if (isLoadingAuctions) {
      return (
        <div className="p-4 sm:p-6">
          <LoadingState type="card" count={6} />
        </div>
      );
    }

    if (auctions.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="photo_library"
            title="No auctions yet"
            description="Your posted auctions will appear here."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Posted Auctions ({auctions.length})
        </p>
        <div className="space-y-4">
          {auctions.map((auction) => (
            <FeedPostCard
              key={auction.id}
              auction={auction}
              getImageWithFallback={getImage}
            />
          ))}
        </div>
      </div>
    );
  }

  // Followers tab
  if (activeTab === "followers") {
    if (followers.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="group"
            title="No followers yet"
            description="Followers will appear here when people follow you."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
        {followers.map((user) => (
          <ProfileUserListRow
            key={user.id}
            user={user}
            subtitle={user.bio}
            action={
              user.isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingIds.has(user.id)}
                  onClick={() => void handleUnfollow(user.id)}
                  className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  {loadingIds.has(user.id) ? "..." : "Following"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  disabled={loadingIds.has(user.id)}
                  onClick={() => void handleFollow(user.id)}
                  className="h-8 rounded-lg"
                >
                  {loadingIds.has(user.id) ? "..." : "Follow back"}
                </Button>
              )
            }
          />
        ))}
        </div>
      </div>
    );
  }

  // Following tab
  if (activeTab === "following") {
    if (following.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="people"
            title="Not following anyone"
            description="Users you follow will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
        {following.map((user) => (
          <ProfileUserListRow
            key={user.id}
            user={user}
            subtitle={user.bio}
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={loadingIds.has(user.id)}
                onClick={() => void handleUnfollow(user.id)}
                className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {loadingIds.has(user.id) ? "..." : "Following"}
              </Button>
            }
          />
        ))}
        </div>
      </div>
    );
  }

  // Requests tab
  if (activeTab === "requests") {
    const pendingRequests = followRequests.filter(
      (r) => String(r.status || "").toUpperCase() === "PENDING",
    );

    if (pendingRequests.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="person_add_disabled"
            title="No pending requests"
            description="Follow requests will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
        {pendingRequests.map((request) => {
          const user = request.requester;
          const displayName = user.fullName || user.username || "User";
          const isDisabled = loadingIds.has(request.id);

          return (
            <div
              key={request.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar
                  src={user.avatar}
                  name={displayName}
                  size="md"
                  className="size-11 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    wants to follow you
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => void handleApprove(request.id)}
                  className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  {isDisabled ? "..." : "Accept"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => void handleReject(request.id)}
                  className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {isDisabled ? "..." : "Reject"}
                </Button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

  // Blocked tab
  if (activeTab === "blocked") {
    if (blockedUsers.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="block"
            title="No blocked users"
            description="Blocked users will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
        {blockedUsers.map((user) => (
          <ProfileUserListRow
            key={user.id}
            user={user}
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={loadingIds.has(user.id)}
                onClick={() => void handleUnblock(user.id)}
                className="h-8 rounded-lg"
              >
                {loadingIds.has(user.id) ? "..." : "Unblock"}
              </Button>
            }
          />
        ))}
        </div>
      </div>
    );
  }

  return null;
}
