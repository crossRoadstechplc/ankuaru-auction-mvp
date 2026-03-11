import { cn } from "@/lib/utils";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { FollowUserRow, FollowUserRowProps } from "./follow-user-row";

export interface FollowersListProps {
  followers: Omit<
    FollowUserRowProps,
    "onFollow" | "onUnfollow" | "isFollowing"
  >[];
  followingIds?: string[];
  loadingIds?: string[];
  isLoading?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  className?: string;
}

export function FollowersList({
  followers,
  followingIds = [],
  loadingIds = [],
  isLoading,
  onFollow,
  onUnfollow,
  className,
}: FollowersListProps) {
  if (isLoading)
    return <LoadingState type="list" count={4} className={className} />;

  if (!followers.length) {
    return (
      <EmptyState
        iconName="group"
        title="No Followers Yet"
        description="When people follow you, they'll appear here."
        className={cn("min-h-[200px]", className)}
      />
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {followers.map((f) => (
        <FollowUserRow
          key={f.userId}
          {...f}
          isFollowing={followingIds.includes(f.userId)}
          isLoading={loadingIds.includes(f.userId)}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
        />
      ))}
    </div>
  );
}

export interface FollowingListProps {
  following: Omit<
    FollowUserRowProps,
    "onFollow" | "onUnfollow" | "isFollowing"
  >[];
  isLoading?: boolean;
  loadingIds?: string[];
  onUnfollow?: (userId: string) => void;
  className?: string;
}

export function FollowingList({
  following,
  isLoading,
  loadingIds = [],
  onUnfollow,
  className,
}: FollowingListProps) {
  if (isLoading)
    return <LoadingState type="list" count={4} className={className} />;

  if (!following.length) {
    return (
      <EmptyState
        iconName="person_search"
        title="Not Following Anyone"
        description="You haven't followed anyone yet. Discover sellers on the feed."
        className={cn("min-h-[200px]", className)}
      />
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {following.map((f) => (
        <FollowUserRow
          key={f.userId}
          {...f}
          isFollowing={true}
          isLoading={loadingIds.includes(f.userId)}
          onUnfollow={onUnfollow}
        />
      ))}
    </div>
  );
}
