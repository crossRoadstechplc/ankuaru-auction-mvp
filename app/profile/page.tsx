"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { useUserAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import {
  useMyBlockedUsersQuery,
  useMyFollowersQuery,
  useMyFollowingQuery,
  useMyFollowRequestsQuery,
  useMyProfileQuery,
  useMyRatingSummaryQuery,
  useRemoveMyProfileImageMutation,
  useUpdateMyProfileMutation,
} from "@/src/features/profile/queries/hooks";
import { LoadingState } from "@/src/components/ui/loading-state";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth.store";
import EditProfileModal from "./components/EditProfileModal";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "./components/ProfileTabs";
import { ProfileContent } from "./components/ProfileContent";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("auctions");
  const { isAuthenticated } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useMyProfileQuery();
  const { data: followers = [] } = useMyFollowersQuery();
  const { data: following = [] } = useMyFollowingQuery();
  const { data: followRequests = [] } = useMyFollowRequestsQuery();
  const { data: blockedUsers = [] } = useMyBlockedUsersQuery();
  const { data: ratingSummary } = useMyRatingSummaryQuery();
  const { data: myAuctions = [], isLoading: myAuctionsLoading } =
    useUserAuctionsQuery(profile?.id || "");

  const updateProfileMutation = useUpdateMyProfileMutation();
  const removeProfileImageMutation = useRemoveMyProfileImageMutation();

  const pendingRequestsCount = followRequests.filter(
    (r) => String(r.status || "").toUpperCase() === "PENDING",
  ).length;

  const tabs = [
    { id: "auctions" as const, label: "Auctions", count: myAuctions.length },
    { id: "followers" as const, label: "Followers", count: followers.length },
    { id: "following" as const, label: "Following", count: following.length },
    { id: "requests" as const, label: "Requests", count: pendingRequestsCount },
    { id: "blocked" as const, label: "Blocked", count: blockedUsers.length },
  ];

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

  const profileWithRating = {
    ...profile,
    rating: ratingSummary?.user?.averageRating
      ? parseFloat(ratingSummary.user.averageRating)
      : profile.rating,
  };

  return (
    <PageShell>
      <PageContainer className="py-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 pt-6 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:px-6"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>

        <div className="mt-4 px-4 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <ProfileHeader
            profile={profileWithRating}
            auctionsCount={myAuctions.length}
            followersCount={followers.length}
            followingCount={following.length}
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit
                </button>
                <Link
                  href="/profile/settings"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  Settings
                </Link>
              </>
            }
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />

          <div className="min-h-[240px]">
            <ProfileContent
              activeTab={activeTab}
              auctions={myAuctions}
              isLoadingAuctions={myAuctionsLoading}
              followers={followers}
              following={following}
              followRequests={followRequests}
              blockedUsers={blockedUsers}
            />
          </div>
        </div>
        </div>
      </PageContainer>

      {isEditModalOpen && (
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
      )}
    </PageShell>
  );
}
