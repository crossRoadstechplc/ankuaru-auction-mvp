"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { Button } from "@/components/ui/button";
import { useUserAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import {
  useMyBlockedUsersQuery,
  useBlockUserMutation,
  useFollowUserMutation,
  useMyFollowersQuery,
  useMyFollowingQuery,
  useMyFollowRequestsQuery,
  useMyProfileQuery,
  useMyRatingSummaryQuery,
  useMySentFollowRequestsQuery,
  useRemoveMyProfileImageMutation,
  useUnblockUserMutation,
  useUnfollowUserMutation,
  useUpdateMyProfileMutation,
} from "@/src/features/profile/queries/hooks";
import { LoadingState } from "@/src/components/ui/loading-state";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth.store";
import EditProfileModal from "./components/EditProfileModal";
import InstagramProfileLayout from "./components/InstagramProfileLayout";
import ProfileTabs from "./components/ProfileTabs";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeGridTab, setActiveGridTab] = useState<"posts">("posts");
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | null>(
    null,
  );
  const { isAuthenticated, userId: authUserId } = useAuthStore();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");

  const { data: profile, isLoading: profileLoading } = useMyProfileQuery();
  const { data: followers = [], isLoading: followersLoading } =
    useMyFollowersQuery();
  const { data: following = [], isLoading: followingLoading } =
    useMyFollowingQuery();
  const { data: followRequests = [] } = useMyFollowRequestsQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();
  const { data: blockedUsers = [] } = useMyBlockedUsersQuery();
  const { data: ratingSummary, isLoading: ratingLoading } =
    useMyRatingSummaryQuery();
  const { data: myAuctions = [], isLoading: myAuctionsLoading } =
    useUserAuctionsQuery(profile?.id || "");

  const updateProfileMutation = useUpdateMyProfileMutation();
  const removeProfileImageMutation = useRemoveMyProfileImageMutation();
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const completionItems = [
    Boolean(profile?.fullName),
    Boolean(profile?.bio),
    Boolean(profile?.avatar || profile?.profileImageUrl),
    Boolean(profile?.email),
  ];
  const completionPercent = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );
  const followingIds = following.map((user) => user.id);
  const requestedIds = (() => {
    const currentUserId = authUserId || profile?.id;
    if (!currentUserId) return [];
    return sentFollowRequests
      .filter(
        (request) =>
          String(request.status || "").toUpperCase() === "PENDING",
      )
      .map((request) => {
        const requestedUserId =
          request.requester?.id === currentUserId
            ? request.target?.id
            : request.target?.id || request.requester?.id;
        return requestedUserId;
      })
      .filter((id): id is string => !!id);
  })();
  const blockedIds = blockedUsers.map((user) => user.id);

  useEffect(() => {
    if (!requestedTab) {
      return;
    }

    const allowedTabs = new Set([
      "overview",
      "followers",
      "following",
      "requests",
      "blocked",
      "settings",
    ]);

    if (allowedTabs.has(requestedTab)) {
      setActiveTab((currentTab) =>
        currentTab === requestedTab ? currentTab : requestedTab,
      );
    }
  }, [requestedTab]);

  const handleFollowUser = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) {
      return;
    }

    try {
      setUserActionLoadingId(userId);
      await followUserMutation.mutateAsync(userId);
      toast.success("User followed successfully.");
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user. Please try again.");
    } finally {
      setUserActionLoadingId((current) =>
        current === userId ? null : current,
      );
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) {
      return;
    }

    try {
      setUserActionLoadingId(userId);
      await unfollowUserMutation.mutateAsync(userId);
      toast.success("User unfollowed successfully.");
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast.error("Failed to unfollow user. Please try again.");
    } finally {
      setUserActionLoadingId((current) =>
        current === userId ? null : current,
      );
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) {
      return;
    }

    try {
      setUserActionLoadingId(userId);
      await blockUserMutation.mutateAsync(userId);
      toast.success("User blocked successfully.");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user. Please try again.");
    } finally {
      setUserActionLoadingId((current) =>
        current === userId ? null : current,
      );
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) {
      return;
    }

    try {
      setUserActionLoadingId(userId);
      await unblockUserMutation.mutateAsync(userId);
      toast.success("User unblocked successfully.");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user. Please try again.");
    } finally {
      setUserActionLoadingId((current) =>
        current === userId ? null : current,
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <PageShell>
        <PageContainer className="flex h-[50vh] items-center justify-center text-center">
          <div>
            <h2 className="mb-2 text-2xl font-bold">Please Login</h2>
            <p className="text-muted-foreground">
              You need to be logged in to view your profile.
            </p>
          </div>
        </PageContainer>
      </PageShell>
    );
  }

  if (profileLoading) {
    return (
      <PageShell>
        <PageContainer className="py-8">
          <LoadingState type="card" count={1} className="mb-8" />
          <LoadingState type="list" count={3} />
        </PageContainer>
      </PageShell>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <PageShell>
      <PageContainer>
        <PageHeader
          title="My Profile"
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Back to Home
            </Button>
          }
        />

        <PageSection>
          <InstagramProfileLayout
            profile={{
              ...profile,
              followersCount: followers.length,
              followingCount: following.length,
              rating: ratingSummary?.user?.averageRating
                ? parseFloat(ratingSummary.user.averageRating)
                : profile.rating,
            }}
            auctions={myAuctions}
            isLoadingAuctions={myAuctionsLoading}
            activeTab={activeGridTab}
            onTabChange={setActiveGridTab}
            actions={
              <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                <Button
                  className="gap-2"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                  Edit Profile
                </Button>
                <Button
                  className="gap-2"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <span className="material-symbols-outlined text-sm">
                    settings
                  </span>
                  Settings
                </Button>
                <Button
                  className="gap-2"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("requests")}
                >
                  <span className="material-symbols-outlined text-sm">
                    group_add
                  </span>
                  Requests
                </Button>
              </div>
            }
          />
        </PageSection>

        <PageSection>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                followers={followers}
                following={following}
                followRequests={followRequests}
                sentFollowRequests={sentFollowRequests}
                blockedUsers={blockedUsers}
                followingIds={followingIds}
                requestedIds={requestedIds}
                blockedIds={blockedIds}
                actionLoadingIds={
                  userActionLoadingId ? [userActionLoadingId] : []
                }
                isFollowersLoading={followersLoading}
                isFollowingLoading={followingLoading}
                onFollowUser={handleFollowUser}
                onUnfollowUser={handleUnfollowUser}
                onBlockUser={handleBlockUser}
                onUnblockUser={handleUnblockUser}
                profile={profile}
                isLoadingSummary={ratingLoading}
                ratingSummary={{
                  averageRating: ratingSummary?.user?.averageRating
                    ? parseFloat(ratingSummary.user.averageRating)
                    : 0,
                  totalRatings: ratingSummary?.user?.ratingsCount || 0,
                  ratingDistribution: {},
                  recentReviews: [],
                }}
              />
            </div>

            <div className="space-y-6">
              <PanelCard
                title="Account Health"
                description="Recommended updates for a stronger profile."
                bodyClassName="space-y-3"
              >
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Profile Completion
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {completionPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bio Added</span>
                    <span className="font-medium text-foreground">
                      {profile.bio ? "Complete" : "Missing"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avatar Added</span>
                    <span className="font-medium text-foreground">
                      {profile.avatar || profile.profileImageUrl
                        ? "Complete"
                        : "Missing"}
                    </span>
                  </div>
                </div>
              </PanelCard>
            </div>
          </div>
        </PageSection>

        {isEditModalOpen ? (
          <EditProfileModal
            profile={profile}
            onClose={() => setIsEditModalOpen(false)}
            onSave={async (data) => {
              try {
                await updateProfileMutation.mutateAsync(data);
                toast.success("Profile updated successfully!");
                setIsEditModalOpen(false);
              } catch (error) {
                console.error("Failed to update profile:", error);
                toast.error("Failed to update profile. Please try again.");
              }
            }}
            onRemoveImage={async () => {
              try {
                await removeProfileImageMutation.mutateAsync();
                toast.success("Profile image removed successfully!");
              } catch (error) {
                console.error("Failed to remove profile image:", error);
                toast.error(
                  "Failed to remove profile image. Please try again.",
                );
              }
            }}
          />
        ) : null}
      </PageContainer>
    </PageShell>
  );
}
