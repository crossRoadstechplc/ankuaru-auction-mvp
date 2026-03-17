"use client";

import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FollowersList,
  FollowingList,
} from "@/src/components/domain/follow/follow-lists";
import { FollowRequest, RatingSummary, User } from "../../../lib/types";
import BlockedUsersTab from "./BlockedUsersTab";
import FollowRequestsTab from "./FollowRequestsTab";
import ProfileSettingsTab from "./ProfileSettingsTab";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  followers: User[];
  following: User[];
  followingIds: string[];
  requestedIds: string[];
  blockedIds: string[];
  followRequests: FollowRequest[];
  sentFollowRequests: FollowRequest[];
  blockedUsers: User[];
  ratingSummary: RatingSummary;
  profile?: User;
  isLoadingSummary?: boolean;
  isFollowersLoading?: boolean;
  isFollowingLoading?: boolean;
  actionLoadingIds?: string[];
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  onBlockUser?: (userId: string) => Promise<void> | void;
  onUnblockUser?: (userId: string) => void;
}

function formatCompactCount(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return value.toLocaleString();
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  followers,
  following,
  followingIds,
  requestedIds,
  blockedIds,
  followRequests,
  sentFollowRequests,
  blockedUsers,
  ratingSummary,
  profile,
  isLoadingSummary,
  isFollowersLoading,
  isFollowingLoading,
  actionLoadingIds = [],
  onFollowUser,
  onUnfollowUser,
  onBlockUser,
  onUnblockUser,
}: ProfileTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    {
      id: "requests",
      label: "Requests",
      count: followRequests.length + sentFollowRequests.length,
    },
    { id: "blocked", label: "Blocked", count: blockedUsers.length },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6 h-auto w-full justify-start gap-2 overflow-x-auto rounded-[24px] border border-border/70 bg-card p-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            {tab.icon ? (
              <span className="material-symbols-outlined text-[18px]">
                {tab.icon}
              </span>
            ) : null}
            <span>{tab.label}</span>
            {tab.count !== undefined ? (
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px]"
              >
                {formatCompactCount(tab.count)}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Followers</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                group
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {formatCompactCount(followers.length)}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Following</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                person_add
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {formatCompactCount(following.length)}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Requests</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                group_add
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {formatCompactCount(
                followRequests.length + sentFollowRequests.length,
              )}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blocked</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                block
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {formatCompactCount(blockedUsers.length)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PanelCard
            title="Account Information"
            description="Basic account details and membership info."
            bodyClassName="space-y-3"
          >
            <InfoRow
              label="Username"
              value={`@${profile?.username || "N/A"}`}
            />
            <InfoRow label="Email" value={profile?.email || "N/A"} />
            <InfoRow
              label="Member Since"
              value={
                profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </PanelCard>

          <PanelCard
            title="Rating Summary"
            description="Your marketplace trust score at a glance."
            bodyClassName="space-y-4"
          >
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold text-foreground">
                  {isLoadingSummary
                    ? "..."
                    : ratingSummary.averageRating.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="material-symbols-outlined text-[18px]"
                    >
                      {index < Math.round(ratingSummary.averageRating)
                        ? "star"
                        : "star_outline"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {isLoadingSummary
                  ? "..."
                  : formatCompactCount(ratingSummary.totalRatings)}
              </p>
            </div>
          </PanelCard>
        </div>
      </TabsContent>

      <TabsContent value="followers" className="mt-0">
        <PanelCard
          title="Followers"
          description="People who follow your activity."
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowersList
              followers={followers.map((f) => ({
                userId: f.id,
                username: f.username,
                displayName: f.fullName,
                avatarUrl: f.avatar,
              }))}
              followingIds={followingIds}
              requestedIds={requestedIds}
              blockedIds={blockedIds}
              loadingIds={actionLoadingIds}
              isLoading={isFollowersLoading}
              onFollow={onFollowUser}
              onUnfollow={onUnfollowUser}
              onBlock={onBlockUser}
              onUnblock={onUnblockUser}
            />
          </div>
        </PanelCard>
      </TabsContent>

      <TabsContent value="following" className="mt-0">
        <PanelCard
          title="Following"
          description="Accounts you currently follow."
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowingList
              following={following.map((f) => ({
                userId: f.id,
                username: f.username,
                displayName: f.fullName,
                avatarUrl: f.avatar,
              }))}
              blockedIds={blockedIds}
              loadingIds={actionLoadingIds}
              isLoading={isFollowingLoading}
              onUnfollow={onUnfollowUser}
              onBlock={onBlockUser}
              onUnblock={onUnblockUser}
            />
          </div>
        </PanelCard>
      </TabsContent>

      <TabsContent value="requests" className="mt-0">
        <FollowRequestsTab
          requests={followRequests}
          sentRequests={sentFollowRequests}
        />
      </TabsContent>

      <TabsContent value="blocked" className="mt-0">
        <BlockedUsersTab
          users={blockedUsers}
          loadingIds={actionLoadingIds}
          onBlock={onBlockUser}
          onUnblock={onUnblockUser}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <ProfileSettingsTab />
      </TabsContent>
    </Tabs>
  );
}
