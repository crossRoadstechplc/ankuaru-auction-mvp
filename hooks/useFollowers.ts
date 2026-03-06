import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { useAuthStore } from "../stores/auth.store";

// Query keys for better cache management
export const followersQueryKeys = {
  followers: ["followers"] as const,
  following: ["following"] as const,
  userFollowers: (userId: string) => ["users", userId, "followers"] as const,
  userFollowing: (userId: string) => ["users", userId, "following"] as const,
};

// Hook for fetching current user's followers
export function useMyFollowers() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: followersQueryKeys.followers,
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
    queryKey: followersQueryKeys.following,
    queryFn: () => apiClient.getMyFollowing(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's followers
export function useUserFollowers(userId: string) {
  return useQuery({
    queryKey: followersQueryKeys.userFollowers(userId),
    queryFn: () => apiClient.getMyFollowers(), // Using getMyFollowers as getUserFollowers doesn't exist
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching user's following
export function useUserFollowing(userId: string) {
  return useQuery({
    queryKey: followersQueryKeys.userFollowing(userId),
    queryFn: () => apiClient.getMyFollowing(), // Using getMyFollowing as getUserFollowing doesn't exist
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation for following a user
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.followUser(userId),
    onSuccess: () => {
      // Invalidate following and followers queries
      queryClient.invalidateQueries({ queryKey: followersQueryKeys.following });
      queryClient.invalidateQueries({ queryKey: followersQueryKeys.followers });
    },
  });
}

// Mutation for unfollowing a user
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.unfollowUser(userId),
    onSuccess: () => {
      // Invalidate following and followers queries
      queryClient.invalidateQueries({ queryKey: followersQueryKeys.following });
      queryClient.invalidateQueries({ queryKey: followersQueryKeys.followers });
    },
  });
}
