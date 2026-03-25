import type { Notification } from "@/lib/types";

export type NotificationMergeGroup = {
  notifications: Notification[];
};

function mergeKey(n: Notification): string {
  const auctionId = n.auction_id?.trim();
  const type = (n.type || "").trim().toLowerCase();
  if (auctionId) {
    return `a:${auctionId}|${type}`;
  }
  const titleFrag = (n.title || "").slice(0, 72).trim().toLowerCase();
  return `g:${type}|${titleFrag}`;
}

/**
 * Groups similar notifications (same auction + type, or same type + title prefix)
 * for denser feed display. Each notification appears in exactly one group.
 */
export function groupNotificationsForDisplay(
  notifications: Notification[],
): NotificationMergeGroup[] {
  const byKey = new Map<string, Notification[]>();

  for (const n of notifications) {
    const k = mergeKey(n);
    const list = byKey.get(k) ?? [];
    list.push(n);
    byKey.set(k, list);
  }

  const groups: NotificationMergeGroup[] = [];
  for (const [, list] of byKey) {
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    groups.push({ notifications: list });
  }

  groups.sort(
    (a, b) =>
      new Date(b.notifications[0].created_at).getTime() -
      new Date(a.notifications[0].created_at).getTime(),
  );

  return groups;
}
