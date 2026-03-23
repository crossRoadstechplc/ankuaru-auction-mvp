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
import InstagramProfileLayout from "./components/InstagramProfileLayout";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      <PageContainer className="space-y-6 py-6 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>

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
          activeTab="posts"
          onTabChange={() => {}}
          actions={
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Profile
              </button>
              <Link
                href="/profile/settings"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-base">settings</span>
                Settings
              </Link>
              <Link
                href="/profile/requests"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-base">group_add</span>
                Requests
                {followRequests.length > 0 && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                    {followRequests.length}
                  </span>
                )}
              </Link>
              <Link
                href="/profile/blocked"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-base">block</span>
                Blocked
                {blockedUsers.length > 0 && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {blockedUsers.length}
                  </span>
                )}
              </Link>
            </div>
          }
          followersHref="/profile/followers"
          followingHref="/profile/following"
        />
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
