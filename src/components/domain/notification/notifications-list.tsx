import * as React from "react"
import { NotificationItem } from "./notification-item"
import { EmptyState } from "@/src/components/ui/empty-state"
import { LoadingState } from "@/src/components/ui/loading-state"
import { cn } from "@/lib/utils"

export interface NotificationData {
  id: string
  title: string
  description: string
  created_at: string
  is_read: boolean
  icon?: React.ReactNode
  icon_name?: string
}

export interface NotificationsListProps {
  notifications: NotificationData[]
  isLoading?: boolean
  onNotificationClick?: (id: string, item: NotificationData) => void
  className?: string
}

export function NotificationsList({
  notifications,
  isLoading,
  onNotificationClick,
  className,
}: NotificationsListProps) {
  if (isLoading) {
    return <LoadingState type="list" count={5} className={className} />
  }

  if (!notifications.length) {
    return (
      <EmptyState
        iconName="notifications_none"
        title="No Notifications"
        description="You're all caught up! Check back later for updates."
        className={cn("min-h-[240px]", className)}
      />
    )
  }

  // Group by read/unread for clarity
  const unread = notifications.filter((n) => !n.is_read)
  const read = notifications.filter((n) => n.is_read)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {unread.length > 0 && (
        <section aria-label="Unread notifications" className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mt-1 mb-1">
            Unread ({unread.length})
          </h3>
          {unread.map((n) => (
            <NotificationItem
              key={n.id}
              title={n.title}
              description={n.description}
              timestamp={n.created_at}
              isRead={false}
              icon={n.icon}
              onClick={() => onNotificationClick?.(n.id, n)}
            />
          ))}
        </section>
      )}

      {read.length > 0 && (
        <section aria-label="Read notifications" className="flex flex-col gap-2">
          {unread.length > 0 && (
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mt-4 mb-1">
              Earlier
            </h3>
          )}
          {read.map((n) => (
            <NotificationItem
              key={n.id}
              title={n.title}
              description={n.description}
              timestamp={n.created_at}
              isRead={true}
              icon={n.icon}
              onClick={() => onNotificationClick?.(n.id, n)}
            />
          ))}
        </section>
      )}
    </div>
  )
}
