import {
  MarketListing,
  MarketTrend,
} from "@/src/features/market/types/market.types";

export interface MarketSnapshotSummary {
  totalListings: number;
  pricedListings: number;
  advancers: number;
  decliners: number;
  flatListings: number;
  unpricedListings: number;
  averagePrice: number;
  topGainer: MarketListing | null;
  topLoser: MarketListing | null;
  highestPriced: MarketListing | null;
}

export function getMarketTrend(listing: MarketListing): MarketTrend {
  if (listing.price === null) {
    return "unpriced";
  }

  if (listing.changePercent === null && listing.change === null) {
    return "flat";
  }

  const direction = listing.changePercent ?? listing.change ?? 0;
  if (direction > 0) {
    return "up";
  }

  if (direction < 0) {
    return "down";
  }

  return "flat";
}

export function formatMarketPrice(
  currency: string,
  price: number | null,
  compact = false,
): string {
  if (price === null) {
    return "No quote";
  }

  return `${currency} ${new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(price)}`;
}

export function formatMarketChange(
  value: number | null,
  currency?: string,
): string {
  if (value === null) {
    return "No change data";
  }

  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
  }).format(value);

  return currency ? `${sign}${currency} ${formatted}` : `${sign}${formatted}`;
}

export function formatMarketPercent(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function getMarketToneClasses(trend: MarketTrend): {
  badge: string;
  text: string;
  border: string;
  accent: string;
} {
  switch (trend) {
    case "up":
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
        text: "text-emerald-600 dark:text-emerald-300",
        border: "border-emerald-200/70 dark:border-emerald-900/70",
        accent: "bg-emerald-500",
      };
    case "down":
      return {
        badge:
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300",
        text: "text-rose-600 dark:text-rose-300",
        border: "border-rose-200/70 dark:border-rose-900/70",
        accent: "bg-rose-500",
      };
    case "flat":
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300",
        text: "text-amber-600 dark:text-amber-300",
        border: "border-amber-200/70 dark:border-amber-900/70",
        accent: "bg-amber-500",
      };
    default:
      return {
        badge:
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        text: "text-slate-500 dark:text-slate-400",
        border: "border-slate-200/70 dark:border-slate-800",
        accent: "bg-slate-400",
      };
  }
}

export function getMarketStatusLabel(listing: MarketListing): string {
  switch (getMarketTrend(listing)) {
    case "up":
      return "Advancing";
    case "down":
      return "Declining";
    case "flat":
      return listing.changePercent === null && listing.change === null
        ? "Awaiting move"
        : "Unchanged";
    default:
      return "No quote";
  }
}

export function summarizeMarketListings(
  listings: MarketListing[],
): MarketSnapshotSummary {
  const pricedListings = listings.filter((listing) => listing.price !== null);
  const moveListings = pricedListings.filter(
    (listing) => listing.changePercent !== null || listing.change !== null,
  );
  const advancers = pricedListings.filter(
    (listing) => getMarketTrend(listing) === "up",
  ).length;
  const decliners = pricedListings.filter(
    (listing) => getMarketTrend(listing) === "down",
  ).length;
  const flatListings = pricedListings.filter(
    (listing) => getMarketTrend(listing) === "flat",
  ).length;
  const unpricedListings = listings.length - pricedListings.length;
  const topGainer =
    [...moveListings].sort(
      (left, right) =>
        (right.changePercent ?? right.change ?? Number.NEGATIVE_INFINITY) -
        (left.changePercent ?? left.change ?? Number.NEGATIVE_INFINITY),
    )[0] ?? null;
  const topLoser =
    [...moveListings].sort(
      (left, right) =>
        (left.changePercent ?? left.change ?? Number.POSITIVE_INFINITY) -
        (right.changePercent ?? right.change ?? Number.POSITIVE_INFINITY),
    )[0] ?? null;
  const highestPriced =
    [...pricedListings].sort(
      (left, right) => (right.price ?? 0) - (left.price ?? 0),
    )[0] ?? null;
  const averagePrice =
    pricedListings.length > 0
      ? pricedListings.reduce((total, listing) => total + (listing.price ?? 0), 0) /
        pricedListings.length
      : 0;

  return {
    totalListings: listings.length,
    pricedListings: pricedListings.length,
    advancers,
    decliners,
    flatListings,
    unpricedListings,
    averagePrice,
    topGainer,
    topLoser,
    highestPriced,
  };
}

export function groupListingsByName(listings: MarketListing[]): Array<{
  name: string;
  listings: number;
  priced: number;
  averagePrice: number;
  averageChangePercent: number | null;
}> {
  const grouped = new Map<string, MarketListing[]>();

  listings.forEach((listing) => {
    const key = listing.name || "Unlabeled";
    const current = grouped.get(key) ?? [];
    current.push(listing);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .map(([name, group]) => {
      const priced = group.filter((listing) => listing.price !== null);
      const changeValues = group
        .map((listing) => listing.changePercent)
        .filter((value): value is number => value !== null);

      return {
        name,
        listings: group.length,
        priced: priced.length,
        averagePrice:
          priced.length > 0
            ? priced.reduce((total, listing) => total + (listing.price ?? 0), 0) /
              priced.length
            : 0,
        averageChangePercent:
          changeValues.length > 0
            ? changeValues.reduce((total, value) => total + value, 0) /
              changeValues.length
            : null,
      };
    })
    .sort((left, right) => right.listings - left.listings || left.name.localeCompare(right.name));
}
