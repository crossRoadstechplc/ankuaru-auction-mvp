"use client";

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMyNotificationsQuery,
} from "@/src/features/notifications/queries/hooks"
import { Notification } from "../../lib/types"
import { useAuthStore } from "../../stores/auth.store"
import { PageShell } from "@/components/layout/page-shell"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { NotificationsList } from "@/src/components/domain/notification/notifications-list"
import { LoadingState } from "@/src/components/ui/loading-state"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [returnUrl] = useState(() => {
    if (typeof sessionStorage === "undefined") {
      return "/feed";
    }

    return sessionStorage.getItem("returnUrl") || "/feed";
  });
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

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isAuthLoading, router])

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await markNotificationRead.mutateAsync(n.id);
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  if (isAuthLoading || isNotificationsLoading) {
    return (
      <PageShell>
        <PageContainer className="py-8">
          <LoadingState type="list" count={5} />
        </PageContainer>
      </PageShell>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageShell>
      <PageContainer className="py-8">
        <div className="mb-6">
          <Button variant="ghost" className="gap-2" onClick={() => router.push(returnUrl)}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Button>
        </div>

        <PageHeader 
          title="Notifications"
          description="Stay updated with your latest bids and auctions"
          actions={
            unreadCount > 0 ? (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                Mark all as read
              </Button>
            ) : undefined
          }
        />

        <PageSection className="mt-8">
          <NotificationsList 
            notifications={notifications.map((n) => {
              const legacyNotification = n as Notification & {
                text?: string;
                body?: string;
              };

              return {
                id: n.id,
                title:
                  n.title ||
                  n.message ||
                  legacyNotification.text ||
                  "Notification",
                description: legacyNotification.body || "",
                is_read: n.is_read,
                created_at: n.created_at,
                icon_name:
                  n.type === "AUCTION_WON" || n.type === "success"
                    ? "check_circle"
                    : n.type === "fail"
                      ? "error"
                      : "notifications",
              };
            })}
            onNotificationClick={async (id) => {
              const notif = notifications.find(n => n.id === id)
              if (notif) {
                await handleNotificationClick(notif)
              }
            }}
          />
        </PageSection>
      </PageContainer>
    </PageShell>
  )
}
