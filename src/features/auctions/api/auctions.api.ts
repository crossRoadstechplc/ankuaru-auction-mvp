import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { graphqlClient } from "@/lib/graphql-client";
import { Auction, CreateAuctionData } from "@/lib/types";
import {
  AuctionQueryResultDto,
  AuctionsByUserQueryResultDto,
  AuctionsQueryResultDto,
  CloseAuctionMutationResultDto,
  CreateAuctionMutationResultDto,
} from "@/src/features/auctions/dto/auctions.dto";
import {
  mapAuctionPayload,
  mapAuctionsPayload,
} from "@/src/features/auctions/mappers/auctions.mapper";
import {
  parseJsonScalar,
  toJsonObject,
} from "@/src/platform/graphql/json-scalar";

async function getAuctions(): Promise<Auction[]> {
  const response = await graphqlClient.request<AuctionsQueryResultDto>(
    queries.AUCTIONS_QUERY,
  );
  return mapAuctionsPayload(response.auctions);
}

async function getAuction(id: string): Promise<Auction> {
  const response = await graphqlClient.request<AuctionQueryResultDto>(
    queries.AUCTION_QUERY,
    { id },
  );

  return mapAuctionPayload(response.auction);
}

async function getUserAuctions(userId: string): Promise<Auction[]> {
  const response = await graphqlClient.request<AuctionsByUserQueryResultDto>(
    queries.AUCTIONS_BY_USER_QUERY,
    { userId },
  );

  return mapAuctionsPayload(response.auctionsByUser);
}

async function createAuction(input: CreateAuctionData): Promise<Auction> {
  const response = await graphqlClient.request<CreateAuctionMutationResultDto>(
    mutations.CREATE_AUCTION_MUTATION,
    { input },
  );

  return mapAuctionPayload(response.createAuction);
}

async function closeAuction(auctionId: string): Promise<unknown> {
  const response = await graphqlClient.request<CloseAuctionMutationResultDto>(
    mutations.CLOSE_AUCTION_MUTATION,
    { id: auctionId },
  );

  const payload = parseJsonScalar(response.closeAuction);
  const envelope = toJsonObject(payload);
  return envelope?.auction ?? payload;
}

export const auctionsApi = {
  getAuctions,
  getAuction,
  getUserAuctions,
  createAuction,
  closeAuction,
};
