import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Auction,
  AuctionFormOptions,
  AuctionFormOptionsParams,
  AuctionReport,
  CreateAuctionData,
} from "@/lib/types";
import { auctionsApi } from "@/src/features/auctions/api/auctions.api";
import { auctionsQueryKeys } from "@/src/features/auctions/queries/queryKeys";

function mergeAuctionIntoCollection(
  collection: Auction[] | undefined,
  auction: Auction,
): Auction[] {
  if (!Array.isArray(collection) || collection.length === 0) {
    return [auction];
  }

  const existingIndex = collection.findIndex((entry) => entry.id === auction.id);
  if (existingIndex === -1) {
    return [auction, ...collection];
  }

  return collection.map((entry) => (entry.id === auction.id ? auction : entry));
}

export function useAuctionsQuery() {
  return useQuery({
    queryKey: auctionsQueryKeys.list(),
    queryFn: () => auctionsApi.getAuctions(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

type AuctionQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
};

type AuctionFormOptionsQueryOptions = {
  enabled?: boolean;
};

type AuctionReportQueryOptions = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
};

export function useAuctionQuery(id: string, options: AuctionQueryOptions = {}) {
  return useAuctionQueryWithOptions(id, options);
}

export function useAuctionQueryWithOptions(
  id: string,
  options: AuctionQueryOptions = {},
) {
  return useQuery({
    queryKey: auctionsQueryKeys.detail(id),
    queryFn: () => auctionsApi.getAuction(id),
    enabled: !!id && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("must not have a selection") ||
          error.message.includes("GRAPHQL_VALIDATION_FAILED"))
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useAuctionFormOptionsQuery(
  params: AuctionFormOptionsParams = {},
  options: AuctionFormOptionsQueryOptions = {},
) {
  return useQuery<AuctionFormOptions>({
    queryKey: auctionsQueryKeys.formOptions(params),
    queryFn: () => auctionsApi.getAuctionFormOptions(params),
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("GRAPHQL_VALIDATION_FAILED"))
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useAuctionReportQuery(
  id: string,
  options: AuctionReportQueryOptions = {},
) {
  return useQuery<AuctionReport>({
    queryKey: auctionsQueryKeys.report(id),
    queryFn: () => auctionsApi.getAuctionReport(id),
    enabled: !!id && (options.enabled ?? true),
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("NOT_FOUND") ||
          error.message.includes("GRAPHQL_VALIDATION_FAILED"))
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useUserAuctionsQuery(userId: string) {
  return useQuery({
    queryKey: auctionsQueryKeys.byUser(userId),
    queryFn: () => auctionsApi.getUserAuctions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateAuctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuctionData) => auctionsApi.createAuction(data),
    onSuccess: async (auction) => {
      queryClient.setQueryData<Auction[]>(
        auctionsQueryKeys.list(),
        (previous) => mergeAuctionIntoCollection(previous, auction),
      );
      queryClient.setQueryData<Auction[]>(
        auctionsQueryKeys.byUser(auction.createdBy),
        (previous) => mergeAuctionIntoCollection(previous, auction),
      );
      queryClient.setQueryData(auctionsQueryKeys.detail(auction.id), auction);

      await queryClient.invalidateQueries({ queryKey: auctionsQueryKeys.list() });
      await queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.byUser(auction.createdBy),
      });
      await queryClient.refetchQueries({
        queryKey: auctionsQueryKeys.list(),
        type: "all",
      });
    },
  });
}

export function useCloseAuctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => auctionsApi.closeAuction(auctionId),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(auctionId),
      });
      queryClient.invalidateQueries({ queryKey: auctionsQueryKeys.list() });
    },
  });
}
