"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProfileActionsProps {
  /** If true, shows the owner's own edit button */
  isOwner?: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
  /** Follow state for viewer actions */
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  className?: string;
}

export function ProfileActions({
  isOwner,
  onEdit,
  onSettings,
  isFollowing,
  isFollowLoading,
  onFollow,
  onUnfollow,
  className,
}: ProfileActionsProps) {
  // Owner view
  if (isOwner) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Profile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          className="gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          Settings
        </Button>
      </div>
    );
  }

  // Viewer view — follow/unfollow
  if (isFollowing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold border border-primary/20 text-primary bg-primary/5">
          <span className="material-symbols-outlined text-sm">check</span>
          Following
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onUnfollow}
          disabled={isFollowLoading}
          className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">
            person_remove
          </span>
          {isFollowLoading ? "..." : "Unfollow"}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        onClick={onFollow}
        disabled={isFollowLoading}
        className="gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">person_add</span>
        {isFollowLoading ? "Following..." : "Follow"}
      </Button>
    </div>
  );
}
