"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import {
  FollowersList,
} from "@/src/components/domain/follow/follow-lists";
import {
  useMyBlockedUsersQuery,
  useBlockUserMutation,
  useFollowUserMutation,
  useMyFollowersQuery,
  useMyFollowingQuery,
  useMyFollowRequestsQuery,
  useMySentFollowRequestsQuery,
  useUnblockUserMutation,
  useUnfollowUserMutation,
} from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

export default function ProfileFollowersPage() {
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | null>(null);
  const { userId: authUserId } = useAuthStore();
  const { data: followers = [], isLoading } = useMyFollowersQuery();
  const { data: following = [] } = useMyFollowingQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();
  const { data: blockedUsers = [] } = useMyBlockedUsersQuery();

  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();

  const followingIds = following.map((u) => u.id);
  const requestedIds = (() => {
    if (!authUserId) return [];
    return sentFollowRequests
      .filter((r) => String(r.status || "").toUpperCase() === "PENDING")
      .map((r) =>
        r.requester?.id === authUserId ? r.target?.id : r.target?.id || r.requester?.id,
      )
      .filter((id): id is string => !!id);
  })();
  const blockedIds = blockedUsers.map((u) => u.id);
  const actionLoadingIds = userActionLoadingId ? [userActionLoadingId] : [];

  const handleFollow = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) return;
    try {
      setUserActionLoadingId(userId);
      await followUserMutation.mutateAsync(userId);
      toast.success("User followed successfully.");
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user. Please try again.");
    } finally {
      setUserActionLoadingId((c) => (c === userId ? null : c));
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) return;
    try {
      setUserActionLoadingId(userId);
      await unfollowUserMutation.mutateAsync(userId);
      toast.success("User unfollowed successfully.");
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast.error("Failed to unfollow user. Please try again.");
    } finally {
      setUserActionLoadingId((c) => (c === userId ? null : c));
    }
  };

  const handleBlock = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) return;
    try {
      setUserActionLoadingId(userId);
      await blockUserMutation.mutateAsync(userId);
      toast.success("User blocked successfully.");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user. Please try again.");
    } finally {
      setUserActionLoadingId((c) => (c === userId ? null : c));
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) return;
    try {
      setUserActionLoadingId(userId);
      await unblockUserMutation.mutateAsync(userId);
      toast.success("User unblocked successfully.");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user. Please try again.");
    } finally {
      setUserActionLoadingId((c) => (c === userId ? null : c));
    }
  };

  return (
    <PageShell>
      <PageContainer className="space-y-6 py-6 md:py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to profile
        </Link>

        <PanelCard
          title="Followers"
          description="People who follow your activity."
          action={
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {followers.length} {followers.length === 1 ? "person" : "people"}
            </span>
          }
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowersList
              followers={followers.map((f) => ({
                userId: f.id,
                username: f.username,
                displayName: f.fullName,
                avatarUrl: f.avatar || f.profileImageUrl,
              }))}
              followingIds={followingIds}
              requestedIds={requestedIds}
              blockedIds={blockedIds}
              loadingIds={actionLoadingIds}
              isLoading={isLoading}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
            />
          </div>
        </PanelCard>
      </PageContainer>
    </PageShell>
  );
}
