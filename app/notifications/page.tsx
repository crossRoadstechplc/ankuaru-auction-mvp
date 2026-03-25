"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  NotificationsList,
  type NotificationFeedRow,
} from "@/src/components/domain/notification/notifications-list";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMyNotificationsQuery,
} from "@/src/features/notifications/queries/hooks";
import { groupNotificationsForDisplay } from "@/src/features/notifications/utils/merge-notification-groups";
import { resolveNotificationPresentation } from "@/src/features/notifications/utils/notification-routing";
import {
  isImportantNotification,
  resolveNotificationVisual,
} from "@/src/features/notifications/utils/notification-visual";
import { Notification } from "@/lib/types";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

type NotificationFilter = "all" | "unread" | "read";

function trunc(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function openNotificationTarget(
  notification: Notification,
  router: ReturnType<typeof useRouter>,
) {
  const presentation = resolveNotificationPresentation(notification);

  if (presentation.action.kind === "external") {
    window.open(presentation.action.href, "_blank", "noopener,noreferrer");
    return;
  }

  if (presentation.action.kind === "route") {
    router.push(presentation.action.href);
  }
}

export default function NotificationsPage() {
  const [returnUrl] = useState(() => {
    if (typeof sessionStorage === "undefined") {
      return "/feed";
    }
    return sessionStorage.getItem("returnUrl") || "/feed";
  });
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const {
    data: notificationsData = [],
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    error: notificationsError,
    refetch,
    isFetching: isNotificationsFetching,
  } = useMyNotificationsQuery();

  const markNotificationRead = useMarkNotificationReadMutation();
  const markAllNotificationsRead = useMarkAllNotificationsReadMutation();
  const router = useRouter();

  const notifications = useMemo(() => {
    const normalized = Array.isArray(notificationsData) ? notificationsData : [];
    return [...normalized].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [notificationsData]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.is_read);
    }
    if (filter === "read") {
      return notifications.filter((n) => n.is_read);
    }
    return notifications;
  }, [filter, notifications]);

  const notificationRows: NotificationFeedRow[] = useMemo(() => {
    const groups = groupNotificationsForDisplay(filteredNotifications);
    return groups.map((group) => {
      const rep = group.notifications[0];
      const pres = resolveNotificationPresentation(rep);
      const visual = resolveNotificationVisual(rep);
      const important = isImportantNotification(rep, visual);
      const mergeCount = group.notifications.length;
      const hasUnread = group.notifications.some((n) => !n.is_read);

      let title = pres.title;
      let description =
        pres.description.trim() && pres.description !== pres.title
          ? pres.description
          : rep.message.trim() && rep.message !== pres.title
            ? rep.message
            : "Open for more details.";

      if (mergeCount > 1) {
        title = `${mergeCount} similar updates · ${trunc(pres.title, 52)}`;
        description = `Latest: ${trunc(pres.description, 100)} · ${mergeCount - 1} more grouped`;
      }

      const row: NotificationFeedRow = {
        rowKey: group.notifications.map((n) => n.id).join(":"),
        notificationIds: group.notifications.map((n) => n.id),
        mergeCount,
        title: trunc(title, 120),
        description: trunc(description, 200),
        createdAt: rep.created_at,
        hasUnread,
        visualKind: visual,
        important,
        actionLabel:
          pres.action.kind === "none" ? undefined : pres.action.label,
        categoryLabel: pres.categoryLabel,
      };

      const blob = `${rep.type} ${rep.title} ${rep.message}`.toLowerCase();
      if (blob.includes("follow")) {
        row.secondaryActionLabel = "View requests";
      }

      return row;
    });
  }, [filteredNotifications]);

  const visibleRows = useMemo(
    () => notificationRows.slice(0, visibleCount),
    [notificationRows, visibleCount],
  );
  const canLoadMore = visibleCount < notificationRows.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleFollowSecondary = useCallback(
    async (row: NotificationFeedRow) => {
      const targets = row.notificationIds
        .map((id) => notifications.find((n) => n.id === id))
        .filter((n): n is Notification => !!n);
      const unread = targets.filter((n) => !n.is_read);
      try {
        await Promise.all(
          unread.map((n) => markNotificationRead.mutateAsync(n.id)),
        );
      } catch {
        toast.error("We could not update the read state.");
      }
      router.push("/profile?tab=requests&requestView=sent");
    },
    [markNotificationRead, notifications, router],
  );

  const handleRowOpen = useCallback(
    async (row: NotificationFeedRow) => {
      const targets = row.notificationIds
        .map((id) => notifications.find((n) => n.id === id))
        .filter((n): n is Notification => !!n);
      const rep = [...targets].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];

      if (!rep) return;

      const unread = targets.filter((n) => !n.is_read);
      try {
        await Promise.all(
          unread.map((n) => markNotificationRead.mutateAsync(n.id)),
        );
      } catch {
        toast.error("We could not update the read state.");
      }

      openNotificationTarget(rep, router);
    },
    [markNotificationRead, notifications, router],
  );

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead.mutateAsync();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all notifications as read.");
    }
  };

  if (isAuthLoading) {
    return (
      <PageShell>
        <PageContainer className="py-8">
          <LoadingState type="list" count={4} />
        </PageContainer>
      </PageShell>
    );
  }

  if (isNotificationsError) {
    return (
      <PageShell>
        <PageContainer className="py-8 md:py-10">
          <EmptyState
            iconName="error_outline"
            title="Couldn’t load notifications"
            description={
              notificationsError instanceof Error
                ? notificationsError.message
                : "Check your connection and try again."
            }
            className="min-h-[320px] rounded-2xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            action={
              <Button
                type="button"
                onClick={() => refetch()}
                disabled={isNotificationsFetching}
              >
                {isNotificationsFetching ? "Retrying…" : "Retry"}
              </Button>
            }
          />
        </PageContainer>
      </PageShell>
    );
  }

  if (isNotificationsLoading) {
    return (
      <PageShell>
        <PageContainer className="py-8">
          <LoadingState type="list" count={4} />
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageContainer className="space-y-6 py-5 md:space-y-8 md:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="h-auto gap-2 px-0 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(returnUrl)}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of bids, auctions, and follows.
            </p>
          </div>
        </div>

        <PageSection>
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 border-b border-slate-200/80 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
              <div
                className="inline-flex rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/40"
                role="tablist"
              >
                {(
                  [
                    { id: "all" as const, label: "All", count: notifications.length },
                    { id: "unread" as const, label: "Unread", count: unreadCount },
                    { id: "read" as const, label: "Read", count: readCount },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                      filter === tab.id
                        ? "bg-white text-foreground shadow-sm dark:bg-slate-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 tabular-nums text-xs font-normal opacity-70">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {unreadCount > 0 ? (
                <Button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-lg font-semibold"
                  disabled={markAllNotificationsRead.isPending}
                >
                  {markAllNotificationsRead.isPending
                    ? "Updating…"
                    : "Mark all read"}
                </Button>
              ) : null}
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
              {notificationRows.length === 0 ? (
                <EmptyState
                  iconName="notifications_none"
                  title={
                    filter === "all"
                      ? "No notifications yet"
                      : filter === "unread"
                        ? "No unread notifications"
                        : "No read notifications"
                  }
                  description="You’re caught up. New activity will appear here."
                  className="min-h-[260px] rounded-xl border-none bg-slate-50/50 dark:bg-slate-900/30"
                />
              ) : (
                <>
                  <NotificationsList
                    rows={visibleRows}
                    onRowClick={handleRowOpen}
                    onRowPrimaryAction={handleRowOpen}
                    onRowSecondaryAction={handleFollowSecondary}
                  />

                  {canLoadMore ? (
                    <div className="mt-10 flex flex-col items-center gap-3 border-t border-slate-200/80 pt-8 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="min-h-11 min-w-[min(100%,280px)] rounded-xl font-semibold"
                        onClick={() =>
                          setVisibleCount((c) => c + PAGE_SIZE)
                        }
                      >
                        Load more notifications
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Showing {visibleRows.length} of {notificationRows.length}
                      </p>
                    </div>
                  ) : notificationRows.length > PAGE_SIZE ? (
                    <p className="mt-8 text-center text-xs text-muted-foreground">
                      End of list · {notificationRows.length} total
                    </p>
                  ) : null}
                </>
              )}

              {isNotificationsFetching && notificationRows.length > 0 ? (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Refreshing…
                </p>
              ) : null}
            </div>
          </div>
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
