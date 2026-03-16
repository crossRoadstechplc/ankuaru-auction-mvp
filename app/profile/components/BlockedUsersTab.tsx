"use client";

import { useState } from "react";
import { User } from "../../../lib/types";
import UserList from "./UserList";

interface BlockedUsersTabProps {
  users: User[];
  loadingIds?: string[];
  onBlock?: (userId: string) => Promise<void> | void;
  onUnblock?: (userId: string) => void;
}

export default function BlockedUsersTab({
  users,
  loadingIds,
  onBlock,
  onUnblock,
}: BlockedUsersTabProps) {
  const [manualUserId, setManualUserId] = useState("");
  const [manualUserError, setManualUserError] = useState("");

  const normalizedUserId = manualUserId.trim();
  const isAlreadyBlocked = users.some((user) => user.id === normalizedUserId);
  const isManualActionLoading =
    !!normalizedUserId && (loadingIds ?? []).includes(normalizedUserId);

  const handleManualBlock = async () => {
    if (!normalizedUserId) {
      setManualUserError("Please enter a user ID.");
      return;
    }

    if (isAlreadyBlocked) {
      setManualUserError("This user is already blocked.");
      return;
    }

    if (!onBlock) {
      setManualUserError("Blocking is currently unavailable.");
      return;
    }

    try {
      setManualUserError("");
      await onBlock(normalizedUserId);
      setManualUserId("");
    } catch {
      // Parent handler already owns user-facing mutation errors.
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Block User By ID
            </h3>
            <p className="text-xs text-muted-foreground">
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
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                void handleManualBlock();
              }}
              disabled={!normalizedUserId || isManualActionLoading}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isManualActionLoading ? "Blocking..." : "Block User"}
            </button>
          </div>

          {manualUserError ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {manualUserError}
            </p>
          ) : null}
        </div>
      </div>

      <UserList
        users={users}
        title="Blocked Users"
        emptyMessage="You haven't blocked any users."
        showFollowButton={false}
        showUnfollowButton={false}
        showBlockButton={false}
        showUnblockButton={true}
        loadingIds={loadingIds}
        onUnblock={onUnblock}
      />
    </div>
  );
}
