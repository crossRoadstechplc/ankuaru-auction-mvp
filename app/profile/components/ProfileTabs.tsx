"use client";

import { FollowRequest, RatingSummary, User } from "../../../lib/types";
import BlockedUsersTab from "./BlockedUsersTab";
import FollowRequestsTab from "./FollowRequestsTab";
import ProfileSettingsTab from "./ProfileSettingsTab";
import UserList from "./UserList";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  followers: User[];
  following: User[];
  followRequests: FollowRequest[];
  blockedUsers: User[];
  ratingSummary: RatingSummary;
  profile?: User; // Add profile prop
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  followers,
  following,
  followRequests,
  blockedUsers,
  ratingSummary,
  profile, // Add profile parameter
}: ProfileTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    { id: "requests", label: "Follow Requests", count: followRequests.length },
    { id: "blocked", label: "Blocked Users", count: blockedUsers.length },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap relative ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {tab.icon || "person"}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Profile Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                    Account Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Username
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        @{profile?.username || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Email
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {profile?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Member Since
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                    Rating Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Average Rating
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        ⭐ {ratingSummary.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Total Reviews
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {ratingSummary.totalRatings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "followers" && (
          <UserList
            users={followers}
            title="Followers"
            emptyMessage="You don't have any followers yet."
            showFollowButton={false}
            showUnfollowButton={true}
          />
        )}

        {activeTab === "following" && (
          <UserList
            users={following}
            title="Following"
            emptyMessage="You're not following anyone yet."
            showFollowButton={false}
            showUnfollowButton={true}
          />
        )}

        {activeTab === "requests" && (
          <FollowRequestsTab requests={followRequests} />
        )}

        {activeTab === "blocked" && <BlockedUsersTab users={blockedUsers} />}

        {activeTab === "settings" && <ProfileSettingsTab />}
      </div>
    </div>
  );
}
