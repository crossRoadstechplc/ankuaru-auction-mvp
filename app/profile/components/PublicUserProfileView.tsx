"use client";

import { PanelCard } from "@/components/layout/panel-card";
import { Button } from "@/components/ui/button";
import {
  FollowersList,
  FollowingList,
} from "@/src/components/domain/follow/follow-lists";
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
import InstagramProfileLayout from "./InstagramProfileLayout";

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
  const [activeGridTab, setActiveGridTab] = useState<"posts">("posts");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
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
    () => following.map((user) => user.id),
    [following],
  );
  const requestedIds = useMemo(
    () =>
      sentFollowRequests
        .filter((request) => request.status === "PENDING")
        .map((request) => request.target.id)
        .filter((requestUserId) => !!requestUserId),
    [sentFollowRequests],
  );
  const isFollowing = followingIds.includes(userId);
  const isRequested = requestedIds.includes(userId);
  const postedLotsCount = auctions.length;

  const handleFollowToggle = async (
    targetUserId: string,
    shouldUnfollow = false,
  ) => {
    if (!targetUserId || actionLoadingId === targetUserId) {
      return;
    }

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
      }
    } catch (actionError) {
      console.error("Profile follow action failed:", actionError);
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setActionLoadingId((current) =>
        current === targetUserId ? null : current,
      );
    }
  };

  const handleOpenFullProfile = () => {
    router.push(isOwner ? "/profile" : `/profile/${userId}`);
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

  const actions = (
    <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
      {!isOwner ? (
        isFollowing ? (
          <>
            <span className="inline-flex items-center rounded-xl border border-border/70 bg-card px-3 py-2 text-sm font-semibold text-foreground">
              <span className="material-symbols-outlined mr-1 text-sm">
                check
              </span>
              Following
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoadingId === userId}
              onClick={() => void handleFollowToggle(userId, true)}
              className="gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">
                person_remove
              </span>
              {actionLoadingId === userId ? "..." : "Unfollow"}
            </Button>
          </>
        ) : isRequested ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            Requested
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={actionLoadingId === userId}
            onClick={() => void handleFollowToggle(userId)}
            className="gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            {actionLoadingId === userId ? "Following..." : "Follow"}
          </Button>
        )
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/profile")}
          className="gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">account_circle</span>
          My Profile
        </Button>
      )}

      {variant === "modal" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenFullProfile}
          className="gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Open Page
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <InstagramProfileLayout
        profile={profile}
        auctions={auctions}
        isLoadingAuctions={isLoadingAuctions}
        activeTab={activeGridTab}
        onTabChange={setActiveGridTab}
        actions={actions}
        compact={variant === "modal"}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelCard
          title="Followers"
          description="Users who follow this profile."
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowersList
              followers={profile.followers.map((user) => ({
                userId: user.id,
                username: user.username,
                displayName: user.fullName,
                avatarUrl: user.avatar || user.profileImageUrl,
              }))}
              followingIds={followingIds}
              requestedIds={requestedIds}
              loadingIds={actionLoadingId ? [actionLoadingId] : []}
              onFollow={(targetUserId) => void handleFollowToggle(targetUserId)}
              onUnfollow={(targetUserId) =>
                void handleFollowToggle(targetUserId, true)
              }
            />
          </div>
        </PanelCard>

        <PanelCard
          title="Following"
          description="Accounts this user currently follows."
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowingList
              following={profile.following.map((user) => ({
                userId: user.id,
                username: user.username,
                displayName: user.fullName,
                avatarUrl: user.avatar || user.profileImageUrl,
              }))}
              loadingIds={actionLoadingId ? [actionLoadingId] : []}
              onUnfollow={(targetUserId) =>
                void handleFollowToggle(targetUserId, true)
              }
            />
          </div>
        </PanelCard>
      </div>

      <PanelCard
        title="Marketplace Snapshot"
        description="Quick trust and activity metrics."
        bodyClassName="space-y-3"
      >
        <div className="grid gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground">Lots posted</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {postedLotsCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground">Followers</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.followersCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground">Following</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.followingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground">Reviews</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.ratingsCount}
            </p>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
