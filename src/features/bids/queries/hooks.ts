import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bidsApi } from "@/src/features/bids/api/bids.api";
import { bidsQueryKeys } from "@/src/features/bids/queries/queryKeys";
import { auctionsQueryKeys } from "@/src/features/auctions/queries/queryKeys";
import { useAuthStore } from "@/stores/auth.store";

type AuctionBidsQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
};

type BidRequestQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
};

export function useAuctionBidsQuery(
  auctionId: string,
  options: AuctionBidsQueryOptions = {},
) {
  return useQuery({
    queryKey: bidsQueryKeys.byAuction(auctionId),
    queryFn: () => bidsApi.getAuctionBids(auctionId),
    enabled: !!auctionId && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 3,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        error.message.includes("Only the auction creator can view all bids")
      ) {
        return false;
      }

      if (
        error instanceof Error &&
        (error.message.includes("403") || error.message.includes("401"))
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useMyBidQuery(auctionId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: bidsQueryKeys.mineByAuction(auctionId),
    queryFn: () => bidsApi.getMyBid(auctionId),
    enabled: !!auctionId && isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useMyBidsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: bidsQueryKeys.mine(),
    queryFn: () => bidsApi.getMyBids(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  });
}

export function useMyBidRequestsQuery(options: BidRequestQueryOptions = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: bidsQueryKeys.myRequests(),
    queryFn: () => bidsApi.getMyBidRequests(),
    enabled: isAuthenticated && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useAuctionBidRequestsQuery(
  auctionId: string,
  options: BidRequestQueryOptions = {},
) {
  return useQuery({
    queryKey: bidsQueryKeys.auctionRequests(auctionId),
    queryFn: () => bidsApi.getAuctionBidRequests(auctionId),
    enabled: !!auctionId && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: options.refetchIntervalInBackground,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function usePlaceBidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      amount,
    }: {
      auctionId: string;
      amount: string;
    }) => bidsApi.placeBid(auctionId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.byAuction(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: bidsQueryKeys.mine() });
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.mineByAuction(variables.auctionId),
      });
    },
  });
}

export function useRequestBidAccessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => bidsApi.requestBidAccess(auctionId),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(auctionId),
      });
      queryClient.invalidateQueries({ queryKey: bidsQueryKeys.myRequests() });
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.auctionRequests(auctionId),
      });
    },
  });
}

export function useApproveBidRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
    }: {
      requestId: string;
      auctionId: string;
    }) => bidsApi.approveBidRequest(requestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.auctionRequests(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: bidsQueryKeys.myRequests() });
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(variables.auctionId),
      });
    },
  });
}

export function useRejectBidRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
    }: {
      requestId: string;
      auctionId: string;
    }) => bidsApi.rejectBidRequest(requestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.auctionRequests(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: bidsQueryKeys.myRequests() });
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(variables.auctionId),
      });
    },
  });
}

export function useRevealBidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      amount,
      nonce,
    }: {
      auctionId: string;
      amount: string;
      nonce: string;
    }) => bidsApi.revealBid(auctionId, amount, nonce),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionsQueryKeys.detail(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.byAuction(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: bidsQueryKeys.mine() });
      queryClient.invalidateQueries({
        queryKey: bidsQueryKeys.mineByAuction(variables.auctionId),
      });
    },
  });
}
