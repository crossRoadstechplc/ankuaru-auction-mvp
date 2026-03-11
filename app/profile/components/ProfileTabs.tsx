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
  followRequests: FollowRequest[];
  blockedUsers: User[];
  ratingSummary: RatingSummary;
  profile?: User;
  isLoadingSummary?: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  followers,
  following,
  followRequests,
  blockedUsers,
  ratingSummary,
  profile,
  isLoadingSummary,
}: ProfileTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    { id: "requests", label: "Requests", count: followRequests.length },
    { id: "blocked", label: "Blocked", count: blockedUsers.length },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6 h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card p-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.icon ? (
              <span className="material-symbols-outlined text-base">
                {tab.icon}
              </span>
            ) : null}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 ? (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 text-[10px] data-[state=active]:text-primary"
              >
                {tab.count}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PanelCard
            title="Account Information"
            description="Basic account details and membership info."
            bodyClassName="space-y-4"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium text-foreground">
                @{profile?.username || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">
                {profile?.email || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium text-foreground">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </PanelCard>

          <PanelCard
            title="Rating Summary"
            description="Your marketplace trust score at a glance."
            bodyClassName="space-y-4"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Rating</span>
              <span className="font-medium text-foreground">
                {isLoadingSummary
                  ? "..."
                  : `Rating ${ratingSummary.averageRating.toFixed(1)}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Reviews</span>
              <span className="font-medium text-foreground">
                {isLoadingSummary ? "..." : ratingSummary.totalRatings}
              </span>
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
            />
          </div>
        </PanelCard>
      </TabsContent>

      <TabsContent value="requests" className="mt-0">
        <FollowRequestsTab requests={followRequests} />
      </TabsContent>

      <TabsContent value="blocked" className="mt-0">
        <BlockedUsersTab users={blockedUsers} />
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <ProfileSettingsTab />
      </TabsContent>
    </Tabs>
  );
}
