import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { User } from "../../../lib/types";

export interface UserListProps {
  users: User[];
  title?: string;
  emptyMessage?: string;
  showFollowButton?: boolean;
  showUnfollowButton?: boolean;
  showBlockButton?: boolean;
  showUnblockButton?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onUnblock?: (userId: string) => void;
  className?: string;
  isLoading?: boolean;
  loadingIds?: string[];
}

export function UserList({
  users,
  title,
  emptyMessage = "No users found.",
  showFollowButton = true,
  showUnfollowButton = true,
  showBlockButton = false,
  showUnblockButton = false,
  onFollow,
  onUnfollow,
  onBlock,
  onUnblock,
  className,
  isLoading = false,
  loadingIds = [],
}: UserListProps) {
  if (isLoading)
    return <LoadingState type="list" count={4} className={className} />;

  if (!users.length) {
    return (
      <EmptyState
        iconName="group"
        title={title || "No Users"}
        description={emptyMessage}
        className={cn("min-h-[200px]", className)}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {users.map((user) => {
        const isRowLoading = loadingIds.includes(user.id);

        return (
        <Card key={user.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                {user.username?.[0] || user.fullName?.[0] || "?"}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {user.username || user.fullName}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showFollowButton && onFollow && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRowLoading}
                  onClick={() => onFollow(user.id)}
                >
                  {isRowLoading ? "..." : "Follow"}
                </Button>
              )}

              {showUnfollowButton && onUnfollow && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRowLoading}
                  onClick={() => onUnfollow(user.id)}
                >
                  {isRowLoading ? "..." : "Unfollow"}
                </Button>
              )}

              {showBlockButton && onBlock && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isRowLoading}
                  onClick={() => onBlock(user.id)}
                >
                  {isRowLoading ? "..." : "Block"}
                </Button>
              )}

              {showUnblockButton && onUnblock && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRowLoading}
                  onClick={() => onUnblock(user.id)}
                >
                  {isRowLoading ? "..." : "Unblock"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )})}
    </div>
  );
}

export default UserList;
