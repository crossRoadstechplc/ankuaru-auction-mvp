import * as React from "react"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "@/lib/utils"

export interface BidItemProps {
  bidderName: string
  bidderAvatar?: string | null
  amount: number
  currency?: string
  timestamp: string | Date
  isWinning?: boolean
  className?: string
}

export function BidItem({
  bidderName,
  bidderAvatar,
  amount,
  currency = "ETB",
  timestamp,
  isWinning = false,
  className,
}: BidItemProps) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        isWinning ? "border-primary bg-primary/5" : "border-border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <UserAvatar src={bidderAvatar} name={bidderName} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {bidderName}
          </span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className={cn("text-sm font-bold", isWinning ? "text-primary" : "text-foreground")}>
          {amount.toLocaleString()} {currency}
        </span>
        {isWinning && (
          <span className="text-[10px] uppercase font-bold text-primary">
            Leading
          </span>
        )}
      </div>
    </div>
  )
}
