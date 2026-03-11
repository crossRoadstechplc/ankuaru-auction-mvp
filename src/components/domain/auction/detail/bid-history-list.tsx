import * as React from "react"
import { BidItem } from "../../auction/bid-item"
import { EmptyState } from "@/src/components/ui/empty-state"
import { LoadingState } from "@/src/components/ui/loading-state"
import { cn } from "@/lib/utils"

export interface BidData {
  id: string
  bidderId: string
  bidderName?: string
  bidderAvatar?: string | null
  amount: number
  createdAt: string
  isWinning?: boolean
}

export interface BidHistoryListProps {
  bids: BidData[]
  isLoading?: boolean
  currency?: string
  className?: string
  /** If true, bid amounts are masked (during OPEN phase) */
  isMasked?: boolean
}

export function BidHistoryList({
  bids,
  isLoading = false,
  currency = "ETB",
  className,
  isMasked = true,
}: BidHistoryListProps) {
  if (isLoading) {
    return <LoadingState type="list" count={3} className={className} />
  }

  if (!bids || bids.length === 0) {
    return (
      <EmptyState
        iconName="gavel"
        title="No Bids Yet"
        description="Be the first to place a bid on this auction."
        className={cn("min-h-[180px]", className)}
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {bids.map((bid, index) => (
        <BidItem
          key={bid.id}
          bidderName={bid.bidderName || `Bidder ${bid.bidderId.slice(0, 6)}`}
          bidderAvatar={bid.bidderAvatar}
          amount={isMasked ? 0 : bid.amount}
          currency={currency}
          timestamp={bid.createdAt}
          isWinning={bid.isWinning ?? index === 0}
        />
      ))}
    </div>
  )
}
