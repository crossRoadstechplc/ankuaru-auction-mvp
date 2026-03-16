import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { GraphQLError, graphqlClient } from "@/lib/graphql-client";
import {
  Auction,
  AuctionFormOptions,
  AuctionFormOptionsParams,
  CloseAuctionResult,
  CreateAuctionData,
} from "@/lib/types";
import { getGraphqlBaseUrl } from "@/src/platform/config/env";
import {
  AuctionQueryResultDto,
  AuctionFormOptionsQueryResultDto,
  AuctionsByUserQueryResultDto,
  AuctionsQueryResultDto,
  CloseAuctionResultDto,
  CloseAuctionMutationResultDto,
  CreateAuctionMutationResultDto,
} from "@/src/features/auctions/dto/auctions.dto";
import {
  mapAuctionPayload,
  mapAuctionFormOptionsPayload,
  mapAuctionsPayload,
  mapCloseAuctionPayload,
} from "@/src/features/auctions/mappers/auctions.mapper";
import { resolveGraphqlEndpoint } from "@/src/platform/graphql/endpoint";
import {
  parseJsonScalar,
  toJsonObject,
} from "@/src/platform/graphql/json-scalar";

function shouldRetryPublicAuctionRead(error: unknown): boolean {
  if (!graphqlClient.getToken()) {
    return false;
  }

  if (error instanceof GraphQLError && error.statusCode === 500) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch auctions") ||
    message.includes("failed to fetch auction")
  );
}

async function requestPublicAuctionRead<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    if (!shouldRetryPublicAuctionRead(error)) {
      throw error;
    }

    return graphqlClient.request<T>(query, variables, { skipAuth: true });
  }
}

async function getAuctions(): Promise<Auction[]> {
  const response = await requestPublicAuctionRead<AuctionsQueryResultDto>(
    queries.AUCTIONS_QUERY,
  );
  return mapAuctionsPayload(response.auctions);
}

async function getAuction(id: string): Promise<Auction> {
  const response = await requestPublicAuctionRead<AuctionQueryResultDto>(
    queries.AUCTION_QUERY,
    { id },
  );

  return mapAuctionPayload(response.auction);
}

async function getAuctionFormOptions(
  params: AuctionFormOptionsParams = {},
): Promise<AuctionFormOptions> {
  const response =
    await requestPublicAuctionRead<AuctionFormOptionsQueryResultDto>(
    queries.AUCTION_FORM_OPTIONS_QUERY,
    {
      category: params.category ?? null,
      productName: params.productName ?? null,
    },
    );

  return mapAuctionFormOptionsPayload(response.auctionFormOptions);
}

async function getUserAuctions(userId: string): Promise<Auction[]> {
  const response = await requestPublicAuctionRead<AuctionsByUserQueryResultDto>(
    queries.AUCTIONS_BY_USER_QUERY,
    { userId },
  );

  return mapAuctionsPayload(response.auctionsByUser);
}

function isFileUpload(value: CreateAuctionData["auctionImageUrl"]): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

async function createAuctionWithImageUpload(
  input: CreateAuctionData,
  file: File,
): Promise<Auction> {
  const token = graphqlClient.getToken();
  const endpoint = resolveGraphqlEndpoint(getGraphqlBaseUrl());
  const inputWithoutFile = {
    ...input,
    auctionImageUrl: undefined,
  };
  const body = new FormData();

  body.append(
    "operations",
    JSON.stringify({
      query: mutations.CREATE_AUCTION_MUTATION,
      variables: {
        input: {
          ...inputWithoutFile,
          auctionImageUrl: null,
        },
      },
    }),
  );
  body.append(
    "map",
    JSON.stringify({
      0: ["variables.input.auctionImageUrl"],
    }),
  );
  body.append("0", file);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Apollo-Require-Preflight": "true",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body,
  });

  const responseText = await response.text();
  const payload = (() => {
    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText) as {
        data?: CreateAuctionMutationResultDto;
        errors?: Array<{ message?: string }>;
        error?: string;
        message?: string;
      };
    } catch {
      return null;
    }
  })();

  const result = payload?.data;
  const errorMessage =
    payload?.errors && payload.errors.length > 0
      ? payload.errors[0]?.message || "Failed to create auction"
      : payload?.error ||
        payload?.message ||
        responseText.trim() ||
        null;

  // Some backend upload responses currently return HTTP 500 even when the
  // GraphQL payload contains a successful createAuction result.
  if (result?.createAuction) {
    return mapAuctionPayload(result.createAuction);
  }

  if (!response.ok || !result?.createAuction) {
    throw new GraphQLError(
      errorMessage || `HTTP ${response.status}`,
      [],
      response.status || undefined,
    );
  }

  throw new GraphQLError(
    errorMessage || "Create auction response did not include auction data",
    [],
    response.status || undefined,
  );
}

async function createAuction(input: CreateAuctionData): Promise<Auction> {
  if (isFileUpload(input.auctionImageUrl)) {
    return createAuctionWithImageUpload(input, input.auctionImageUrl);
  }

  const response = await graphqlClient.request<CreateAuctionMutationResultDto>(
    mutations.CREATE_AUCTION_MUTATION,
    { input },
  );

  return mapAuctionPayload(response.createAuction);
}

async function closeAuction(auctionId: string): Promise<CloseAuctionResult> {
  const response = await graphqlClient.request<CloseAuctionMutationResultDto>(
    mutations.CLOSE_AUCTION_MUTATION,
    { id: auctionId },
  );

  const payload = parseJsonScalar(response.closeAuction);
  const dto = (toJsonObject(payload) ?? {}) as CloseAuctionResultDto;
  return mapCloseAuctionPayload(dto);
}

export const auctionsApi = {
  getAuctions,
  getAuction,
  getAuctionFormOptions,
  getUserAuctions,
  createAuction,
  closeAuction,
};
