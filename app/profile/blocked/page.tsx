"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import {
  useBlockUserMutation,
  useMyBlockedUsersQuery,
  useUnblockUserMutation,
} from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import BlockedUsersTab from "../components/BlockedUsersTab";

export default function ProfileBlockedPage() {
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | null>(null);
  const { data: blockedUsers = [] } = useMyBlockedUsersQuery();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const actionLoadingIds = userActionLoadingId ? [userActionLoadingId] : [];

  const handleBlock = async (userId: string) => {
    if (!userId || userActionLoadingId === userId) return;
    try {
      setUserActionLoadingId(userId);
      await blockUserMutation.mutateAsync(userId);
      toast.success("User blocked successfully.");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user. Please try again.");
      throw error;
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
          title="Blocked Users"
          description="Accounts you have blocked."
          action={
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {blockedUsers.length} {blockedUsers.length === 1 ? "user" : "users"}
            </span>
          }
        >
          <BlockedUsersTab
            users={blockedUsers}
            loadingIds={actionLoadingIds}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
          />
        </PanelCard>
      </PageContainer>
    </PageShell>
  );
}
