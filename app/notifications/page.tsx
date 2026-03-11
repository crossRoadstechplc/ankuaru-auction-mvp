"use client";

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { graphQLApiClient } from "../../lib/graphql-api"
import { useAuthStore } from "../../stores/auth.store"
import { PageShell } from "@/components/layout/page-shell"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { NotificationsList } from "@/src/components/domain/notification/notifications-list"
import { LoadingState } from "@/src/components/ui/loading-state"
import { Button } from "@/components/ui/button"

interface ApiNotification {
  id: string;
  type: string;
  title?: string;
  message?: string;
  text?: string;
  body?: string;
  is_read: boolean;
  created_at: string;
  winner_agreement_file_url?: string;
  auctionId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [returnUrl, setReturnUrl] = useState("/feed");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await graphQLApiClient.getMyNotifications();
        const parsedData = Array.isArray(data)
          ? data
          : (data as any).notifications || [];
        parsedData.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setNotifications(parsedData);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }

    if (typeof sessionStorage !== "undefined") {
      setReturnUrl(sessionStorage.getItem("returnUrl") || "/feed");
    }
  }, [isAuthenticated, isAuthLoading, router])

  const handleNotificationClick = async (n: ApiNotification) => {
    if (!n.is_read) {
      try {
        await graphQLApiClient.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === n.id ? { ...notif, is_read: true } : notif,
          ),
        );
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);

    for (const n of unreadNotifications) {
      try {
        await graphQLApiClient.markNotificationRead(n.id);
      } catch (error) {
        console.error(`Failed to mark notification ${n.id} as read`, error);
      }
    }

    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true })),
    );
  };

  if (isAuthLoading || isLoading) {
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
            notifications={notifications.map(n => ({
              id: n.id,
              title: n.title || n.message || n.text || "Notification",
              description: n.body || "",
              is_read: n.is_read,
              created_at: n.created_at,
              icon_name: n.type === "AUCTION_WON" || n.type === "success" 
                ? "check_circle" 
                : n.type === "fail" ? "error" : "notifications"
            }))}
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
