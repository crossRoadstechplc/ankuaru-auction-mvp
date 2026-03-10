"use client";

import { User } from "../../../lib/types";
import { 
  useFollowUser, 
  useUnfollowUser, 
  useBlockUser, 
  useUnblockUser 
} from "../../../hooks/useProfile";
import { toast } from "sonner";

interface UserListProps {
  users: User[];
  title: string;
  emptyMessage: string;
  showFollowButton?: boolean;
  showUnfollowButton?: boolean;
  showBlockButton?: boolean;
  showUnblockButton?: boolean;
}

export default function UserList({
  users,
  title,
  emptyMessage,
  showFollowButton = false,
  showUnfollowButton = false,
  showBlockButton = false,
  showUnblockButton = false,
}: UserListProps) {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const handleFollow = async (userId: string) => {
    try {
      await followMutation.mutateAsync(userId);
      toast.success("User followed successfully!");
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowMutation.mutateAsync(userId);
      toast.success("User unfollowed successfully!");
    } catch (error) {
      toast.error("Failed to unfollow user");
    }
  };

  const handleBlock = async (userId: string) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;
    
    try {
      await blockMutation.mutateAsync(userId);
      toast.success("User blocked successfully!");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockMutation.mutateAsync(userId);
      toast.success("User unblocked successfully!");
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl text-slate-400">
            person_off
          </span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No {title.toLowerCase()}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title} ({users.length})
      </h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName || user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-xl text-slate-400 dark:text-slate-500">
                    person
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {user.fullName || user.username}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  @{user.username}
                </p>
                {user.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-xs text-amber-500">
                      star
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showFollowButton && (
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={followMutation.isPending && followMutation.variables === user.id}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {followMutation.isPending && followMutation.variables === user.id ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    "Follow"
                  )}
                </button>
              )}

              {showUnfollowButton && (
                <button
                  onClick={() => handleUnfollow(user.id)}
                  disabled={unfollowMutation.isPending && unfollowMutation.variables === user.id}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unfollowMutation.isPending && unfollowMutation.variables === user.id ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    "Unfollow"
                  )}
                </button>
              )}

              {showBlockButton && (
                <button
                  onClick={() => handleBlock(user.id)}
                  disabled={blockMutation.isPending && blockMutation.variables === user.id}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {blockMutation.isPending && blockMutation.variables === user.id ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    "Block"
                  )}
                </button>
              )}

              {showUnblockButton && (
                <button
                  onClick={() => handleUnblock(user.id)}
                  disabled={unblockMutation.isPending && unblockMutation.variables === user.id}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unblockMutation.isPending && unblockMutation.variables === user.id ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    "Unblock"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
