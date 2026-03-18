"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarketListingsQuery } from "@/src/features/market/queries/hooks";
import { MarketListing } from "@/src/features/market/types/market.types";
import {
  formatMarketPercent,
  formatMarketPrice,
  getMarketToneClasses,
  getMarketTrend,
  summarizeMarketListings,
} from "@/src/features/market/utils/market.utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CircleDashed,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const EMPTY_MARKET_LISTINGS: MarketListing[] = [];
const MARKET_TICKER_HIDDEN_STORAGE_KEY = "market-ticker-hidden";

function TrendIcon({ trend }: { trend: ReturnType<typeof getMarketTrend> }) {
  switch (trend) {
    case "up":
      return <ArrowUpRight className="size-3.5" />;
    case "down":
      return <ArrowDownRight className="size-3.5" />;
    case "flat":
      return <Minus className="size-3.5" />;
    default:
      return <CircleDashed className="size-3.5" />;
  }
}

export default function MarketTickerBar() {
  const { data, isLoading } = useMarketListingsQuery();
  const [isReady, setIsReady] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const listings = data?.listings ?? EMPTY_MARKET_LISTINGS;
  const summary = useMemo(
    () => summarizeMarketListings(listings),
    [listings],
  );
  const tickerListings = useMemo(() => {
    if (listings.length === 0) {
      return [];
    }

    return [...listings, ...listings];
  }, [listings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(
      MARKET_TICKER_HIDDEN_STORAGE_KEY,
    );
    const timer = window.setTimeout(() => {
      setIsHidden(stored === "true");
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      MARKET_TICKER_HIDDEN_STORAGE_KEY,
      String(isHidden),
    );
  }, [isHidden, isReady]);

  if (!isReady) {
    return null;
  }

  if (isHidden) {
    return (
      <div className="w-full border-t border-border/60 bg-[linear-gradient(90deg,rgba(61,127,93,0.08),rgba(248,246,242,0.95),rgba(61,127,93,0.06))]">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Activity className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Market Pulse hidden
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Tap show to restore the live ticker.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsHidden(false)}
            aria-label="Show market pulse"
            className="shrink-0"
          >
            <span className="material-symbols-outlined text-sm">
              visibility
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="w-full border-t border-border/60 bg-muted/30 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-6 w-36 animate-pulse rounded-full bg-muted" />
          <div className="h-6 flex-1 animate-pulse rounded-full bg-muted" />
          <div className="hidden h-6 w-24 animate-pulse rounded-full bg-muted lg:block" />
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-t border-border/60 bg-[linear-gradient(90deg,rgba(61,127,93,0.08),rgba(248,246,242,0.95),rgba(61,127,93,0.06))]">
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Activity className="size-4" />
          </span>
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Market Pulse
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.advancers} up / {summary.decliners} down / {summary.unpricedListings} no quote
            </p>
          </div>
          <Badge
            variant={data?.source === "live" ? "success" : "secondary"}
            className="ml-1"
          >
            {data?.source === "live" ? "Live" : "Preview"}
          </Badge>
        </div>

        <div className="market-ticker relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent" />
          <div className="market-ticker-track flex min-w-max items-center gap-3 py-0.5 pr-3">
            {tickerListings.map((listing, index) => {
              const trend = getMarketTrend(listing);
              const tone = getMarketToneClasses(trend);

              return (
                <div
                  key={`${listing.code}-${index}`}
                  className={`inline-flex items-center gap-3 rounded-full border px-3 py-1.5 shadow-sm ${tone.badge}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em]">
                      {listing.code}
                    </span>
                    <span className="text-xs font-medium opacity-85">
                      {listing.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold">
                    {formatMarketPrice(listing.currency, listing.price, true)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${tone.text}`}>
                    <TrendIcon trend={trend} />
                    {formatMarketPercent(listing.changePercent)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsHidden(true)}
          aria-label="Hide market pulse"
          className="shrink-0"
        >
          <span className="material-symbols-outlined text-sm">
            visibility_off
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="shrink-0 gap-2"
        >
          <Link href="/market">
            <span className="material-symbols-outlined text-sm">
              query_stats
            </span>
            <span className="hidden sm:inline">Full Market</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
