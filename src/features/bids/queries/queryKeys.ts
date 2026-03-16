export const bidsQueryKeys = {
  all: () => ["bids"] as const,
  mine: () => ["bids", "mine"] as const,
  mineByAuction: (auctionId: string) =>
    ["bids", "mine", "auction", auctionId] as const,
  byAuction: (auctionId: string) =>
    ["bids", "auction", auctionId] as const,
  requests: () => ["bids", "requests"] as const,
  myRequests: () => ["bids", "requests", "mine"] as const,
  auctionRequests: (auctionId: string) =>
    ["bids", "requests", "auction", auctionId] as const,
} as const;
