"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { getLowestTierPrice } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

interface FeedPostMetaProps {
  auctionType: "SELL" | "BUY";
  status: string;
  minBid: string;
  reservePrice?: string;
  quantity?: string;
  quantityUnit?: string;
  priceTiers?: PriceTier[];
  /** From auction listing; defaults to ETB when absent */
  currency?: string;
  startAt: string;
  endAt: string;
  bidCount?: number;
  createdAt?: string;
}

function formatNumericValue(value?: string): string | null {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed);
}

export function FeedPostMeta({
  auctionType,
  status,
  minBid,
  reservePrice,
  quantity,
  quantityUnit,
  priceTiers,
  currency: currencyProp,
  startAt,
  endAt,
  bidCount,
  createdAt,
}: FeedPostMetaProps) {
  const currency =
    currencyProp?.trim().toUpperCase() === "USD" ? "USD" : "ETB";
  const [showPriceTiers, setShowPriceTiers] = useState(false);
  const lowestTierPrice = getLowestTierPrice(priceTiers);
  const startingPriceDisplay = lowestTierPrice
    ? `From ${currency} ${formatNumericValue(lowestTierPrice) || lowestTierPrice}/unit`
    : `${currency} ${formatNumericValue(minBid) || minBid}`;
  const quantityDisplay = quantity
    ? `${formatNumericValue(quantity) || quantity}${quantityUnit ? ` ${quantityUnit}` : ""}`
    : "—";
  const isClosed = status === "CLOSED";
  const isScheduled = status === "SCHEDULED";

  const timingValue = isClosed
    ? "Ended"
    : isScheduled
      ? formatDistanceToNowStrict(new Date(startAt), { addSuffix: true })
      : formatDistanceToNowStrict(new Date(endAt), { addSuffix: true });
  const timingLabel = isScheduled ? "Opens" : isClosed ? "Ended" : "Closing";

  const hasReserve = reservePrice && formatNumericValue(reservePrice);
  const hasPriceTiers = priceTiers && priceTiers.length > 0;

  const hoursToEnd = !isClosed && !isScheduled
    ? (new Date(endAt).getTime() - Date.now()) / (1000 * 60 * 60)
    : null;
  const isEndsSoon = hoursToEnd !== null && hoursToEnd > 0 && hoursToEnd < 24;

  const hoursSinceCreated = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    : null;
  const isNew = hoursSinceCreated !== null && hoursSinceCreated < 24;

  const isPopular = (bidCount ?? 0) >= 5;

  const highlight =
    isEndsSoon ? "Ends soon" : isNew ? "New" : isPopular ? "Popular" : null;

  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-4">
        <div className="min-w-0">
          <p className={labelClass}>Starting price</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <p className="text-base font-bold leading-tight tracking-tight text-slate-900 sm:text-lg dark:text-white">
              {startingPriceDisplay}
            </p>
            {hasPriceTiers ? (
              <button
                type="button"
                onClick={() => setShowPriceTiers((v) => !v)}
                className="flex shrink-0 rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label={showPriceTiers ? "Hide price tiers" : "Show full price tiers"}
              >
                <ChevronDown
                  className={`size-[18px] transition-transform ${showPriceTiers ? "rotate-180" : ""}`}
                />
              </button>
            ) : null}
          </div>
          {hasReserve ? (
            <p className="mt-2 inline-flex max-w-full rounded-lg border border-slate-200/90 bg-slate-100/95 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100">
              Reserve: {currency} {formatNumericValue(reservePrice)}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className={labelClass}>Quantity</p>
          <p className="mt-1 text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-slate-100">
            {quantityDisplay}
          </p>
        </div>
        <div className="min-w-0">
          <p className={labelClass}>{timingLabel}</p>
          <p
            className="mt-1 text-sm font-semibold leading-tight text-slate-800 sm:text-base dark:text-slate-200"
            title={
              isClosed
                ? `Closed ${format(new Date(endAt), "MMM d, h:mm a")}`
                : isScheduled
                  ? `Starts ${format(new Date(startAt), "MMM d, h:mm a")}`
                  : `Ends ${format(new Date(endAt), "MMM d, h:mm a")}`
            }
          >
            {timingValue}
            {highlight ? (
              <span
                className={
                  isEndsSoon
                    ? "text-amber-600 dark:text-amber-400"
                    : isNew
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {" "}
                · {highlight}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {showPriceTiers && hasPriceTiers ? (
        <div className="rounded-lg border border-slate-200/60 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Price tiers
          </p>
          <div className="space-y-1 text-xs">
            {priceTiers!.map((tier, i) => (
              <div
                key={i}
                className="flex flex-wrap justify-between gap-x-3 gap-y-0.5"
              >
                <span className="text-slate-600 dark:text-slate-300">
                  {formatNumericValue(tier.minQty)}
                  {tier.maxQty ? ` – ${formatNumericValue(tier.maxQty)}` : "+"} units
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {currency} {formatNumericValue(tier.pricePerUnit)}/unit
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
