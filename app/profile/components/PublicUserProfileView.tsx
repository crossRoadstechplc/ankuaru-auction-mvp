"use client";

import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionCard } from "@/src/components/domain/auction/auction-card";
import {
  FollowersList,
  FollowingList,
} from "@/src/components/domain/follow/follow-lists";
import { ProfileSummaryCard } from "@/src/components/domain/profile/profile-summary-card";
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
  const [activeTab, setActiveTab] = useState("overview");
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
  const displayName = profile?.fullName || profile?.username || "Marketplace User";
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
  const recentAuctions = variant === "modal" ? auctions.slice(0, 4) : auctions.slice(0, 6);
  const listedAuctions = auctions;
  const joinedDate = profile?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(profile.createdAt))
    : null;

  const handleFollowToggle = async (targetUserId: string, shouldUnfollow = false) => {
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
    <div className="flex flex-wrap justify-end gap-2">
      {!isOwner ? (
        isFollowing ? (
          <>
            <span className="inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
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
              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5"
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
            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
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
      <ProfileSummaryCard
        username={profile.username}
        displayName={profile.fullName}
        bio={profile.bio}
        avatarUrl={profile.avatar || profile.profileImageUrl}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        postsCount={postedLotsCount}
        ratingValue={profile.rating}
        joinedAt={profile.createdAt}
        actions={actions}
        onFollowersClick={() => setActiveTab("followers")}
        onFollowingClick={() => setActiveTab("following")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-xl border border-border/70 bg-card p-2">
          <TabsTrigger value="overview" className="rounded-lg px-4 py-2 text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="followers" className="rounded-lg px-4 py-2 text-sm">
            Followers
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {profile.followersCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="following" className="rounded-lg px-4 py-2 text-sm">
            Following
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {profile.followingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lots" className="rounded-lg px-4 py-2 text-sm">
            Lots
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {postedLotsCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <PanelCard
              title="Profile Overview"
              description="Identity, biography, and marketplace presence."
              bodyClassName="space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">@{profile.username}</Badge>
                <Badge variant={profile.isPrivate ? "default" : "secondary"}>
                  {profile.isPrivate ? "Private profile" : "Public profile"}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-foreground">
                {profile.bio || "No biography has been added yet."}
              </p>
            </PanelCard>

            <PanelCard
              title="Marketplace Snapshot"
              description="Quick trust and activity metrics."
              bodyClassName="space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-semibold text-foreground">
                  {profile.rating && profile.rating > 0
                    ? `${profile.rating.toFixed(1)} / 5`
                    : "Not rated yet"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-semibold text-foreground">
                  {profile.ratingsCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lots posted</span>
                <span className="font-semibold text-foreground">
                  {postedLotsCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-semibold text-foreground">
                  {joinedDate || "Unknown"}
                </span>
              </div>
            </PanelCard>
          </div>

          <PanelCard
            title="Recent Lots"
            description="Latest commodity listings from this user."
            action={
              postedLotsCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("lots")}
                >
                  View all lots
                </Button>
              ) : null
            }
          >
            {isLoadingAuctions ? (
              <LoadingState type="card" count={variant === "modal" ? 2 : 3} />
            ) : recentAuctions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recentAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.title}
                    images={auction.image ? [auction.image] : undefined}
                    sellerName={displayName}
                    sellerAvatar={profile.avatar || profile.profileImageUrl}
                    status={auction.status}
                    currentBidAmount={Number(
                      auction.currentBid ||
                        auction.winningBid ||
                        auction.reservePrice ||
                        auction.minBid ||
                        0,
                    )}
                    endAt={auction.endAt}
                    category={auction.auctionCategory}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                iconName="inventory_2"
                title="No Lots Yet"
                description="This user has not posted any marketplace lots yet."
                className="min-h-[220px]"
              />
            )}
          </PanelCard>
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
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
        </TabsContent>

        <TabsContent value="following" className="mt-4">
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
        </TabsContent>

        <TabsContent value="lots" className="mt-4">
          <PanelCard
            title="Posted Lots"
            description="All available lots published by this user."
          >
            {isLoadingAuctions ? (
              <LoadingState type="card" count={variant === "modal" ? 2 : 4} />
            ) : listedAuctions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {listedAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.title}
                    images={auction.image ? [auction.image] : undefined}
                    sellerName={displayName}
                    sellerAvatar={profile.avatar || profile.profileImageUrl}
                    status={auction.status}
                    currentBidAmount={Number(
                      auction.currentBid ||
                        auction.winningBid ||
                        auction.reservePrice ||
                        auction.minBid ||
                        0,
                    )}
                    endAt={auction.endAt}
                    category={auction.auctionCategory}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                iconName="inventory_2"
                title="No Lots Yet"
                description="There are no posted lots to show for this user."
                className="min-h-[220px]"
              />
            )}
          </PanelCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
