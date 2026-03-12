export const auctionsQueryKeys = {
  all: () => ["auctions"] as const,
  list: () => ["auctions", "list"] as const,
  detail: (id: string) => ["auctions", "detail", id] as const,
  byUser: (userId: string) => ["auctions", "byUser", userId] as const,
} as const;
