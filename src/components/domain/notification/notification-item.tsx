import * as React from "react"
import { cn } from "@/lib/utils"

export interface NotificationItemProps {
  title: string
  description: string
  timestamp: string | Date
  isRead?: boolean
  categoryLabel?: string
  iconName?: string
  icon?: React.ReactNode
  onClick?: () => void
  actionLabel?: string
  onActionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

export function NotificationItem({
  title,
  description,
  timestamp,
  isRead = false,
  categoryLabel,
  iconName,
  icon,
  onClick,
  actionLabel,
  onActionClick,
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
        "flex gap-4 rounded-2xl border p-4 transition-all cursor-pointer w-full shadow-sm",
        isRead
          ? "border-border/70 bg-card hover:border-border hover:bg-muted/30"
          : "border-primary/20 bg-primary/[0.06] hover:border-primary/30 hover:bg-primary/[0.08]",
        className
      )}
    >
      {/* Icon Area */}
      <div className="flex-shrink-0 mt-1">
        {icon ? (
          icon
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-xl">
              {iconName || "notifications"}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {categoryLabel ? (
                <span className="inline-flex rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {categoryLabel}
                </span>
              ) : null}
              {!isRead ? (
                <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  New
                </span>
              ) : null}
            </div>
            <h4 className={cn("text-sm font-semibold text-foreground", !isRead && "text-primary")}>
              {title}
            </h4>
          </div>
          <span className="pt-0.5 text-xs tracking-tight text-muted-foreground whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
        
        <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
          {description}
        </p>

        {actionLabel ? (
          <div className="mt-2 flex items-center">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onActionClick?.(event)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </button>
          </div>
        ) : null}
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
