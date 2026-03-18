"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Scheduled Phase Panel ──────────────────────────────────────────────────

export interface ScheduledPanelProps {
  minBid: string
  startAt: string
  className?: string
}

export function ScheduledPanel({ minBid, startAt, className }: ScheduledPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 text-center py-4", className)}>
      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-blue-500 text-3xl">schedule</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">Auction Scheduled</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Bidding will open when the auction begins.
        </p>
      </div>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">Starting Bid</p>
        <p className="text-2xl font-black text-blue-900 dark:text-white">{minBid}</p>
      </div>
      <div className="text-sm text-muted-foreground">
        Starts:{" "}
        <span className="font-semibold text-foreground">
          {new Date(startAt).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

// ── Closed Phase Panel ─────────────────────────────────────────────────────

export interface ClosedPanelProps {
  winningBid?: string
  currentBid?: string
  onViewReport?: () => void
  className?: string
}

export function ClosedPanel({ winningBid, currentBid, onViewReport, className }: ClosedPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 text-center py-4", className)}>
      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-slate-400 text-3xl">event_busy</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">Auction Closed</h3>
        <p className="text-sm text-muted-foreground font-medium">
          This auction has concluded. No further bids are accepted.
        </p>
      </div>
      <div className="p-4 bg-muted rounded-xl border border-border">
        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Winning Bid</p>
        <p className="text-2xl font-black text-primary">{winningBid || currentBid || "—"}</p>
      </div>
      {onViewReport && (
        <Button variant="outline" onClick={onViewReport} className="w-full gap-2">
          <span className="material-symbols-outlined text-sm">description</span>
          View Auction Report
        </Button>
      )}
    </div>
  )
}

// ── Reveal Phase Panel ─────────────────────────────────────────────────────

export interface RevealPanelProps {
  /** Bidder's own bid details, if they placed one */
  myBidAmount?: string
  localBidAmount?: string
  onRevealBid?: () => void
  isRevealing?: boolean
  className?: string
}

export function RevealPanel({ myBidAmount, localBidAmount, onRevealBid, isRevealing, className }: RevealPanelProps) {
  const bidDisplay = myBidAmount || localBidAmount
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="text-center py-2">
        <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-orange-500 text-3xl">lock_open</span>
        </div>
        <h3 className="text-xl font-bold mb-1">Reveal Phase</h3>
        <p className="text-sm text-muted-foreground">
          The auction is over. Reveal your bid to be counted.
        </p>
      </div>

      {bidDisplay && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
          <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">Your Bid</p>
          <p className="text-2xl font-black text-foreground">ETB {bidDisplay}</p>
        </div>
      )}

      {onRevealBid && (
        <Button onClick={onRevealBid} disabled={isRevealing} className="w-full gap-2 font-bold">
          {isRevealing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Revealing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">visibility</span>
              Reveal My Bid
            </>
          )}
        </Button>
      )}
    </div>
  )
}
