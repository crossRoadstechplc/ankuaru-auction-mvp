"use client";

import { EmptyState } from "@/src/components/ui/empty-state";
import { ProfileUserListRow } from "./ProfileUserListRow";
import type { Auction, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProfileAuctionList } from "./ProfileAuctionList";

export type PublicProfileTab = "auctions" | "followers" | "following";

interface PublicProfileContentProps {
  activeTab: PublicProfileTab;
  auctions: Auction[];
  isLoadingAuctions: boolean;
  followers: User[];
  following: User[];
  followingIds: string[];
  requestedIds: string[];
  loadingIds: string[];
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  getImageWithFallback?: (image?: string) => string;
}

export function PublicProfileContent({
  activeTab,
  auctions,
  isLoadingAuctions,
  followers,
  following,
  followingIds,
  requestedIds,
  loadingIds,
  onFollow,
  onUnfollow,
  getImageWithFallback,
}: PublicProfileContentProps) {
  // Auctions tab
  if (activeTab === "auctions") {
    return (
      <ProfileAuctionList
        auctions={auctions}
        isLoadingAuctions={isLoadingAuctions}
        emptyTitle="No auctions yet"
        emptyDescription="Posted auctions will appear here."
        getImageWithFallback={getImageWithFallback}
      />
    );
  }

  // Followers tab
  if (activeTab === "followers") {
    if (followers.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="group"
            title="No followers yet"
            description="Followers will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {followers.map((user) => (
            <ProfileUserListRow
              key={user.id}
              user={user}
              subtitle={user.bio}
              action={
                followingIds.includes(user.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingIds.includes(user.id)}
                    onClick={() => onUnfollow(user.id)}
                    className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    {loadingIds.includes(user.id) ? "..." : "Following"}
                  </Button>
                ) : requestedIds.includes(user.id) ? (
                  <Button variant="outline" size="sm" disabled className="h-8 rounded-lg">
                    Requested
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={loadingIds.includes(user.id)}
                    onClick={() => onFollow(user.id)}
                    className="h-8 rounded-lg"
                  >
                    {loadingIds.includes(user.id) ? "..." : "Follow"}
                  </Button>
                )
              }
            />
          ))}
        </div>
      </div>
    );
  }

  // Following tab
  if (activeTab === "following") {
    if (following.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="people"
            title="Not following anyone"
            description="Users they follow will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {following.map((user) => (
            <ProfileUserListRow
              key={user.id}
              user={user}
              subtitle={user.bio}
              action={
                followingIds.includes(user.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingIds.includes(user.id)}
                    onClick={() => onUnfollow(user.id)}
                    className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    {loadingIds.includes(user.id) ? "..." : "Following"}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={loadingIds.includes(user.id)}
                    onClick={() => onFollow(user.id)}
                    className="h-8 rounded-lg"
                  >
                    {loadingIds.includes(user.id) ? "..." : "Follow"}
                  </Button>
                )
              }
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
