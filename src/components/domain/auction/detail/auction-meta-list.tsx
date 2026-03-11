import * as React from "react"
import { cn } from "@/lib/utils"

export interface MetaItem {
  label: string
  value: React.ReactNode
  icon?: string
}

export interface AuctionMetaListProps {
  items: MetaItem[]
  columns?: 2 | 4
  className?: string
}

export function AuctionMetaList({ items, columns = 4, className }: AuctionMetaListProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2",
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 p-4 rounded-xl border border-border bg-muted/50"
        >
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {item.icon && (
              <span className="material-symbols-outlined text-xs text-primary">{item.icon}</span>
            )}
            {item.label}
          </span>
          <span className="text-sm font-bold text-foreground truncate">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
