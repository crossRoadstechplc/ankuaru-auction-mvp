"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BidComposerProps {
  auctionType: "SELL" | "BUY"
  minBid: string
  bidAmount: string
  onBidAmountChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isDisabled: boolean
  /** If the user already placed a bid */
  hasPlacedBid: boolean
  /** The user's existing bid amount for display */
  existingBidAmount?: string
  className?: string
}

export function BidComposer({
  auctionType,
  minBid,
  bidAmount,
  onBidAmountChange,
  onSubmit,
  isSubmitting,
  isDisabled,
  hasPlacedBid,
  existingBidAmount,
  className,
}: BidComposerProps) {
  const isSell = auctionType === "SELL"

  if (hasPlacedBid) {
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center py-4", className)}>
        <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
        </div>
        <div>
          <h4 className="font-bold text-foreground">Bid Submitted!</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {existingBidAmount
              ? `Your bid of ETB ${existingBidAmount} is securely recorded.`
              : "Your bid is securely recorded."}
          </p>
        </div>
        <div className="w-full p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
          Bids are hidden until the reveal phase
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="bid-amount">
          {isSell ? "Your Bid (ETB)" : "Your Offer (ETB)"}
        </label>
        <p className="text-xs text-muted-foreground">
          Minimum: <span className="font-bold text-foreground">ETB {minBid}</span>
        </p>
        <Input
          id="bid-amount"
          type="number"
          placeholder={`Enter amount ≥ ${minBid}`}
          value={bidAmount}
          onChange={(e) => onBidAmountChange(e.target.value)}
          min={minBid}
          step="1"
          disabled={isDisabled || isSubmitting}
          required
          className="text-lg font-bold h-12"
        />
      </div>

      <div className="p-3 rounded-lg bg-muted/70 border border-border/50 text-xs text-muted-foreground">
        <span className="material-symbols-outlined text-sm align-middle mr-1 text-primary">info</span>
        Your bid is sealed and{" "}
        <span className="font-semibold text-foreground">hidden from others</span>{" "}
        until the reveal phase.
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isDisabled || isSubmitting || !bidAmount}
        className="w-full font-bold"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Placing Bid...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">gavel</span>
            {isSell ? "Place Bid" : "Submit Offer"}
          </span>
        )}
      </Button>
    </form>
  )
}
