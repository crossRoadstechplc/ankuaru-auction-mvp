"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { useUserAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import {
  useFollowUserMutation,
  useMyFollowingQuery,
  useMySentFollowRequestsQuery,
  useUnfollowUserMutation,
  useUserProfileDetailsQuery,
} from "@/src/features/profile/queries/hooks";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { PublicProfileContent, type PublicProfileTab } from "./PublicProfileContent";

interface PublicUserProfileViewProps {
  userId: string;
  variant?: "modal" | "page";
}

export default function PublicUserProfileView({
  userId,
  variant = "page",
}: PublicUserProfileViewProps) {
  const router = useRouter();
  const authUserId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<PublicProfileTab>("auctions");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [optimisticRequestedId, setOptimisticRequestedId] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useUserProfileDetailsQuery(
    userId,
    !!userId,
  );
  const { data: auctions = [], isLoading: isLoadingAuctions } =
    useUserAuctionsQuery(userId);
  const { data: following = [] } = useMyFollowingQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();

  const isOwner = !!authUserId && authUserId === userId;

  const followingIds = useMemo(
    () => following.map((u) => u.id),
    [following],
  );
  const requestedIds = useMemo(() => {
    if (!authUserId) return [];
    const ids: string[] = [];
    for (const req of sentFollowRequests) {
      if (String(req.status || "").toUpperCase() !== "PENDING") continue;
      const targetId =
        req.requester?.id === authUserId ? req.target?.id : req.requester?.id;
      if (targetId) ids.push(targetId);
    }
    return ids;
  }, [sentFollowRequests, authUserId]);

  const isFollowing = followingIds.includes(userId);
  const isRequested = requestedIds.includes(userId);
  const effectiveRequestedIds = useMemo(
    () =>
      optimisticRequestedId && !requestedIds.includes(optimisticRequestedId)
        ? [...requestedIds, optimisticRequestedId]
        : requestedIds,
    [requestedIds, optimisticRequestedId],
  );

  const handleFollowToggle = async (
    targetUserId: string,
    shouldUnfollow = false,
  ) => {
    if (!targetUserId || actionLoadingId === targetUserId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      setActionLoadingId(targetUserId);
      if (shouldUnfollow) {
        await unfollowUserMutation.mutateAsync(targetUserId);
      } else {
        await followUserMutation.mutateAsync(targetUserId);
        if (targetUserId === userId) setOptimisticRequestedId(targetUserId);
      }
    } catch {
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setActionLoadingId((prev) => (prev === targetUserId ? null : prev));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState type="card" count={1} />
        <LoadingState type="list" count={3} />
      </div>
    );
  }

  if (error || !profile) {
    const isAuthError =
      error instanceof Error &&
      error.message.toLowerCase().includes("authentication required");

    return (
      <EmptyState
        iconName={isAuthError ? "lock" : "person_search"}
        title={isAuthError ? "Login Required" : "Profile Unavailable"}
        description={
          isAuthError
            ? "Sign in to open detailed user profiles, followers, and posted lots."
            : "We could not load this user profile right now."
        }
        action={
          isAuthError ? (
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          ) : null
        }
        className="min-h-[360px]"
      />
    );
  }

  const tabs = [
    { id: "auctions" as const, label: "Auctions", count: auctions.length },
    { id: "followers" as const, label: "Followers", count: profile.followersCount },
    { id: "following" as const, label: "Following", count: profile.followingCount },
  ];

  const headerActions = isOwner ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push("/profile")}
      className="gap-1.5"
    >
      <span className="material-symbols-outlined text-base">account_circle</span>
      My Profile
    </Button>
  ) : isFollowing ? (
    <>
      <span className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
        <span className="material-symbols-outlined mr-1 text-sm">check</span>
        Following
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={actionLoadingId === userId}
        onClick={() => void handleFollowToggle(userId, true)}
        className="h-9 gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">person_remove</span>
        {actionLoadingId === userId ? "..." : "Unfollow"}
      </Button>
    </>
  ) : isRequested || optimisticRequestedId === userId ? (
    <Button variant="outline" size="sm" disabled className="h-9 gap-1.5">
      <span className="material-symbols-outlined text-sm">schedule</span>
      Requested
    </Button>
  ) : (
    <Button
      size="sm"
      disabled={actionLoadingId === userId}
      onClick={() => void handleFollowToggle(userId)}
      className="h-9 gap-1.5"
    >
      <span className="material-symbols-outlined text-sm">person_add</span>
      {actionLoadingId === userId ? "..." : "Follow"}
    </Button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <ProfileHeader
        profile={profile}
        auctionsCount={auctions.length}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        actions={headerActions}
      />

      <ProfileTabs<PublicProfileTab>
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <div className="min-h-[240px]">
        <PublicProfileContent
          activeTab={activeTab}
          auctions={auctions}
          isLoadingAuctions={isLoadingAuctions}
          followers={profile.followers}
          following={profile.following}
          followingIds={followingIds}
          requestedIds={effectiveRequestedIds}
          loadingIds={actionLoadingId ? [actionLoadingId] : []}
          onFollow={(id) => void handleFollowToggle(id)}
          onUnfollow={(id) => void handleFollowToggle(id, true)}
        />
      </div>
    </div>
  );
}
