import * as React from "react"
import { cn } from "@/lib/utils"

export interface AuctionSidebarCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function AuctionSidebarCard({ title, children, className, ...props }: AuctionSidebarCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-border/60">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
