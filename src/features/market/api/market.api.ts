import * as queries from "@/lib/graphql/queries";
import { graphqlClient } from "@/lib/graphql-client";
import { MarketListingsQueryResultDto } from "@/src/features/market/dto/market.dto";
import { mapMarketListingsPayload } from "@/src/features/market/mappers/market.mapper";
import { mockMarketListings } from "@/src/features/market/mock/market.mock";
import { MarketListingsResult } from "@/src/features/market/types/market.types";

async function getMarketListings(): Promise<MarketListingsResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await graphqlClient.request<MarketListingsQueryResultDto>(
      queries.MARKET_LISTINGS_QUERY,
      undefined,
      { skipAuth: true },
    );
    const listings = mapMarketListingsPayload(response.marketListings);

    if (listings.length > 0) {
      return {
        listings,
        source: "live",
        fetchedAt,
      };
    }
  } catch (error) {
    console.error("Failed to fetch market listings:", error);
  }

  return {
    listings: mockMarketListings,
    source: "mock",
    fetchedAt,
  };
}

export const marketApi = {
  getMarketListings,
};
