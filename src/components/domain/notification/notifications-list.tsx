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
  categoryLabel?: string
  iconName?: string
  actionLabel?: string
  icon?: React.ReactNode
}

export interface NotificationsListProps {
  notifications: NotificationData[]
  isLoading?: boolean
  onNotificationClick?: (id: string, item: NotificationData) => void
  onNotificationActionClick?: (id: string, item: NotificationData) => void
  className?: string
}

export function NotificationsList({
  notifications,
  isLoading,
  onNotificationClick,
  onNotificationActionClick,
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
    <div className={cn("flex flex-col gap-3", className)}>
      {unread.length > 0 && (
        <section aria-label="Unread notifications" className="flex flex-col gap-3">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Unread ({unread.length})
          </h3>
          {unread.map((n) => (
            <NotificationItem
              key={n.id}
              title={n.title}
              description={n.description}
              timestamp={n.created_at}
              isRead={false}
              categoryLabel={n.categoryLabel}
              iconName={n.iconName}
              actionLabel={n.actionLabel}
              icon={n.icon}
              onClick={() => onNotificationClick?.(n.id, n)}
              onActionClick={() => onNotificationActionClick?.(n.id, n)}
            />
          ))}
        </section>
      )}

      {read.length > 0 && (
        <section aria-label="Read notifications" className="flex flex-col gap-3">
          {unread.length > 0 && (
            <h3 className="mb-1 mt-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
              categoryLabel={n.categoryLabel}
              iconName={n.iconName}
              actionLabel={n.actionLabel}
              icon={n.icon}
              onClick={() => onNotificationClick?.(n.id, n)}
              onActionClick={() => onNotificationActionClick?.(n.id, n)}
            />
          ))}
        </section>
      )}
    </div>
  )
}
