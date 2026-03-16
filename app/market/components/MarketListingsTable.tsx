"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MarketListing } from "@/src/features/market/types/market.types";
import {
  formatMarketChange,
  formatMarketPercent,
  formatMarketPrice,
  getMarketStatusLabel,
  getMarketToneClasses,
  getMarketTrend,
} from "@/src/features/market/utils/market.utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDashed,
  Minus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

type TrendFilter = "all" | "up" | "down" | "flat" | "unpriced";
type SortMode = "move" | "price" | "code";

interface MarketListingsTableProps {
  listings: MarketListing[];
}

function TrendIcon({ trend }: { trend: ReturnType<typeof getMarketTrend> }) {
  switch (trend) {
    case "up":
      return <ArrowUpRight className="size-4" />;
    case "down":
      return <ArrowDownRight className="size-4" />;
    case "flat":
      return <Minus className="size-4" />;
    default:
      return <CircleDashed className="size-4" />;
  }
}

export default function MarketListingsTable({
  listings,
}: MarketListingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [trendFilter, setTrendFilter] = useState<TrendFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("move");

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...listings]
      .filter((listing) => {
        const trend = getMarketTrend(listing);

        if (trendFilter !== "all" && trend !== trendFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          listing.code.toLowerCase().includes(normalizedSearch) ||
          listing.name.toLowerCase().includes(normalizedSearch) ||
          listing.type.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((left, right) => {
        if (sortMode === "price") {
          return (right.price ?? Number.NEGATIVE_INFINITY) - (left.price ?? Number.NEGATIVE_INFINITY);
        }

        if (sortMode === "code") {
          return left.code.localeCompare(right.code);
        }

        const leftMove = Math.abs(left.changePercent ?? left.change ?? Number.NEGATIVE_INFINITY);
        const rightMove = Math.abs(right.changePercent ?? right.change ?? Number.NEGATIVE_INFINITY);

        return rightMove - leftMove;
      });
  }, [listings, searchTerm, sortMode, trendFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by code, commodity, or type"
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["up", "Advancing"],
              ["down", "Declining"],
              ["flat", "Flat"],
              ["unpriced", "Unpriced"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTrendFilter(value as TrendFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  trendFilter === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="move">Biggest move</option>
              <option value="price">Highest price</option>
              <option value="code">Code A-Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/95">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="bg-muted/35">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Move</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => {
                const trend = getMarketTrend(listing);
                const tone = getMarketToneClasses(trend);

                return (
                  <tr
                    key={listing.code}
                    className="border-t border-border/60 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${tone.accent}`} />
                        <div>
                          <p className="font-semibold text-foreground">
                            {listing.code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {listing.currency}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-foreground">{listing.name}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant="outline" className="rounded-full">
                        {listing.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-foreground">
                        {formatMarketPrice(listing.currency, listing.price)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className={`font-semibold ${tone.text}`}>
                        {formatMarketChange(listing.change, listing.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                        <TrendIcon trend={trend} />
                        {formatMarketPercent(listing.changePercent)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-sm font-medium text-foreground">
                        {getMarketStatusLabel(listing)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredListings.length === 0 ? (
          <div className="border-t border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
            No market listings match the current search or filter.
          </div>
        ) : null}
      </div>
    </div>
  );
}
