"use client";

import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { resolveNotificationPresentation } from "@/src/features/notifications/utils/notification-routing";
import {
  isImportantNotification,
  resolveNotificationVisual,
} from "@/src/features/notifications/utils/notification-visual";
import {
  formatNotificationTime,
  NotificationTypeIcon,
  notificationRowAccentClass,
} from "./notification-appearance";

interface NotificationHeaderRowProps {
  notification: Notification;
  className?: string;
}

/**
 * Compact notification layout for the header dropdown — matches the full page card system
 * (Lucide type icons, accent borders, unread highlight, time format).
 */
export function NotificationHeaderRow({
  notification,
  className,
}: NotificationHeaderRowProps) {
  const pres = resolveNotificationPresentation(notification);
  const visual = resolveNotificationVisual(notification);
  const important = isImportantNotification(notification, visual);

  const description =
    pres.description.trim() && pres.description !== pres.title
      ? pres.description
      : notification.message.trim() && notification.message !== pres.title
        ? notification.message
        : pres.action.kind === "none"
          ? "Open for more details."
          : pres.action.label;

  const date = new Date(notification.created_at);
  const actionHint =
    pres.action.kind === "none" ? undefined : pres.action.label;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-3 py-3 shadow-sm",
        notification.is_read
          ? "border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950"
          : "border-slate-200/90 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/25",
        notificationRowAccentClass(visual, important),
        className,
      )}
    >
      <NotificationTypeIcon kind={visual} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "line-clamp-2 text-sm leading-snug text-slate-900 dark:text-slate-100",
              !notification.is_read ? "font-bold" : "font-semibold",
            )}
          >
            {pres.title}
          </p>
          <time
            dateTime={date.toISOString()}
            className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
          >
            {formatNotificationTime(date)}
          </time>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {pres.categoryLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {pres.categoryLabel}
            </span>
          ) : null}
          {actionHint ? (
            <span className="text-[10px] font-medium text-primary">
              {actionHint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
