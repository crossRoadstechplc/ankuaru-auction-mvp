"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PriceTier } from "@/lib/types"

/** Find the tier that contains the given quantity, or null if none match */
export function getTierForQuantity(
  tiers: PriceTier[],
  qty: string,
): PriceTier | null {
  const n = parseFloat(qty)
  if (!Number.isFinite(n) || n <= 0) return null
  for (const t of tiers) {
    const min = parseFloat(t.minQty)
    if (!Number.isFinite(min) || n < min) continue
    if (t.maxQty == null) return t
    const max = parseFloat(t.maxQty)
    if (!Number.isFinite(max) || n > max) continue
    return t
  }
  return null
}

export interface BidComposerProps {
  auctionType: "SELL" | "BUY"
  /** Minimum bid (price per unit) when no tiers; else derived from tier */
  minBid: string
  bidAmount: string
  onBidAmountChange: (value: string) => void
  /** Quantity to bid; when no tiers, defaults to "1" */
  bidQuantity: string
  onBidQuantityChange: (value: string) => void
  /** Submit with quantity and amount (amount = price per unit) */
  onSubmit: (quantity: string, amount: string) => void
  isSubmitting: boolean
  isDisabled: boolean
  /** If the user already placed a bid */
  hasPlacedBid: boolean
  /** The user's existing bid amount for display */
  existingBidAmount?: string
  /** The user's existing bid quantity for display */
  existingBidQuantity?: string
  /** Price tiers; when present, quantity input is shown and validated */
  priceTiers?: PriceTier[]
  /** Auction total quantity (for validation hint) */
  auctionQuantity?: string
  quantityUnit?: string
  className?: string
}

export function BidComposer({
  auctionType,
  minBid,
  bidAmount,
  onBidAmountChange,
  bidQuantity,
  onBidQuantityChange,
  onSubmit,
  isSubmitting,
  isDisabled,
  hasPlacedBid,
  existingBidAmount,
  existingBidQuantity,
  priceTiers,
  auctionQuantity,
  quantityUnit,
  className,
}: BidComposerProps) {
  const isSell = auctionType === "SELL"
  const hasTiers = priceTiers && priceTiers.length > 0
  const tierForQty = hasTiers && bidQuantity ? getTierForQuantity(priceTiers, bidQuantity) : null
  const effectiveMinBid = tierForQty ? tierForQty.pricePerUnit : minBid
  const qtyNum = hasTiers && bidQuantity ? parseFloat(bidQuantity) : 0
  const priceNum = tierForQty ? parseFloat(tierForQty.pricePerUnit) : parseFloat(bidAmount || "0")
  const totalFromTier =
    hasTiers && tierForQty && Number.isFinite(qtyNum) && Number.isFinite(priceNum) && qtyNum > 0
      ? qtyNum * priceNum
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = hasTiers ? bidQuantity : "1"
    if (!qty || parseFloat(qty) <= 0) return
    if (hasTiers) {
      const tier = getTierForQuantity(priceTiers!, qty)
      if (!tier) return
      onSubmit(qty, tier.pricePerUnit)
    } else {
      if (!bidAmount || parseFloat(bidAmount) <= 0) return
      onSubmit(qty, bidAmount)
    }
  }

  if (hasPlacedBid) {
    const qty = existingBidQuantity ? parseFloat(existingBidQuantity) : 0
    const amt = existingBidAmount ? parseFloat(existingBidAmount) : 0
    const total = qty > 1 && Number.isFinite(amt) ? qty * amt : null
    const displayText =
      total != null
        ? `Your bid: ${existingBidQuantity} × ETB ${existingBidAmount} = ETB ${total.toLocaleString()} (securely recorded)`
        : existingBidQuantity && parseFloat(existingBidQuantity) > 1
          ? `Your bid of ${existingBidQuantity} × ETB ${existingBidAmount ?? "—"} is securely recorded.`
          : existingBidAmount
            ? `Your bid of ETB ${existingBidAmount} is securely recorded.`
            : "Your bid is securely recorded."
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center py-4", className)}>
        <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
        </div>
        <div>
          <h4 className="font-bold text-foreground">Bid Submitted!</h4>
          <p className="text-sm text-muted-foreground mt-1">{displayText}</p>
        </div>
        <div className="w-full p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
          Bids are hidden until the reveal phase
        </div>
      </div>
    )
  }

  const canSubmit = hasTiers
    ? !!bidQuantity && parseFloat(bidQuantity) > 0 && !!tierForQty
    : !!bidAmount && parseFloat(bidAmount) > 0

  const tierMinMax = React.useMemo(() => {
    if (!hasTiers || !priceTiers!.length) return null
    let minV = Number.POSITIVE_INFINITY
    let maxV = 0
    for (const t of priceTiers!) {
      const m = parseFloat(t.minQty)
      if (Number.isFinite(m) && m < minV) minV = m
      if (t.maxQty != null) {
        const mx = parseFloat(t.maxQty)
        if (Number.isFinite(mx) && mx > maxV) maxV = mx
      }
    }
    const aq = auctionQuantity ? parseFloat(auctionQuantity) : NaN
    if (Number.isFinite(aq) && aq > maxV) maxV = aq
    return {
      min: Number.isFinite(minV) ? minV : 1,
      max: maxV > 0 ? maxV : undefined,
    }
  }, [hasTiers, priceTiers, auctionQuantity])

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)}>
      {hasTiers ? (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-foreground" htmlFor="bid-quantity">
              Quantity{quantityUnit ? ` (${quantityUnit})` : ""}
            </label>
            <p className="text-xs text-muted-foreground">
              {tierForQty
                ? `Tier: ${tierForQty.minQty}–${tierForQty.maxQty ?? "∞"} ${quantityUnit ?? ""} @ ETB ${tierForQty.pricePerUnit}/unit`
                : auctionQuantity
                  ? `Enter quantity within a tier range (up to ${auctionQuantity}${quantityUnit ? ` ${quantityUnit}` : ""})`
                  : "Enter quantity within a valid tier range (see price tiers below)"}
            </p>
            <Input
              id="bid-quantity"
              type="number"
              placeholder={tierMinMax ? `e.g. ${tierMinMax.min}` : "Enter quantity"}
              value={bidQuantity}
              onChange={(e) => onBidQuantityChange(e.target.value)}
              min={tierMinMax?.min}
              max={tierMinMax?.max}
              step="1"
              disabled={isDisabled || isSubmitting}
              required
              className="text-lg font-bold h-12"
            />
            {bidQuantity && !tierForQty && parseFloat(bidQuantity) > 0 && (
              <p className="text-xs text-destructive font-medium">
                Quantity must fall within a tier range (see price tiers)
              </p>
            )}
            {totalFromTier != null && (
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="text-sm font-bold text-foreground">
                  Total: {bidQuantity} × ETB {tierForQty!.pricePerUnit} = ETB {totalFromTier.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
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
              step="0.01"
              disabled={isDisabled || isSubmitting}
              required
              className="text-lg font-bold h-12"
            />
          </div>
        </>
      )}

      <div className="p-3 rounded-lg bg-muted/70 border border-border/50 text-xs text-muted-foreground">
        <span className="material-symbols-outlined text-sm align-middle mr-1 text-primary">info</span>
        Your bid is sealed and{" "}
        <span className="font-semibold text-foreground">hidden from others</span>{" "}
        until the reveal phase.
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isDisabled || isSubmitting || !canSubmit}
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
