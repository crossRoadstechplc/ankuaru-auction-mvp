"use client";

import { EmptyState } from "@/src/components/ui/empty-state";
import { ProfileUserListRow } from "./ProfileUserListRow";
import type { Auction, FollowRequest, User } from "@/lib/types";
import type { ProfileTab } from "./ProfileTabs";
import {
  useApproveFollowRequestMutation,
  useBlockUserMutation,
  useFollowUserMutation,
  useRejectFollowRequestMutation,
  useUnblockUserMutation,
  useUnfollowUserMutation,
} from "@/src/features/profile/queries/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { ProfileAuctionList } from "./ProfileAuctionList";
import { ProfilePagination } from "./ProfilePagination";

const USERS_PAGE_SIZE = 8;

interface ProfileContentProps {
  activeTab: ProfileTab;
  auctions: Auction[];
  isLoadingAuctions: boolean;
  followers: User[];
  following: User[];
  followRequests: FollowRequest[];
  blockedUsers: User[];
  getImageWithFallback?: (image?: string) => string;
}

export function ProfileContent({
  activeTab,
  auctions,
  isLoadingAuctions,
  followers,
  following,
  followRequests,
  blockedUsers,
  getImageWithFallback,
}: ProfileContentProps) {
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const approveRequestMutation = useApproveFollowRequestMutation();
  const rejectRequestMutation = useRejectFollowRequestMutation();
  const unblockUserMutation = useUnblockUserMutation();

  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [blockedPage, setBlockedPage] = useState(1);
  const [manualUserId, setManualUserId] = useState("");
  const [manualUserError, setManualUserError] = useState("");

  const followingIds = useMemo(
    () => new Set(following.map((user) => user.id)),
    [following],
  );
  const blockedIds = useMemo(
    () => new Set(blockedUsers.map((user) => user.id)),
    [blockedUsers],
  );

  const normalizedUserId = manualUserId.trim();
  const isManualActionLoading =
    !!normalizedUserId && loadingIds.has(normalizedUserId);

  const runAction = async ({
    id,
    execute,
    successMessage,
    errorMessage,
  }: {
    id: string;
    execute: () => Promise<unknown>;
    successMessage: string;
    errorMessage: string;
  }) => {
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      await execute();
      toast.success(successMessage);
      return true;
    } catch {
      toast.error(errorMessage);
      return false;
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleFollow = (userId: string) =>
    runAction({
      id: userId,
      execute: () => followUserMutation.mutateAsync(userId),
      successMessage: "Following!",
      errorMessage: "Failed to follow",
    });

  const handleUnfollow = (userId: string) =>
    runAction({
      id: userId,
      execute: () => unfollowUserMutation.mutateAsync(userId),
      successMessage: "Unfollowed",
      errorMessage: "Failed to unfollow",
    });

  const handleBlock = async (userId: string) => {
    const didBlock = await runAction({
      id: userId,
      execute: () => blockUserMutation.mutateAsync(userId),
      successMessage: "User blocked",
      errorMessage: "Failed to block user",
    });

    if (didBlock) {
      setManualUserError("");
    }

    return didBlock;
  };

  const handleApprove = (requestId: string) =>
    runAction({
      id: requestId,
      execute: () => approveRequestMutation.mutateAsync(requestId),
      successMessage: "Request approved!",
      errorMessage: "Failed to approve",
    });

  const handleReject = (requestId: string) =>
    runAction({
      id: requestId,
      execute: () => rejectRequestMutation.mutateAsync(requestId),
      successMessage: "Request rejected",
      errorMessage: "Failed to reject",
    });

  const handleUnblock = (userId: string) =>
    runAction({
      id: userId,
      execute: () => unblockUserMutation.mutateAsync(userId),
      successMessage: "User unblocked",
      errorMessage: "Failed to unblock",
    });

  const activeFollowersPage = Math.min(
    followersPage,
    Math.max(1, Math.ceil(followers.length / USERS_PAGE_SIZE)),
  );
  const activeFollowingPage = Math.min(
    followingPage,
    Math.max(1, Math.ceil(following.length / USERS_PAGE_SIZE)),
  );
  const activeBlockedPage = Math.min(
    blockedPage,
    Math.max(1, Math.ceil(blockedUsers.length / USERS_PAGE_SIZE)),
  );

  const paginatedFollowers = useMemo(() => {
    const startIndex = (activeFollowersPage - 1) * USERS_PAGE_SIZE;
    return followers.slice(startIndex, startIndex + USERS_PAGE_SIZE);
  }, [activeFollowersPage, followers]);

  const paginatedFollowing = useMemo(() => {
    const startIndex = (activeFollowingPage - 1) * USERS_PAGE_SIZE;
    return following.slice(startIndex, startIndex + USERS_PAGE_SIZE);
  }, [activeFollowingPage, following]);

  const paginatedBlockedUsers = useMemo(() => {
    const startIndex = (activeBlockedPage - 1) * USERS_PAGE_SIZE;
    return blockedUsers.slice(startIndex, startIndex + USERS_PAGE_SIZE);
  }, [activeBlockedPage, blockedUsers]);

  const renderRelationshipActions = (user: User, followLabel: string) => {
    const isBlocked = blockedIds.has(user.id);
    const isFollowing = followingIds.has(user.id);
    const isLoading = loadingIds.has(user.id);

    if (isBlocked) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => void handleUnblock(user.id)}
          className="h-8 rounded-lg"
        >
          {isLoading ? "..." : "Unblock"}
        </Button>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => void handleUnfollow(user.id)}
            className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            {isLoading ? "..." : "Following"}
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={() => void handleFollow(user.id)}
            className="h-8 rounded-lg"
          >
            {isLoading ? "..." : followLabel}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => void handleBlock(user.id)}
          className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {isLoading ? "..." : "Block"}
        </Button>
      </div>
    );
  };

  const handleManualBlock = async () => {
    if (!normalizedUserId) {
      setManualUserError("Please enter a user ID.");
      return;
    }

    if (blockedIds.has(normalizedUserId)) {
      setManualUserError("This user is already blocked.");
      return;
    }

    setManualUserError("");

    const didBlock = await handleBlock(normalizedUserId);
    if (didBlock) {
      setManualUserId("");
      setBlockedPage(1);
    }
  };

  if (activeTab === "auctions") {
    return (
      <ProfileAuctionList
        auctions={auctions}
        isLoadingAuctions={isLoadingAuctions}
        emptyTitle="No auctions yet"
        emptyDescription="Your posted auctions will appear here."
        getImageWithFallback={getImageWithFallback}
      />
    );
  }

  if (activeTab === "followers") {
    if (followers.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="group"
            title="No followers yet"
            description="Followers will appear here when people follow you."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {paginatedFollowers.map((user) => (
            <ProfileUserListRow
              key={user.id}
              user={user}
              subtitle={user.bio}
              action={renderRelationshipActions(user, "Follow back")}
            />
          ))}
        </div>

        <ProfilePagination
          currentPage={activeFollowersPage}
          pageSize={USERS_PAGE_SIZE}
          totalItems={followers.length}
          itemLabel="followers"
          onPageChange={setFollowersPage}
        />
      </div>
    );
  }

  if (activeTab === "following") {
    if (following.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="people"
            title="Not following anyone"
            description="Users you follow will appear here."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {paginatedFollowing.map((user) => (
            <ProfileUserListRow
              key={user.id}
              user={user}
              subtitle={user.bio}
              action={renderRelationshipActions(user, "Follow")}
            />
          ))}
        </div>

        <ProfilePagination
          currentPage={activeFollowingPage}
          pageSize={USERS_PAGE_SIZE}
          totalItems={following.length}
          itemLabel="accounts"
          onPageChange={setFollowingPage}
        />
      </div>
    );
  }

  if (activeTab === "requests") {
    const pendingRequests = followRequests.filter(
      (request) => String(request.status || "").toUpperCase() === "PENDING",
    );

    if (pendingRequests.length === 0) {
      return (
        <div className="p-8 sm:p-12">
          <EmptyState
            iconName="person_add_disabled"
            title="No pending requests"
            description="Follow requests will appear here."
          />
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {pendingRequests.map((request) => {
            const user = request.requester;
            const displayName = user.fullName || user.username || "User";
            const isDisabled = loadingIds.has(request.id);

            return (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <UserAvatar
                    src={user.avatar}
                    name={displayName}
                    size="md"
                    className="size-11 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      wants to follow you
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => void handleApprove(request.id)}
                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isDisabled ? "..." : "Accept"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => void handleReject(request.id)}
                    className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {isDisabled ? "..." : "Reject"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === "blocked") {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleManualBlock();
          }}
          className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30"
        >
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Block User By ID
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste a user ID to block an account directly.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={manualUserId}
                onChange={(event) => {
                  setManualUserId(event.target.value);
                  if (manualUserError) {
                    setManualUserError("");
                  }
                }}
                placeholder="Enter user ID"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
              />

              <Button
                type="submit"
                disabled={!normalizedUserId || isManualActionLoading}
                className="h-10 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {isManualActionLoading ? "Blocking..." : "Block User"}
              </Button>
            </div>

            {manualUserError ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {manualUserError}
              </p>
            ) : null}
          </div>
        </form>

        {blockedUsers.length === 0 ? (
          <div className="rounded-xl border border-slate-200/60 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
            <EmptyState
              iconName="block"
              title="No blocked users"
              description="Blocked users will appear here."
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200/60 overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
              {paginatedBlockedUsers.map((user) => (
                <ProfileUserListRow
                  key={user.id}
                  user={user}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingIds.has(user.id)}
                      onClick={() => void handleUnblock(user.id)}
                      className="h-8 rounded-lg"
                    >
                      {loadingIds.has(user.id) ? "..." : "Unblock"}
                    </Button>
                  }
                />
              ))}
            </div>

            <ProfilePagination
              currentPage={activeBlockedPage}
              pageSize={USERS_PAGE_SIZE}
              totalItems={blockedUsers.length}
              itemLabel="blocked users"
              onPageChange={setBlockedPage}
            />
          </>
        )}
      </div>
    );
  }

  return null;
}
