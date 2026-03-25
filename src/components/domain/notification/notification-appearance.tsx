"use client";

import {
  AlertTriangle,
  Bell,
  Gavel,
  type LucideIcon,
  TrendingDown,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationVisualKind } from "@/src/features/notifications/utils/notification-visual";

export const NOTIFICATION_VISUAL_ICONS: Record<
  NotificationVisualKind,
  { Icon: LucideIcon; iconWrap: string }
> = {
  bid: {
    Icon: Gavel,
    iconWrap:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  outbid: {
    Icon: TrendingDown,
    iconWrap: "bg-red-100 text-red-700 dark:bg-red-950/45 dark:text-red-300",
  },
  follow: {
    Icon: UserPlus,
    iconWrap:
      "bg-sky-100 text-sky-800 dark:bg-sky-950/45 dark:text-sky-300",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrap:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-200",
  },
  system: {
    Icon: Bell,
    iconWrap:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMsg = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfMsg.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (diffDays === 1) {
    return `Yesterday · ${new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date)}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

type IconSize = "sm" | "md";

export function NotificationTypeIcon({
  kind,
  size = "md",
  className,
}: {
  kind: NotificationVisualKind;
  size?: IconSize;
  className?: string;
}) {
  const { Icon, iconWrap } = NOTIFICATION_VISUAL_ICONS[kind];
  const box =
    size === "sm"
      ? "size-9 [&_svg]:size-[18px]"
      : "size-12 [&_svg]:size-6";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        box,
        iconWrap,
        className,
      )}
      aria-hidden
    >
      <Icon strokeWidth={2} />
    </div>
  );
}

export function notificationRowAccentClass(
  kind: NotificationVisualKind,
  important: boolean,
): string {
  const showAccent =
    important || kind === "outbid" || kind === "warning";
  if (!showAccent) return "";
  if (kind === "outbid") return "border-l-4 border-l-red-500";
  if (kind === "warning") return "border-l-4 border-l-amber-500";
  if (important) return "border-l-4 border-l-primary";
  return "";
}
