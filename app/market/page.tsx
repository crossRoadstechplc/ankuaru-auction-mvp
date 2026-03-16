"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/src/components/ui/loading-state";
import { useMarketListingsQuery } from "@/src/features/market/queries/hooks";
import { MarketListing } from "@/src/features/market/types/market.types";
import {
  formatMarketPercent,
  formatMarketPrice,
  getMarketToneClasses,
  getMarketTrend,
  groupListingsByName,
  summarizeMarketListings,
} from "@/src/features/market/utils/market.utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Package,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import MarketListingsTable from "./components/MarketListingsTable";
import MarketMetricCard from "./components/MarketMetricCard";

const EMPTY_MARKET_LISTINGS: MarketListing[] = [];

function TrendDirectionIcon({
  trend,
}: {
  trend: ReturnType<typeof getMarketTrend>;
}) {
  if (trend === "up") {
    return <ArrowUpRight className="size-4" />;
  }

  if (trend === "down") {
    return <ArrowDownRight className="size-4" />;
  }

  return <Activity className="size-4" />;
}

export default function MarketPage() {
  const { data, isLoading, refetch, isFetching } = useMarketListingsQuery();
  const listings = data?.listings ?? EMPTY_MARKET_LISTINGS;
  const summary = useMemo(() => summarizeMarketListings(listings), [listings]);
  const groupedByCommodity = useMemo(
    () => groupListingsByName(listings).slice(0, 6),
    [listings],
  );
  const topAdvancers = useMemo(
    () =>
      [...listings]
        .filter((listing) => getMarketTrend(listing) === "up")
        .sort(
          (left, right) =>
            (right.changePercent ?? Number.NEGATIVE_INFINITY) -
            (left.changePercent ?? Number.NEGATIVE_INFINITY),
        )
        .slice(0, 4),
    [listings],
  );
  const topDecliners = useMemo(
    () =>
      [...listings]
        .filter((listing) => getMarketTrend(listing) === "down")
        .sort(
          (left, right) =>
            (left.changePercent ?? Number.POSITIVE_INFINITY) -
            (right.changePercent ?? Number.POSITIVE_INFINITY),
        )
        .slice(0, 4),
    [listings],
  );
  const lastUpdatedLabel = data?.fetchedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(data.fetchedAt))
    : null;

  return (
    <PageShell>
      <Header />
      <PageContainer className="max-w-[1480px] space-y-8 py-8 md:py-10">
        <PageHeader
          title="Market Board"
          description="Live commodity tape, leading movers, and a full price board built from market listings."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={data?.source === "live" ? "success" : "secondary"}
              >
                {data?.source === "live" ? "Live feed" : "Preview fallback"}
              </Badge>
              {lastUpdatedLabel ? (
                <Badge variant="outline">Updated {lastUpdatedLabel}</Badge>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCcw
                  className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          }
        />

        <PageSection>
          <div className="rounded-xl border border-primary/20 bg-[linear-gradient(135deg,rgba(61,127,93,0.14),rgba(255,255,255,0.94),rgba(61,127,93,0.05))] p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Live Commodity Tape
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/feed">
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="material-symbols-outlined text-sm">
                      storefront
                    </span>
                    Back to marketplace
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => void refetch()}
                >
                  <span className="material-symbols-outlined text-sm">
                    monitor_heart
                  </span>
                  Watch market
                </Button>
              </div>
            </div>
          </div>
        </PageSection>

        <PageSection>
          {isLoading && listings.length === 0 ? (
            <LoadingState type="card" count={4} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MarketMetricCard
                label="Tracked Listings"
                value={summary.totalListings.toString()}
                description="Total instruments currently on the board."
                icon={<Package className="size-5" />}
                accentClassName="bg-primary/12 text-primary"
              />
              <MarketMetricCard
                label="Priced Quotes"
                value={summary.pricedListings.toString()}
                description={`${summary.unpricedListings} listings are still waiting for a quote.`}
                icon={<CircleDollarSign className="size-5" />}
                accentClassName="bg-blue-500/12 text-blue-600"
              />
              <MarketMetricCard
                label="Advancers / Decliners"
                value={`${summary.advancers} / ${summary.decliners}`}
                description={`${summary.flatListings} listings are flat or awaiting movement.`}
                icon={<BarChart3 className="size-5" />}
                accentClassName="bg-emerald-500/12 text-emerald-600"
              />
              <MarketMetricCard
                label="Average Quote"
                value={formatMarketPrice(
                  "ETB",
                  Math.round(summary.averagePrice),
                )}
                description="Average price across all currently quoted listings."
                icon={<Activity className="size-5" />}
                accentClassName="bg-amber-500/12 text-amber-600"
              />
            </div>
          )}
        </PageSection>

        <PageSection>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <PanelCard
              title="Leaders and Laggards"
              description="Highest gainers, biggest declines, and the top-priced quote."
              className="xl:col-span-7"
              bodyClassName="space-y-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    title: "Top gainer",
                    listing: summary.topGainer,
                    empty: "No advancing listing yet.",
                  },
                  {
                    title: "Biggest drop",
                    listing: summary.topLoser,
                    empty: "No declining listing yet.",
                  },
                  {
                    title: "Highest price",
                    listing: summary.highestPriced,
                    empty: "No priced listing yet.",
                  },
                ].map((item) => {
                  const trend = item.listing
                    ? getMarketTrend(item.listing)
                    : "unpriced";
                  const tone = getMarketToneClasses(trend);

                  return (
                    <div
                      key={item.title}
                      className={`rounded-xl border bg-card/70 p-4 ${tone.border}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {item.title}
                      </p>
                      {item.listing ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${tone.badge}`}
                            >
                              <TrendDirectionIcon trend={trend} />
                              {item.listing.code}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {item.listing.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatMarketPrice(
                              item.listing.currency,
                              item.listing.price,
                            )}
                          </p>
                          <p className={`text-sm font-semibold ${tone.text}`}>
                            {formatMarketPercent(item.listing.changePercent)}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {item.empty}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                    Strongest Advancers
                  </p>
                  <div className="mt-3 space-y-3">
                    {topAdvancers.length > 0 ? (
                      topAdvancers.map((listing) => (
                        <div
                          key={listing.code}
                          className="flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {listing.code}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {listing.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {formatMarketPrice(
                                listing.currency,
                                listing.price,
                              )}
                            </p>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                              {formatMarketPercent(listing.changePercent)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No advancing listings right now.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200/70 bg-rose-50/70 p-4 dark:border-rose-900/70 dark:bg-rose-950/20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
                    Sharpest Declines
                  </p>
                  <div className="mt-3 space-y-3">
                    {topDecliners.length > 0 ? (
                      topDecliners.map((listing) => (
                        <div
                          key={listing.code}
                          className="flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {listing.code}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {listing.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {formatMarketPrice(
                                listing.currency,
                                listing.price,
                              )}
                            </p>
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                              {formatMarketPercent(listing.changePercent)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No declining listings right now.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </PanelCard>

            <PanelCard
              title="Commodity Breadth"
              description="Grouped observation by commodity family."
              className="xl:col-span-5"
              bodyClassName="space-y-3"
            >
              {groupedByCommodity.length > 0 ? (
                groupedByCommodity.map((group) => {
                  const trend =
                    group.averageChangePercent === null
                      ? "unpriced"
                      : group.averageChangePercent > 0
                        ? "up"
                        : group.averageChangePercent < 0
                          ? "down"
                          : "flat";
                  const tone = getMarketToneClasses(trend);

                  return (
                    <div
                      key={group.name}
                      className={`rounded-xl border px-4 py-3 ${tone.border}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {group.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.listings} listings, {group.priced} priced
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {group.priced > 0
                              ? formatMarketPrice(
                                  "ETB",
                                  Math.round(group.averagePrice),
                                )
                              : "No quote"}
                          </p>
                          <p className={`text-xs font-semibold ${tone.text}`}>
                            {formatMarketPercent(group.averageChangePercent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Commodity breadth will appear when listings are available.
                </p>
              )}
            </PanelCard>
          </div>
        </PageSection>

        <PageSection>
          <PanelCard
            title="Complete Listings Board"
            description="Search, filter, and inspect the full market list."
            action={
              <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                {summary.totalListings} listings
              </Badge>
            }
            bodyClassName="space-y-4"
          >
            {isLoading && listings.length === 0 ? (
              <LoadingState type="list" count={6} />
            ) : (
              <MarketListingsTable listings={listings} />
            )}
          </PanelCard>
        </PageSection>
      </PageContainer>
      <Footer />
    </PageShell>
  );
}
