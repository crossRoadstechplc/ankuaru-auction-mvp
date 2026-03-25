import type { Notification } from "@/lib/types";

export type NotificationVisualKind =
  | "bid"
  | "outbid"
  | "follow"
  | "warning"
  | "system";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function includesAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n));
}

/**
 * Color / icon channel for notification cards (bid, outbid, follow, warning, system).
 */
export function resolveNotificationVisual(
  notification: Notification,
): NotificationVisualKind {
  const type = norm(notification.type || "");
  const title = norm(notification.title || "");
  const message = norm(notification.message || "");
  const blob = `${type} ${title} ${message}`;

  if (
    includesAny(blob, [
      "outbid",
      "out-bid",
      "out bid",
      "been outbid",
      "someone bid higher",
      "lost the lead",
      "no longer the highest",
    ])
  ) {
    return "outbid";
  }

  if (
    includesAny(blob, [
      "follow request",
      "follow approved",
      "followed you",
      "new follower",
      "wants to follow",
    ])
  ) {
    return "follow";
  }

  if (
    includesAny(blob, [
      "closing soon",
      "ends soon",
      "ending in",
      "last chance",
      "deadline",
      "expires soon",
      "auction ending",
      "hours left",
    ])
  ) {
    return "warning";
  }

  if (
    includesAny(blob, [
      "bid",
      "auction",
      "won",
      "winner",
      "reveal",
      "gavel",
    ]) ||
    !!notification.auction_id
  ) {
    return "bid";
  }

  return "system";
}

export function isImportantNotification(
  notification: Notification,
  visual: NotificationVisualKind,
): boolean {
  if (visual === "outbid" || visual === "warning") return true;
  const blob = norm(
    `${notification.type} ${notification.title} ${notification.message}`,
  );
  return includesAny(blob, ["urgent", "action required", "immediate"]);
}
