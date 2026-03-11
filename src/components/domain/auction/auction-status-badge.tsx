import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AuctionStatus = "OPEN" | "CLOSING" | "CLOSED"

export interface AuctionStatusBadgeProps {
  status: AuctionStatus | string
  className?: string
}

export function AuctionStatusBadge({ status, className }: AuctionStatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || "UNKNOWN"

  // Map status to visual variant
  let variant: "default" | "warning" | "secondary" = "secondary"
  let label = normalizedStatus

  if (normalizedStatus === "OPEN") {
    variant = "default" // Uses primary green color from globals.css
  } else if (normalizedStatus === "CLOSING") {
    variant = "warning"
  } else if (normalizedStatus === "CLOSED") {
    variant = "secondary" // Muted look
  }

  return (
    <Badge variant={variant} className={cn("uppercase", className)}>
      {label}
    </Badge>
  )
}
