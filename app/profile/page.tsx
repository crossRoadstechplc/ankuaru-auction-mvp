"use client";

import { useState } from "react";
import StatsCard from "../../components/dashboard/StatsCard";
import {
    useMyBlockedUsers,
    useMyFollowers,
    useMyFollowing,
    useMyFollowRequests,
    useMyProfile,
    useMyRatingSummary,
    useUpdateMyProfile,
} from "../../hooks/useProfile";
import { useAuthStore } from "../../stores/auth.store";
import EditProfileModal from "./components/EditProfileModal";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated } = useAuthStore();

  // React Query hooks for data fetching
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: followers = [], isLoading: followersLoading } =
    useMyFollowers();
  const { data: following = [], isLoading: followingLoading } =
    useMyFollowing();
  const { data: followRequests = [], isLoading: requestsLoading } =
    useMyFollowRequests();
  const { data: blockedUsers = [], isLoading: blockedLoading } =
    useMyBlockedUsers();
  const { data: ratingSummary, isLoading: ratingLoading } =
    useMyRatingSummary();

  const updateProfileMutation = useUpdateMyProfile();

  if (!isAuthenticated) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Please Login
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </button>
        </div>
        {/* Profile Header */}
        <ProfileHeader
          profile={profile!}
          onEditProfile={() => setIsEditModalOpen(true)}
          followersCount={followers.length}
          followingCount={following.length}
          rating={
            ratingSummary?.user?.averageRating
              ? parseFloat(ratingSummary.user.averageRating)
              : 0
          }
        />

        {/* Profile Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Followers"
            value={followersLoading ? "..." : followers.length.toString()}
            icon="people"
          />
          <StatsCard
            label="Following"
            value={followingLoading ? "..." : following.length.toString()}
            icon="person_add"
          />
          <StatsCard
            label="Rating"
            value={
              ratingLoading
                ? "..."
                : ratingSummary?.user?.averageRating
                  ? parseFloat(ratingSummary.user.averageRating).toFixed(1)
                  : "0.0"
            }
            icon="star"
          />
          <StatsCard
            label="Reviews"
            value={
              ratingLoading
                ? "..."
                : ratingSummary?.user?.ratingsCount?.toString() || "0"
            }
            icon="review"
          />
        </div>

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          followers={followers}
          following={following}
          followRequests={followRequests}
          blockedUsers={blockedUsers}
          profile={profile}
          ratingSummary={{
            averageRating: ratingSummary?.user?.averageRating
              ? parseFloat(ratingSummary.user.averageRating)
              : 0,
            totalRatings: ratingSummary?.user?.ratingsCount || 0,
            ratingDistribution: {},
            recentReviews: [],
          }}
        />

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <EditProfileModal
            profile={profile!}
            onClose={() => setIsEditModalOpen(false)}
            onSave={async (data) => {
              try {
                await updateProfileMutation.mutateAsync(data);
                setIsEditModalOpen(false);
              } catch (error) {
                console.error("Failed to update profile:", error);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
