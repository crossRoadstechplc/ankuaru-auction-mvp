import { Notification } from "@/lib/types";

export type NotificationActionTarget =
  | {
      kind: "external";
      href: string;
      label: string;
    }
  | {
      kind: "route";
      href: string;
      label: string;
    }
  | {
      kind: "none";
      label: string;
    };

export type NotificationPresentation = {
  title: string;
  description: string;
  iconName: string;
  accentClassName: string;
  categoryLabel: string;
  action: NotificationActionTarget;
};

function normalizeText(value?: string) {
  return (value || "").trim();
}

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

export function resolveNotificationPresentation(
  notification: Notification,
): NotificationPresentation {
  const type = normalizeText(notification.type).toUpperCase();
  const title = normalizeText(notification.title);
  const message = normalizeText(notification.message);
  const combined = `${type} ${title} ${message}`.toLowerCase();

  const safeTitle = title || message || "Notification";
  const safeDescription = message && message !== title ? message : "Open to view details.";

  if (notification.winner_agreement_file_url) {
    return {
      title: safeTitle,
      description: safeDescription,
      iconName: "description",
      accentClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      categoryLabel: "Agreement",
      action: {
        kind: "external",
        href: notification.winner_agreement_file_url,
        label: "Open PDF",
      },
    };
  }

  if (
    notification.auction_id &&
    (includesAny(combined, [
      "auction",
      "bid request",
      "bid approved",
      "closed",
      "opened",
      "open now",
      "winner",
      "won",
      "reveal",
      "congratulations",
    ]) ||
      includesAny(type.toLowerCase(), ["auction", "bid"]))
  ) {
    return {
      title: safeTitle,
      description: safeDescription,
      iconName: includesAny(combined, ["closed", "expired"])
        ? "inventory"
        : includesAny(combined, ["won", "winner", "congratulations"])
          ? "workspace_premium"
          : "gavel",
      accentClassName:
        includesAny(combined, ["won", "winner", "congratulations"])
          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
      categoryLabel: "Auction",
      action: {
        kind: "route",
        href: `/auction/${notification.auction_id}`,
        label: "View auction",
      },
    };
  }

  if (includesAny(combined, ["follow request", "follow approved", "followed you"])) {
    return {
      title: safeTitle,
      description: safeDescription,
      iconName: "group",
      accentClassName:
        "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
      categoryLabel: "Network",
      action: {
        kind: "route",
        href: "/profile?tab=requests&requestView=sent",
        label: "Open requests",
      },
    };
  }

  return {
    title: safeTitle,
    description: safeDescription,
    iconName: "notifications",
    accentClassName:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    categoryLabel: "Update",
    action: {
      kind: "route",
      href: "/notifications",
      label: "View details",
    },
  };
}
