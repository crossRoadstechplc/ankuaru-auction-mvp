import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { graphQLApiClient } from "../lib/graphql-api";
import { profileQueryKeys } from "../lib/query-keys";
import { FollowRequest, RatingSummaryResponse, User } from "../lib/types";

// Hook for fetching current user's profile
export function useMyProfile() {
  return useQuery<User>({
    queryKey: profileQueryKeys.profile,
    queryFn: () => graphQLApiClient.getMyProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
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

// Hook for fetching current user's followers
export function useMyFollowers() {
  return useQuery<User[]>({
    queryKey: profileQueryKeys.followers,
    queryFn: () => graphQLApiClient.getMyFollowers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
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

// Hook for fetching current user's following
export function useMyFollowing() {
  return useQuery<User[]>({
    queryKey: profileQueryKeys.following,
    queryFn: () => graphQLApiClient.getMyFollowing(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
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

// Hook for fetching follow requests
export function useMyFollowRequests() {
  return useQuery<FollowRequest[]>({
    queryKey: profileQueryKeys.followRequests,
    queryFn: () => graphQLApiClient.getMyFollowRequests(),
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
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

// Hook for fetching blocked users
export function useMyBlockedUsers() {
  return useQuery<User[]>({
    queryKey: profileQueryKeys.blockedUsers,
    queryFn: () => graphQLApiClient.getMyBlockedUsers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
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

// Hook for fetching rating summary
export function useMyRatingSummary() {
  return useQuery<RatingSummaryResponse>({
    queryKey: profileQueryKeys.ratingSummary,
    queryFn: () => graphQLApiClient.getMyRatingSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
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

// Mutation hooks for profile actions
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.followUser(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.unfollowUser(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following });
    },
  });
}

export function useApproveFollowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      graphQLApiClient.approveFollowRequest(requestId),
    onSuccess: () => {
      // Invalidate follow requests query
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followRequests,
      });
    },
  });
}

export function useRejectFollowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      graphQLApiClient.rejectFollowRequest(requestId),
    onSuccess: () => {
      // Invalidate follow requests query
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followRequests,
      });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.blockUser(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.blockedUsers,
      });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => graphQLApiClient.unblockUser(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.blockedUsers,
      });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following });
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      fullName?: string;
      bio?: string;
      profileImageUrl?: string;
      isPrivate?: boolean;
    }) => graphQLApiClient.updateMyProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      // Let the component handle the toast
    },
  });
}

export function useRemoveMyProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => graphQLApiClient.removeMyProfileImage(),
    onSuccess: () => {
      toast.success("Profile image removed successfully!");
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile });
    },
    onError: (error) => {
      console.error("Profile image removal error:", error);
      // Let component handle the toast
    },
  });
}
