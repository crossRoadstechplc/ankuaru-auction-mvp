export type AuctionsQueryResultDto = {
  auctions: unknown;
};

export type AuctionQueryResultDto = {
  auction: unknown;
};

export type AuctionReportQueryResultDto = {
  auctionReport: unknown;
};

export type AuctionFormOptionsQueryResultDto = {
  auctionFormOptions: unknown;
};

export type AuctionsByUserQueryResultDto = {
  auctionsByUser: unknown;
};

export type CreateAuctionMutationResultDto = {
  createAuction: unknown;
};

export type CloseAuctionMutationResultDto = {
  closeAuction: unknown;
};

export type CloseAuctionResultDto = {
  auction?: {
    id?: unknown;
    title?: unknown;
    auctionCategory?: unknown;
    reservePrice?: unknown;
    minBid?: unknown;
    bidCount?: unknown;
    winnerId?: unknown;
    winningBid?: unknown;
    closedAt?: unknown;
  };
  id?: unknown;
  title?: unknown;
  auctionCategory?: unknown;
  reservePrice?: unknown;
  minBid?: unknown;
  bidCount?: unknown;
  winnerId?: unknown;
  winningBid?: unknown;
  closedAt?: unknown;
};

export type AuctionFormOptionsDto = {
  categories?: unknown;
  auctionCategories?: unknown;
  productNames?: unknown;
  products?: unknown;
  categoryOptions?: unknown;
  productOptions?: unknown;
  selectedCategory?: unknown;
  selectedProduct?: unknown;
  regions?: unknown;
  commodityTypes?: unknown;
  commodityTypeOptions?: unknown;
  grades?: unknown;
  gradeOptions?: unknown;
  processes?: unknown;
  transactions?: unknown;
  commodityClasses?: unknown;
  commoditySizes?: unknown;
  commodityBrands?: unknown;
  quantityUnits?: unknown;
  quantityUnitOptions?: unknown;
  units?: unknown;
  requiredFields?: unknown;
};
