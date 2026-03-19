import { Auction } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { shortId } from "@/lib/format";

export interface StatusMeta {
  label: string;
  helper: string;
  icon: string;
  variant: "default" | "secondary" | "success" | "warning" | "outline";
  barClassName: string;
  accentClassName: string;
}

export const STATUS_PRIORITY: Record<Auction["status"], number> = {
  OPEN: 0,
  REVEAL: 1,
  SCHEDULED: 2,
  CLOSED: 3,
};

export function getTimeRemaining(
  startAt: string,
  endAt: string,
  status: Auction["status"],
): string {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (status === "SCHEDULED") {
    const diff = start - now;
    if (diff <= 0) {
      return "Starting now";
    }

    return `Starts in ${formatDuration(diff)}`;
  }

  if (status === "OPEN") {
    const diff = end - now;
    if (diff <= 0) {
      return "Ending now";
    }

    return `${formatDuration(diff)} left`;
  }

  if (status === "REVEAL") {
    const diff = end - now;
    if (diff <= 0) {
      return "Reveal complete";
    }

    return `${formatDuration(diff)} remaining`;
  }

  return "Finalized";
}

export function getAuctionStatusMeta(status: Auction["status"]): StatusMeta {
  switch (status) {
    case "OPEN":
      return {
        label: "Live",
        helper: "Bidding is active right now.",
        icon: "gavel",
        variant: "success",
        barClassName: "bg-gradient-to-r from-success via-primary to-primary/70",
        accentClassName: "bg-success/10 text-success",
      };
    case "REVEAL":
      return {
        label: "Reveal",
        helper: "Final bids are being revealed.",
        icon: "visibility",
        variant: "warning",
        barClassName:
          "bg-gradient-to-r from-warning via-warning/80 to-primary/70",
        accentClassName: "bg-warning/10 text-warning",
      };
    case "SCHEDULED":
      return {
        label: "Scheduled",
        helper: "The auction has not opened yet.",
        icon: "schedule",
        variant: "secondary",
        barClassName:
          "bg-gradient-to-r from-primary/40 via-primary/20 to-muted",
        accentClassName: "bg-primary/10 text-primary",
      };
    case "CLOSED":
    default:
      return {
        label: "Closed",
        helper: "The final result is locked.",
        icon: "check_circle",
        variant: "secondary",
        barClassName:
          "bg-gradient-to-r from-muted via-border to-muted-foreground/40",
        accentClassName: "bg-muted/80 text-muted-foreground",
      };
  }
}

export function getAuctionTypeLabel(type: Auction["auctionType"]): string {
  return type === "SELL" ? "Sell auction" : "Buy request";
}

export function getVisibilityLabel(visibility: Auction["visibility"]): string {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "FOLLOWERS":
      return "Followers only";
    case "SELECTED":
      return "Selected users";
    default:
      return visibility;
  }
}

export function getCreatorName(auction: Auction): string {
  return (
    auction.creator?.fullName ||
    auction.creator?.username ||
    `Creator ${shortId(auction.createdBy)}`
  );
}

export function getCreatorHandle(auction: Auction): string | null {
  if (auction.creator?.username) {
    return `@${auction.creator.username}`;
  }

  if (auction.createdBy) {
    return `ID ${shortId(auction.createdBy)}`;
  }

  return null;
}

export function sortTrackedAuctions(left: Auction, right: Auction): number {
  const leftPriority = STATUS_PRIORITY[left.status] ?? 99;
  const rightPriority = STATUS_PRIORITY[right.status] ?? 99;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  const leftTime =
    left.status === "CLOSED"
      ? new Date(left.closedAt || left.endAt || left.createdAt || 0).getTime()
      : new Date(left.endAt || left.startAt || left.createdAt || 0).getTime();
  const rightTime =
    right.status === "CLOSED"
      ? new Date(
          right.closedAt || right.endAt || right.createdAt || 0,
        ).getTime()
      : new Date(
          right.endAt || right.startAt || right.createdAt || 0,
        ).getTime();

  if (left.status === "CLOSED" && right.status === "CLOSED") {
    return rightTime - leftTime;
  }

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return (
    new Date(right.createdAt || 0).getTime() -
    new Date(left.createdAt || 0).getTime()
  );
}
