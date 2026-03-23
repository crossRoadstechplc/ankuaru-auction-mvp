"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import {
  FollowingList,
} from "@/src/components/domain/follow/follow-lists";
import {
  useMyBlockedUsersQuery,
  useBlockUserMutation,
  useMyFollowingQuery,
  useUnblockUserMutation,
  useUnfollowUserMutation,
} from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileFollowingPage() {
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | null>(null);
  const { data: following = [], isLoading } = useMyFollowingQuery();
  const { data: blockedUsers = [] } = useMyBlockedUsersQuery();

  const unfollowUserMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();

  const blockedIds = blockedUsers.map((u) => u.id);
  const actionLoadingIds = userActionLoadingId ? [userActionLoadingId] : [];

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
          title="Following"
          description="Accounts you currently follow."
          action={
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {following.length} {following.length === 1 ? "account" : "accounts"}
            </span>
          }
          bodyClassName="p-0"
        >
          <div className="p-6">
            <FollowingList
              following={following.map((f) => ({
                userId: f.id,
                username: f.username,
                displayName: f.fullName,
                avatarUrl: f.avatar || f.profileImageUrl,
              }))}
              blockedIds={blockedIds}
              loadingIds={actionLoadingIds}
              isLoading={isLoading}
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
