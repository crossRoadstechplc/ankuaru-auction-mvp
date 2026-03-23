/**
 * Shared formatting utilities for numbers, currency, dates, and IDs.
 */

import type { PriceTier } from "./types";

export function formatNumber(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const normalized = String(value).replace(/,/g, "").trim();
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return value;
  }

  return numeric.toLocaleString("en-US", {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  });
}

export function formatEtbValue(value?: string | null): string {
  const formatted = formatNumber(value);
  return formatted === "—" ? "ETB —" : `ETB ${formatted}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatShortDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function shortId(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return value.length > 8 ? `${value.slice(0, 8)}...` : value.slice(0, 8);
}

export function getLowestTierPrice(priceTiers?: PriceTier[] | null): string | null {
  if (!priceTiers || priceTiers.length === 0) return null;
  let lowest = Number.POSITIVE_INFINITY;
  for (const t of priceTiers) {
    const p = parseFloat(t.pricePerUnit);
    if (Number.isFinite(p) && p < lowest) lowest = p;
  }
  return Number.isFinite(lowest) ? lowest.toString() : null;
}

/** Get comparable bid value: quantity × amount when both exist, else revealedAmount, else amount */
export function getBidTotal(bid: {
  quantity?: string | null;
  amount?: string | null;
  revealedAmount?: string | null;
}): number {
  const qty = bid.quantity ? parseFloat(String(bid.quantity).replace(/,/g, "")) : NaN;
  const amt = bid.amount ? parseFloat(String(bid.amount).replace(/,/g, "")) : NaN;
  if (Number.isFinite(qty) && Number.isFinite(amt) && qty > 0) {
    return qty * amt;
  }
  const rev = bid.revealedAmount ? parseFloat(String(bid.revealedAmount).replace(/,/g, "")) : NaN;
  if (Number.isFinite(rev)) return rev;
  return Number.isFinite(amt) ? amt : 0;
}

/** Format bid for display: "Qty × ETB X = ETB Total" when quantity>1, else "ETB X" */
export function formatBidDisplayValue(bid: {
  quantity?: string | null;
  amount?: string | null;
  revealedAmount?: string | null;
}): string {
  const qty = bid.quantity ? parseFloat(String(bid.quantity).replace(/,/g, "")) : NaN;
  const amt = bid.amount ? parseFloat(String(bid.amount).replace(/,/g, "")) : NaN;
  if (Number.isFinite(qty) && qty > 1 && Number.isFinite(amt)) {
    const total = getBidTotal(bid);
    return `${bid.quantity} × ETB ${formatNumber(bid.amount)} = ETB ${formatNumber(total.toString())}`;
  }
  const fallback = bid.revealedAmount ?? bid.amount ?? "—";
  return formatEtbValue(fallback);
}

export function resolveAuctionDisplayPrice(auction: {
  priceTiers?: PriceTier[] | null;
  currentBid?: string | null;
  winningBid?: string | null;
  reservePrice?: string | null;
  minBid?: string | null;
}): number {
  const tierPrice = getLowestTierPrice(auction.priceTiers);
  if (tierPrice) {
    const p = parseFloat(tierPrice);
    if (Number.isFinite(p)) return p;
  }
  return Number(
    auction.currentBid ||
      auction.winningBid ||
      auction.reservePrice ||
      auction.minBid ||
      0,
  );
}
