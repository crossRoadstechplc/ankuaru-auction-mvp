import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface FeedPostHeaderProps {
  creator?: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt?: string;
}

export function FeedPostHeader({ creator, createdAt }: FeedPostHeaderProps) {
  const displayName = creator?.fullName || creator?.username || "Unknown Trader";
  // Subtitle could be a company name or just username
  const subtitle = creator?.username ? `@${creator.username}` : "Verified Trader";

  // Provide an initial fallback for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formattedTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center gap-3 p-4 pb-2">
      <Avatar className="size-12 rounded-lg border border-border/50">
        <AvatarImage
          src={creator?.avatar || ""}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
          {creator?.avatar ? (
             <User className="size-5" />
          ) : (
             <span className="font-semibold">{getInitials(displayName)}</span>
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground text-base truncate">
            {displayName}
          </h3>
          {formattedTime && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedTime}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      </div>
    </div>
  );
}
