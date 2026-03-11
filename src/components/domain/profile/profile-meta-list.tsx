import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProfileMetaItem {
  label: string
  value: React.ReactNode
  icon?: string
}

export interface ProfileMetaListProps {
  items: ProfileMetaItem[]
  className?: string
}

export function ProfileMetaList({ items, className }: ProfileMetaListProps) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            {item.icon && (
              <span className="material-symbols-outlined text-sm text-primary" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </dt>
          <dd className="text-sm font-semibold text-foreground text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
