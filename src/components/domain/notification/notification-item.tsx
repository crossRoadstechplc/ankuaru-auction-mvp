import * as React from "react"
import { cn } from "@/lib/utils"

export interface NotificationItemProps {
  title: string
  description: string
  timestamp: string | Date
  isRead?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  actionButton?: React.ReactNode
  className?: string
}

export function NotificationItem({
  title,
  description,
  timestamp,
  isRead = false,
  icon,
  onClick,
  actionButton,
  className,
}: NotificationItemProps) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 rounded-lg border transition-colors cursor-pointer w-full",
        isRead
          ? "border-border bg-card hover:bg-muted/50"
          : "border-primary/20 bg-primary/5 hover:bg-primary/10",
        className
      )}
    >
      {/* Icon Area */}
      <div className="flex-shrink-0 mt-1">
        {icon ? (
          icon
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("text-sm font-semibold text-foreground", !isRead && "text-primary")}>
            {title}
          </h4>
          <span className="text-xs tracking-tight text-muted-foreground whitespace-nowrap pt-0.5">
            {formattedTime}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Action Area */}
        {actionButton && (
          <div className="mt-2 flex items-center">
            {actionButton}
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!isRead && (
        <div className="flex-shrink-0 mt-3">
          <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
        </div>
      )}
    </div>
  )
}
