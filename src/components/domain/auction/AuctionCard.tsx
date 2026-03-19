"use client";

import { Button } from "@/components/ui/button";
import { Auction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getImageWithFallback } from "@/lib/imageUtils";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

interface AuctionCardProps {
  auction: Auction;
}

function formatMoney(value?: string) {
  if (!value) {
    return null;
  }

  return `ETB ${value}`;
}

function getStatusTone(status: Auction["status"]) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "REVEAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "CLOSED":
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "SCHEDULED":
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  }
}

function getTimeSummary(auction: Auction) {
  const targetDate =
    auction.status === "SCHEDULED" ? new Date(auction.startAt) : new Date(auction.endAt);
  const isPast = targetDate.getTime() <= Date.now();

  if (auction.status === "CLOSED") {
    return "Closed";
  }

  if (isPast) {
    return auction.status === "SCHEDULED" ? "Starting now" : "Ending now";
  }

  const distance = formatDistanceToNowStrict(targetDate);
  return auction.status === "SCHEDULED" ? `Starts in ${distance}` : `Ends in ${distance}`;
}

function getModeLabel(type: Auction["auctionType"]) {
  return type === "SELL" ? "Sell auction" : "Buy request";
}

function getPrimaryActionLabel(status: Auction["status"]) {
  if (status === "REVEAL") {
    return "View Reveal";
  }

  if (status === "CLOSED") {
    return "See Results";
  }

  return "Open Auction";
}

function joinVisible(values: Array<string | undefined>) {
  return values.filter(Boolean).join(" / ");
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const metadata = joinVisible([
    auction.productName,
    auction.auctionCategory,
    auction.region,
  ]);
  const properties = joinVisible([
    auction.grade ? `Grade ${auction.grade}` : undefined,
    auction.quantity
      ? `${auction.quantity}${auction.quantityUnit ? ` ${auction.quantityUnit}` : ""}`
      : undefined,
  ]);
  const openingPrice = formatMoney(auction.minBid || auction.reservePrice);
  const imageUrl = getImageWithFallback(
    auction.image?.includes("example.com") ? undefined : auction.image,
  );
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 dark:text-slate-50 md:text-[1.05rem]">
              {auction.title}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                getStatusTone(auction.status),
              )}
            >
              {auction.status}
            </span>
          </div>

          {metadata ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{metadata}</p>
          ) : null}

          {properties ? (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {properties}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {openingPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Opening price</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {openingPrice}
                </span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Time</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {getTimeSummary(auction)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Mode</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {getModeLabel(auction.auctionType)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
              {auction.itemDescription}
            </p>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full px-4 font-semibold shadow-sm"
            >
              <Link href={`/auction/${auction.id}`}>{getPrimaryActionLabel(auction.status)}</Link>
            </Button>
          </div>
        </div>

        {auction.image ? (
          <div className="hidden shrink-0 md:block">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <img
                src={imageUrl}
                alt={auction.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
