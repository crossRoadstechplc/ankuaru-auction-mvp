import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
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
    queryFn: () => apiClient.getAuctions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching a single auction
export function useAuction(id: string) {
  return useQuery({
    queryKey: queryKeys.auction(id),
    queryFn: () => apiClient.getAuction(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching auction bids
export function useAuctionBids(id: string) {
  return useQuery({
    queryKey: queryKeys.auctionBids(id),
    queryFn: () => apiClient.getAuctionBids(id),
    enabled: !!id,
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Hook for fetching user's auctions
export function useUserAuctions(userId: string) {
  return useQuery({
    queryKey: queryKeys.userAuctions(userId),
    queryFn: () => apiClient.getUserAuctions(userId),
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
    queryFn: () => apiClient.getMyBid(auctionId),
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
    queryFn: () => apiClient.getMyBids(),
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
    queryFn: () => apiClient.getMyFollowers(),
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
    queryFn: () => apiClient.getMyFollowing(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's followers
export function useUserFollowers(userId: string) {
  return useQuery({
    queryKey: queryKeys.userFollowers(userId),
    queryFn: () => apiClient.getMyFollowers(), // NOTE: no getUserFollowers endpoint exists
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's following
export function useUserFollowing(userId: string) {
  return useQuery({
    queryKey: queryKeys.userFollowing(userId),
    queryFn: () => apiClient.getMyFollowing(), // NOTE: no getUserFollowing endpoint exists
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation for creating an auction (✅ Option A: invalidate + force refetch)
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuctionData) => apiClient.createAuction(data),

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
    }) => apiClient.placeBid(auctionId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auction(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myBid(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctionBids(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
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
    }) => apiClient.revealBid(auctionId, amount, nonce),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auction(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auctionBids(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myBid(variables.auctionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
    },
  });
}

// Mutation for closing an auction
export function useCloseAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => apiClient.closeAuction(auctionId),
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
    mutationFn: (userId: string) => apiClient.followUser(userId),
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
    mutationFn: (userId: string) => apiClient.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.following });
      queryClient.invalidateQueries({ queryKey: queryKeys.followers });
    },
  });
}
