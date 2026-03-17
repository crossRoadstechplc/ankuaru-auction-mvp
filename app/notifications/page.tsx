"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { NotificationsList } from "@/src/components/domain/notification/notifications-list";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMyNotificationsQuery,
} from "@/src/features/notifications/queries/hooks";
import { resolveNotificationPresentation } from "@/src/features/notifications/utils/notification-routing";
import { Notification } from "@/lib/types";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type NotificationFilter = "all" | "unread" | "read";

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const {
    data: notificationsData = [],
    isLoading: isNotificationsLoading,
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

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.is_read);
    }

    return notifications;
  }, [filter, notifications]);

  const notificationCards = useMemo(
    () =>
      filteredNotifications.map((notification) => {
        const presentation = resolveNotificationPresentation(notification);

        return {
          id: notification.id,
          title: presentation.title,
          description: presentation.description,
          created_at: notification.created_at,
          is_read: notification.is_read,
          categoryLabel: presentation.categoryLabel,
          iconName: presentation.iconName,
          actionLabel:
            presentation.action.kind === "none"
              ? undefined
              : presentation.action.label,
          icon: (
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${presentation.accentClassName}`}
            >
              <span className="material-symbols-outlined text-xl">
                {presentation.iconName}
              </span>
            </div>
          ),
        };
      }),
    [filteredNotifications],
  );

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleNotificationOpen = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead.mutateAsync(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read", error);
        toast.error("We could not update the read state.");
      }
    }

    openNotificationTarget(notification, router);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead.mutateAsync();
      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
      toast.error("Failed to mark all notifications as read.");
    }
  };

  if (isAuthLoading || isNotificationsLoading) {
    return (
      <PageShell>
        <PageContainer className="py-8">
          <LoadingState type="list" count={5} />
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageContainer className="space-y-6 py-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="gap-2 px-0 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(returnUrl)}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </Button>
            
          </div>

         
        </div>

        <PageSection>
          <div className="rounded-[28px] border border-border/70 bg-card">
            <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-[20px] border border-border/70 bg-background p-1">
                  {([
                    { id: "all", label: "All", count: notifications.length },
                    { id: "unread", label: "Unread", count: unreadCount },
                    { id: "read", label: "Read", count: readCount },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        filter === tab.id
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}{" "}
                      <span className="text-xs opacity-70">{tab.count}</span>
                    </button>
                  ))}
                </div>

                {unreadCount > 0 ? (
                  <Button
                    onClick={handleMarkAllAsRead}
                    variant="outline"
                    size="sm"
                    disabled={markAllNotificationsRead.isPending}
                  >
                    {markAllNotificationsRead.isPending
                      ? "Updating..."
                      : "Mark all as read"}
                  </Button>
                ) : null}
              </div>

              
            </div>

            <div className="p-4 md:p-6">
              {notificationCards.length === 0 ? (
                <EmptyState
                  iconName="notifications_none"
                  title={
                    filter === "all"
                      ? "No notifications yet"
                      : filter === "unread"
                        ? "No unread notifications"
                        : "No read notifications"
                  }
                  description="New marketplace activity will show up here when it arrives."
                  className="min-h-[280px]"
                />
              ) : (
                <NotificationsList
                  notifications={notificationCards}
                  onNotificationClick={async (id) => {
                    const notification = notifications.find((item) => item.id === id);
                    if (notification) {
                      await handleNotificationOpen(notification);
                    }
                  }}
                  onNotificationActionClick={async (id) => {
                    const notification = notifications.find((item) => item.id === id);
                    if (notification) {
                      await handleNotificationOpen(notification);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
