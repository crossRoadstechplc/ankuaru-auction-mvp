"use client";

import * as React from "react";
import { isToday, isYesterday } from "date-fns";
import { NotificationItem } from "./notification-item";
import { cn } from "@/lib/utils";
import type { NotificationVisualKind } from "@/src/features/notifications/utils/notification-visual";

export interface NotificationFeedRow {
  rowKey: string;
  notificationIds: string[];
  mergeCount: number;
  title: string;
  description: string;
  createdAt: string;
  hasUnread: boolean;
  visualKind: NotificationVisualKind;
  important: boolean;
  actionLabel?: string;
  categoryLabel?: string;
  secondaryActionLabel?: string;
}

export interface NotificationsListProps {
  rows: NotificationFeedRow[];
  onRowClick?: (row: NotificationFeedRow) => void;
  onRowPrimaryAction?: (row: NotificationFeedRow) => void;
  onRowSecondaryAction?: (row: NotificationFeedRow) => void;
  className?: string;
}

type TimeBucket = "today" | "yesterday" | "earlier";

function bucketForDate(iso: string): TimeBucket {
  const d = new Date(iso);
  if (isToday(d)) return "today";
  if (isYesterday(d)) return "yesterday";
  return "earlier";
}

const SECTION_META: Record<
  TimeBucket,
  { label: string; description: string }
> = {
  today: { label: "Today", description: "" },
  yesterday: { label: "Yesterday", description: "" },
  earlier: { label: "Earlier", description: "" },
};

const BUCKET_ORDER: TimeBucket[] = ["today", "yesterday", "earlier"];

export function NotificationsList({
  rows,
  onRowClick,
  onRowPrimaryAction,
  onRowSecondaryAction,
  className,
}: NotificationsListProps) {
  const grouped = React.useMemo(() => {
    const map: Record<TimeBucket, NotificationFeedRow[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };
    for (const row of rows) {
      map[bucketForDate(row.createdAt)].push(row);
    }
    return map;
  }, [rows]);

  if (!rows.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-10 md:gap-12", className)}>
      {BUCKET_ORDER.map((bucket) => {
        const bucketRows = grouped[bucket];
        if (!bucketRows.length) return null;

        const { label, description } = SECTION_META[bucket];

        return (
          <section
            key={bucket}
            aria-label={label}
            className="flex flex-col gap-5"
          >
            <div className="border-b border-slate-200/80 pb-3 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {label}
              </h2>
              {description ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            <ul className="flex list-none flex-col gap-4 md:gap-5">
              {bucketRows.map((row) => (
                <li key={row.rowKey}>
                  <NotificationItem
                    title={row.title}
                    description={row.description}
                    timestamp={row.createdAt}
                    isRead={!row.hasUnread}
                    categoryLabel={row.categoryLabel}
                    visualKind={row.visualKind}
                    important={row.important}
                    mergeCount={row.mergeCount}
                    actionLabel={row.actionLabel}
                    secondaryActionLabel={row.secondaryActionLabel}
                    onClick={() => onRowClick?.(row)}
                    onActionClick={() => onRowPrimaryAction?.(row)}
                    onSecondaryActionClick={() =>
                      onRowSecondaryAction?.(row)
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
