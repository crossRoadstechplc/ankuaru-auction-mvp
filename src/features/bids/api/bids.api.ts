import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { GraphQLError, graphqlClient } from "@/lib/graphql-client";
import { Bid, BidResponse, BidWithAuction } from "@/lib/types";
import { auctionsApi } from "@/src/features/auctions/api/auctions.api";
import {
  AuctionBidsQueryResultDto,
  MyBidQueryResultDto,
  MyBidsQueryResultDto,
  SubmitBidMutationResultDto,
} from "@/src/features/bids/dto/bids.dto";
import {
  mapAuctionBidsPayload,
  mapBidWithAuction,
  mapMyBidPayload,
  mapMyBidsPayload,
  mapSubmitBidPayload,
} from "@/src/features/bids/mappers/bids.mapper";

function isNotFoundBidError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  if (message.includes("no bid found") || message.includes("not found")) {
    return true;
  }

  if (error instanceof GraphQLError) {
    return error.status === 404 || error.statusCode === 404;
  }

  return false;
}

async function getAuctionBids(id: string): Promise<Bid[]> {
  const response = await graphqlClient.request<AuctionBidsQueryResultDto>(
    queries.AUCTION_BIDS_QUERY,
    { id },
  );

  return mapAuctionBidsPayload(response.auctionBids);
}

async function placeBid(
  auctionId: string,
  amount: string,
): Promise<BidResponse> {
  const response = await graphqlClient.request<SubmitBidMutationResultDto>(
    mutations.SUBMIT_BID_MUTATION,
    {
      id: auctionId,
      input: { amount },
    },
  );

  return mapSubmitBidPayload(response.submitBid);
}

async function getMyBid(auctionId: string): Promise<Bid | null> {
  try {
    const response = await graphqlClient.request<MyBidQueryResultDto>(
      queries.MY_BID_QUERY,
      { id: auctionId },
    );

    return mapMyBidPayload(response.myBid);
  } catch (error) {
    if (isNotFoundBidError(error)) {
      return null;
    }

    throw error;
  }
}

async function getMyBids(): Promise<BidWithAuction[]> {
  const response = await graphqlClient.request<MyBidsQueryResultDto>(
    queries.MY_BIDS_QUERY,
  );
  const bids = mapMyBidsPayload(response.myBids);

  if (bids.length === 0) {
    return [];
  }

  const uniqueAuctionIds = Array.from(
    new Set(
      bids
        .map((bid) => bid.auctionId)
        .filter((auctionId) => auctionId.length > 0),
    ),
  );

  const auctionEntries = await Promise.all(
    uniqueAuctionIds.map(async (auctionId) => {
      try {
        const auction = await auctionsApi.getAuction(auctionId);
        return [auctionId, auction] as const;
      } catch {
        return [auctionId, null] as const;
      }
    }),
  );

  const auctionById = new Map(auctionEntries);

  return bids.map((bid) => {
    const auction = auctionById.get(bid.auctionId) ?? null;
    return mapBidWithAuction(bid, auction);
  });
}

async function revealBid(
  _auctionId: string,
  _amount: string,
  _nonce: string,
): Promise<void> {
  void _auctionId;
  void _amount;
  void _nonce;
  throw new Error(
    "revealBid not available in GraphQL - marked as deprecated in backend",
  );
}

export const bidsApi = {
  getAuctionBids,
  placeBid,
  getMyBid,
  getMyBids,
  revealBid,
};
