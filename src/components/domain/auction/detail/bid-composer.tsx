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

function parseMoney(value: string): number {
  const n = parseFloat(String(value).replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : NaN
}

/** Starting / floor total for a tier bid = quantity × tier minimum per unit. */
function tierMinimumTotal(quantity: number, floorPerUnit: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(floorPerUnit))
    return NaN
  return quantity * floorPerUnit
}

/**
 * True when bid total (qty × unit) is not below the starting total (qty × floor per unit).
 * Uses a small epsilon so float noise does not reject valid bids.
 */
export function bidTotalMeetsStartingMinimum(
  quantity: number,
  unitPrice: number,
  floorPerUnit: number,
): boolean {
  const minTotal = tierMinimumTotal(quantity, floorPerUnit)
  if (!Number.isFinite(minTotal) || !Number.isFinite(unitPrice)) return false
  const bidTotal = quantity * unitPrice
  return bidTotal + 1e-4 >= minTotal - 1e-9
}

/** Stable key for “which tier” only — avoids re-syncing when API clones tiers with same numeric price. */
function tierIdentity(tier: PriceTier | null): string | null {
  if (!tier) return null
  const p = parseMoney(tier.pricePerUnit)
  const pKey = Number.isFinite(p) ? String(p) : String(tier.pricePerUnit)
  return `${tier.minQty}|${tier.maxQty ?? ""}|${pKey}`
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
  /** Display currency (ETB or USD) */
  currency?: string
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
  currency: currencyProp,
  className,
}: BidComposerProps) {
  const currency =
    currencyProp?.trim().toUpperCase() === "USD" ? "USD" : "ETB"
  const isSell = auctionType === "SELL"
  const hasTiers = priceTiers && priceTiers.length > 0
  const tierForQty =
    hasTiers && bidQuantity
      ? getTierForQuantity(priceTiers!, bidQuantity)
      : null

  const tierKey = tierIdentity(tierForQty)
  const prevTierKeyRef = React.useRef<string | null>(null)

  // Like sealed bids: never auto-fill unit price. When the quantity moves to a
  // different tier band, clear the price so the user enters a fresh amount ≥ that tier's floor.
  React.useEffect(() => {
    if (!hasTiers) return
    if (!tierForQty || !tierKey) {
      prevTierKeyRef.current = null
      return
    }
    if (prevTierKeyRef.current !== tierKey) {
      prevTierKeyRef.current = tierKey
      onBidAmountChange("")
    }
  }, [hasTiers, tierKey, tierForQty, onBidAmountChange])

  const floorPerUnit = tierForQty ? parseMoney(tierForQty.pricePerUnit) : NaN
  const enteredPerUnit = bidAmount.trim() ? parseMoney(bidAmount) : NaN
  const effectivePerUnit =
    hasTiers && tierForQty && Number.isFinite(floorPerUnit)
      ? bidAmount.trim() === ""
        ? NaN
        : Number.isFinite(enteredPerUnit)
          ? enteredPerUnit
          : NaN
      : !hasTiers
        ? parseFloat(bidAmount || "0")
        : NaN

  const qtyNum = hasTiers && bidQuantity ? parseFloat(bidQuantity) : 0
  const startingTotal =
    hasTiers && tierForQty && Number.isFinite(qtyNum) && Number.isFinite(floorPerUnit)
      ? tierMinimumTotal(qtyNum, floorPerUnit)
      : NaN
  const enteredBidTotal =
    hasTiers &&
    tierForQty &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0 &&
    Number.isFinite(effectivePerUnit)
      ? qtyNum * effectivePerUnit
      : NaN

  const totalPreview =
    hasTiers &&
    tierForQty &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0 &&
    Number.isFinite(effectivePerUnit) &&
    Number.isFinite(startingTotal) &&
    bidTotalMeetsStartingMinimum(qtyNum, effectivePerUnit, floorPerUnit)
      ? enteredBidTotal
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = hasTiers ? bidQuantity : "1"
    if (!qty || parseFloat(qty) <= 0) return
    if (hasTiers) {
      const tier = getTierForQuantity(priceTiers!, qty)
      if (!tier) return
      const floor = parseMoney(tier.pricePerUnit)
      if (!Number.isFinite(floor)) return
      const qtyN = parseFloat(qty)
      if (!Number.isFinite(qtyN) || qtyN <= 0) return
      const unitRaw = parseMoney(bidAmount.trim())
      if (!bidAmount.trim() || !Number.isFinite(unitRaw)) return
      const rounded = Math.round(unitRaw * 100) / 100
      if (!bidTotalMeetsStartingMinimum(qtyN, rounded, floor)) return
      onSubmit(qty, String(rounded))
    } else {
      if (!bidAmount || parseFloat(bidAmount) <= 0) return
      onSubmit(qty, bidAmount)
    }
  }

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

  if (hasPlacedBid) {
    const qty = existingBidQuantity ? parseFloat(existingBidQuantity) : 0
    const amt = existingBidAmount ? parseFloat(existingBidAmount) : 0
    const total = qty > 1 && Number.isFinite(amt) ? qty * amt : null
    const displayText =
      total != null
        ? `Your bid: ${existingBidQuantity} × ${currency} ${existingBidAmount} = ${currency} ${total.toLocaleString()} (securely recorded)`
        : existingBidQuantity && parseFloat(existingBidQuantity) > 1
          ? `Your bid of ${existingBidQuantity} × ${currency} ${existingBidAmount ?? "—"} is securely recorded.`
          : existingBidAmount
            ? `Your bid of ${currency} ${existingBidAmount} is securely recorded.`
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

  const tierTotalValid =
    !hasTiers ||
    !tierForQty ||
    (Number.isFinite(effectivePerUnit) &&
      Number.isFinite(qtyNum) &&
      qtyNum > 0 &&
      bidTotalMeetsStartingMinimum(qtyNum, effectivePerUnit, floorPerUnit))

  const canSubmit = hasTiers
    ? !!bidQuantity &&
      parseFloat(bidQuantity) > 0 &&
      !!tierForQty &&
      !!bidAmount.trim() &&
      tierTotalValid
    : !!bidAmount && parseFloat(bidAmount) > 0

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
                ? `Tier: ${tierForQty.minQty}–${tierForQty.maxQty ?? "∞"} ${quantityUnit ?? ""} · minimum ${currency} ${tierForQty.pricePerUnit}/unit`
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
          </div>

          {tierForQty ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-foreground" htmlFor="bid-unit-price">
                Your price per unit ({currency})
              </label>
              <p className="text-xs text-muted-foreground">
                Enter your price per unit. Your{" "}
                <span className="font-semibold text-foreground">bid total</span> (quantity ×
                unit price) cannot be less than the{" "}
                <span className="font-semibold text-foreground">starting total</span> for this
                tier:{" "}
                <span className="font-bold text-foreground">
                  {currency}{" "}
                  {Number.isFinite(startingTotal)
                    ? startingTotal.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0,
                      })
                    : "—"}{" "}
                </span>
                (= {bidQuantity} × {currency} {tierForQty.pricePerUnit} minimum per unit).
              </p>
              <Input
                id="bid-unit-price"
                type="number"
                placeholder={`e.g. ${tierForQty.pricePerUnit} or higher`}
                value={bidAmount}
                onChange={(e) => onBidAmountChange(e.target.value)}
                min={tierForQty.pricePerUnit}
                step="0.01"
                disabled={isDisabled || isSubmitting}
                required
                className="text-lg font-bold h-12"
              />
              {bidAmount.trim() &&
                Number.isFinite(enteredPerUnit) &&
                Number.isFinite(qtyNum) &&
                qtyNum > 0 &&
                Number.isFinite(startingTotal) &&
                !bidTotalMeetsStartingMinimum(qtyNum, enteredPerUnit, floorPerUnit) && (
                  <p className="text-xs text-destructive font-medium">
                    Bid total {currency}{" "}
                    {enteredBidTotal.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0,
                    })}{" "}
                    is below the starting total {currency}{" "}
                    {startingTotal.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0,
                    })}{" "}
                    ({bidQuantity} × {currency} {tierForQty.pricePerUnit}/unit minimum).
                  </p>
                )}
              {totalPreview != null && Number.isFinite(effectivePerUnit) && (
                <div className="mt-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                  <p className="text-sm font-bold text-foreground">
                    Your bid total: {bidQuantity} × {currency}{" "}
                    {effectivePerUnit.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits:
                        effectivePerUnit % 1 === 0 ? 0 : 2,
                    })}{" "}
                    = {currency}{" "}
                    {totalPreview.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-foreground" htmlFor="bid-amount">
              {isSell ? `Your bid (${currency})` : `Your offer (${currency})`}
            </label>
            <p className="text-xs text-muted-foreground">
              Minimum:{" "}
              <span className="font-bold text-foreground">
                {currency} {minBid}
              </span>
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
