import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphQLApiClient } from "../lib/graphql-api";
import { CreateAuctionData } from "../lib/types";
import { useAuthStore } from "../stores/auth.store";

// Query keys for better cache management
export const queryKeys = {
  auctions: ["auctions"] as const,
  auction: (id: string) => ["auctions", id] as const,
  auctionBids: (id: string) => ["auctions", id, "bids"] as const,
  myBid: (auctionId: string) => ["auctions", auctionId, "myBid"] as const,
  myBids: ["bids", "my"] as const,
  userAuctions: (userId: string) => ["users", userId, "auctions"] as const,
  followers: ["followers"] as const,
  following: ["following"] as const,
  userFollowers: (userId: string) => ["users", userId, "followers"] as const,
  userFollowing: (userId: string) => ["users", userId, "following"] as const,
};

// Hook for fetching all auctions
export function useAuctions() {
  return useQuery({
    queryKey: queryKeys.auctions,
    queryFn: () => graphQLApiClient.getAuctions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching a single auction
export function useAuction(id: string) {
  return useQuery({
    queryKey: queryKeys.auction(id),
    queryFn: () => graphQLApiClient.getAuction(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on network errors or GraphQL validation errors
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

// Hook for fetching auction bids
export function useAuctionBids(id: string) {
  return useQuery({
    queryKey: queryKeys.auctionBids(id),
    queryFn: () => graphQLApiClient.getAuctionBids(id),
    enabled: !!id,
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60 * 3, // 3 minutes
    retry: (failureCount, error) => {
      // Don't retry permission errors (403) - these are business logic, not technical errors
      if (
        error instanceof Error &&
        error.message.includes("Only the auction creator can view all bids")
      ) {
        return false;
      }
      // Don't retry on 403/401 errors
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

// Hook for fetching user's auctions
export function useUserAuctions(userId: string) {
  return useQuery({
    queryKey: queryKeys.userAuctions(userId),
    queryFn: () => graphQLApiClient.getUserAuctions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's bid for a specific auction
export function useMyBid(auctionId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.myBid(auctionId),
    queryFn: () => graphQLApiClient.getMyBid(auctionId),
    enabled: !!auctionId && isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if no bid found (404 is expected)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook for fetching all user's bids
export function useMyBids() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.myBids,
    queryFn: () => graphQLApiClient.getMyBids(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching current user's followers
export function useMyFollowers() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.followers,
    queryFn: () => graphQLApiClient.getMyFollowers(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching current user's following
export function useMyFollowing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.following,
    queryFn: () => graphQLApiClient.getMyFollowing(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's followers
export function useUserFollowers(userId: string) {
  return useQuery({
    queryKey: queryKeys.userFollowers(userId),
    queryFn: () => graphQLApiClient.getMyFollowers(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's following
export function useUserFollowing(userId: string) {
  return useQuery({
    queryKey: queryKeys.userFollowing(userId),
    queryFn: () => graphQLApiClient.getMyFollowing(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation for creating an auction ( Option A: invalidate + force refetch)
// Mutation for creating an auction (✅ Option A: invalidate + force refetch)
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuctionData) =>
      graphQLApiClient.createAuction(data),

    onSuccess: async () => {
      // 1) mark auctions list as stale
      await queryClient.invalidateQueries({ queryKey: queryKeys.auctions });

      // 2) force a refetch immediately
      // - "active": queries that are currently mounted (observers > 0)
      // - "inactive": queries in cache but not currently mounted
      // - "all": both
      await queryClient.refetchQueries({
        queryKey: queryKeys.auctions,
        type: "all",
      });
    },
  });
}

// Mutation for placing a bid
export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      amount,
    }: {
      auctionId: string;
      amount: string;
    }) => graphQLApiClient.placeBid(auctionId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auction(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctionBids(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myBid(variables.auctionId),
      });
    },
  });
}

// Mutation for revealing a bid
export function useRevealBid() {
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
    }) => graphQLApiClient.revealBid(auctionId, amount, nonce),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auction(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctionBids(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myBid(variables.auctionId),
      });
    },
  });
}

// Mutation for closing an auction
export function useCloseAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => graphQLApiClient.closeAuction(auctionId),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auction(auctionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    },
  });
}

// Mutation for following a user
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.following });
      queryClient.invalidateQueries({ queryKey: queryKeys.followers });
    },
  });
}

// Mutation for unfollowing a user
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.following });
      queryClient.invalidateQueries({ queryKey: queryKeys.followers });
    },
  });
}
