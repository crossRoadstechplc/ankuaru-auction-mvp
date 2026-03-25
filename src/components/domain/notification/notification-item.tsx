"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationVisualKind } from "@/src/features/notifications/utils/notification-visual";
import {
  formatNotificationTime,
  NotificationTypeIcon,
  notificationRowAccentClass,
} from "./notification-appearance";

export interface NotificationItemProps {
  title: string;
  description: string;
  timestamp: string | Date;
  isRead?: boolean;
  categoryLabel?: string;
  visualKind: NotificationVisualKind;
  /** Outbid / closing soon / urgent */
  important?: boolean;
  /** Merged group size badge */
  mergeCount?: number;
  onClick?: () => void;
  actionLabel?: string;
  onActionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Optional secondary (e.g. dismiss-style) — same row as primary */
  secondaryActionLabel?: string;
  onSecondaryActionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function NotificationItem({
  title,
  description,
  timestamp,
  isRead = false,
  categoryLabel,
  visualKind,
  important = false,
  mergeCount,
  onClick,
  actionLabel,
  onActionClick,
  secondaryActionLabel,
  onSecondaryActionClick,
  className,
}: NotificationItemProps) {
  const date = new Date(timestamp);
  const timeLabel = formatNotificationTime(date);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex gap-4 rounded-xl border px-4 py-4 text-left shadow-sm transition-colors md:px-5 md:py-4",
        "min-h-[4.5rem] w-full cursor-pointer",
        isRead
          ? "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900/60"
          : "border-slate-200/90 bg-sky-50/50 font-medium hover:bg-sky-50/80 dark:border-sky-900/40 dark:bg-sky-950/25 dark:hover:bg-sky-950/35",
        notificationRowAccentClass(visualKind, important),
        className,
      )}
    >
      <NotificationTypeIcon
        kind={visualKind}
        size="md"
        className="mt-0.5"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {mergeCount != null && mergeCount > 1 ? (
                <span className="inline-flex rounded-md bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-slate-100 dark:text-slate-900">
                  ×{mergeCount}
                </span>
              ) : null}
              {categoryLabel ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {categoryLabel}
                </span>
              ) : null}
            </div>
            <h3
              className={cn(
                "line-clamp-1 text-sm leading-snug text-slate-900 dark:text-slate-100",
                !isRead && "font-bold",
                isRead && "font-semibold",
              )}
            >
              {title}
            </h3>
          </div>
          <time
            dateTime={date.toISOString()}
            className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
          >
            {timeLabel}
          </time>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {actionLabel || secondaryActionLabel ? (
          <div
            className="flex flex-wrap items-center gap-2 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actionLabel ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold shadow-sm"
                onClick={(e) => onActionClick?.(e)}
              >
                {actionLabel}
              </Button>
            ) : null}
            {secondaryActionLabel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold"
                onClick={(e) => onSecondaryActionClick?.(e)}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
