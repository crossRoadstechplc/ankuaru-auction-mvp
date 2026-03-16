export interface MarketListing {
  code: string;
  name: string;
  currency: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  type: string;
}

export type MarketTrend = "up" | "down" | "flat" | "unpriced";
export type MarketDataSource = "live" | "mock";

export interface MarketListingsResult {
  listings: MarketListing[];
  source: MarketDataSource;
  fetchedAt: string;
}
