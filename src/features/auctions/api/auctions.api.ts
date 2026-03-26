import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { GraphQLError, graphqlClient } from "@/lib/graphql-client";
import {
  Auction,
  AuctionFormOptions,
  AuctionFormOptionsParams,
  AuctionReport,
  CloseAuctionInput,
  CloseAuctionResult,
  CreateAuctionData,
  EditAuctionData,
} from "@/lib/types";
import { getGraphqlBaseUrl } from "@/src/platform/config/env";
import {
  AuctionQueryResultDto,
  AuctionFormOptionsQueryResultDto,
  AuctionReportQueryResultDto,
  AuctionsByUserQueryResultDto,
  AuctionsQueryResultDto,
  CloseAuctionResultDto,
  CloseAuctionMutationResultDto,
  CreateAuctionMutationResultDto,
  EditAuctionMutationResultDto,
} from "@/src/features/auctions/dto/auctions.dto";
import {
  mapAuctionPayload,
  mapAuctionFormOptionsPayload,
  mapAuctionReportPayload,
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

async function getAuctionReport(id: string): Promise<AuctionReport> {
  const response = await graphqlClient.request<AuctionReportQueryResultDto>(
    queries.AUCTION_REPORT_QUERY,
    { id },
  );

  return mapAuctionReportPayload(response.auctionReport);
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
    auctionImages: undefined,
  };
  const body = new FormData();

  const variablesInput = {
    ...buildCreateAuctionInput(inputWithoutFile),
    auctionImageUrl: null,
  };
  body.append(
    "operations",
    JSON.stringify({
      query: mutations.CREATE_AUCTION_MUTATION,
      variables: {
        input: variablesInput,
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

function buildCreateAuctionInput(
  input: CreateAuctionData,
): Record<string, unknown> {
  const priceTiers =
    input.lotType === "SEALED" ? [] : (input.priceTiers ?? []);
  const base: Record<string, unknown> = {
    ...input,
    priceTiers,
  };
  if (input.lotType === "SEALED") {
    delete base.winnerPriority;
  }
  if (isFileUpload(input.auctionImageUrl)) {
    return { ...base, auctionImageUrl: undefined };
  }
  if (input.auctionImages?.length) {
    const files = input.auctionImages.filter(
      (v): v is File => typeof File !== "undefined" && v instanceof File,
    );
    if (files.length > 0) {
      return { ...base, auctionImageUrl: undefined };
    }
  }
  return base;
}

async function createAuction(input: CreateAuctionData): Promise<Auction> {
  const file =
    isFileUpload(input.auctionImageUrl)
      ? input.auctionImageUrl
      : input.auctionImages?.find(
          (v): v is File => typeof File !== "undefined" && v instanceof File,
        );
  if (file) {
    return createAuctionWithImageUpload(input, file);
  }

  const apiInput = buildCreateAuctionInput(input);
  const response = await graphqlClient.request<CreateAuctionMutationResultDto>(
    mutations.CREATE_AUCTION_MUTATION,
    { input: apiInput },
  );

  return mapAuctionPayload(response.createAuction);
}

async function editAuction(
  id: string,
  input: EditAuctionData,
): Promise<Auction> {
  const response = await graphqlClient.request<EditAuctionMutationResultDto>(
    mutations.EDIT_AUCTION_MUTATION,
    { id, input },
  );

  return mapAuctionPayload(response.editAuction);
}

async function closeAuction(
  auctionId: string,
  input?: CloseAuctionInput | null,
): Promise<CloseAuctionResult> {
  const response = await graphqlClient.request<CloseAuctionMutationResultDto>(
    mutations.CLOSE_AUCTION_MUTATION,
    {
      id: auctionId,
      input: input ?? null,
    },
  );

  const payload = parseJsonScalar(response.closeAuction);
  const dto = (toJsonObject(payload) ?? {}) as CloseAuctionResultDto;
  return mapCloseAuctionPayload(dto);
}

export const auctionsApi = {
  getAuctions,
  getAuction,
  getAuctionReport,
  getAuctionFormOptions,
  getUserAuctions,
  createAuction,
  editAuction,
  closeAuction,
};
