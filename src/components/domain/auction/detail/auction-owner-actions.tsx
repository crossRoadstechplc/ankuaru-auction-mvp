"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuctionOwnerActionsProps {
  auctionStatus: "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED"
  bidCount?: number
  onCloseEarly?: () => void
  onRevealBids?: () => void
  onViewReport?: () => void
  isClosing?: boolean
  className?: string
}

export function AuctionOwnerActions({
  auctionStatus,
  bidCount = 0,
  onCloseEarly,
  onRevealBids,
  onViewReport,
  isClosing,
  className,
}: AuctionOwnerActionsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl border border-border">
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Bids</p>
          <p className="text-2xl font-black text-foreground">{bidCount}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Status</p>
          <p className="text-sm font-bold text-primary uppercase">{auctionStatus}</p>
        </div>
      </div>

      {/* OPEN — Allow early close */}
      {auctionStatus === "OPEN" && onCloseEarly && (
        <Button
          variant="destructive"
          onClick={onCloseEarly}
          disabled={isClosing}
          className="w-full gap-2 font-bold"
        >
          {isClosing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Closing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">lock</span>
              Close Auction Early
            </>
          )}
        </Button>
      )}

      {/* REVEAL phase — Reveal all bids */}
      {auctionStatus === "REVEAL" && onRevealBids && (
        <Button
          onClick={onRevealBids}
          className="w-full gap-2 font-bold bg-orange-600 hover:bg-orange-700 text-white"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          Reveal All Bids
        </Button>
      )}

      {/* CLOSED — View report */}
      {auctionStatus === "CLOSED" && onViewReport && (
        <Button variant="outline" onClick={onViewReport} className="w-full gap-2 font-bold">
          <span className="material-symbols-outlined text-sm">description</span>
          View Final Report
        </Button>
      )}
    </div>
  )
}
