import * as React from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  iconName?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  iconName = "inbox",
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full rounded-xl border border-dashed border-border bg-card/50",
        className
      )}
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        {icon || (
          <span className="material-symbols-outlined text-3xl">
            {iconName}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
