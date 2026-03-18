import type { AuctionFormOptionsParams } from "@/lib/types";

export const auctionsQueryKeys = {
  all: () => ["auctions"] as const,
  list: () => ["auctions", "list"] as const,
  detail: (id: string) => ["auctions", "detail", id] as const,
  report: (id: string) => ["auctions", "report", id] as const,
  formOptions: (params: AuctionFormOptionsParams = {}) =>
    [
      "auctions",
      "formOptions",
      {
        category: params.category ?? null,
        productName: params.productName ?? null,
      },
    ] as const,
  byUser: (userId: string) => ["auctions", "byUser", userId] as const,
} as const;
