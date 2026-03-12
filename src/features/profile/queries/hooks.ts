import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FollowRequest, RatingSummaryResponse, User } from "@/lib/types";
import { useAuthStore } from "@/stores/auth.store";
import { profileApi } from "@/src/features/profile/api/profile.api";
import { profileQueryKeys } from "@/src/features/profile/queries/queryKeys";

export function useMyProfileQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User>({
    queryKey: profileQueryKeys.profile(),
    queryFn: () => profileApi.getMyProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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

export function useUserInfoQuery(userId: string, enabled = true) {
  return useQuery<User>({
    queryKey: ["profile", "user", userId],
    queryFn: () => profileApi.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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

export function useMyFollowersQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User[]>({
    queryKey: profileQueryKeys.followers(),
    queryFn: () => profileApi.getMyFollowers(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

export function useMyFollowingQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User[]>({
    queryKey: profileQueryKeys.following(),
    queryFn: () => profileApi.getMyFollowing(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

export function useUserFollowersQuery(userId: string) {
  return useQuery<User[]>({
    queryKey: profileQueryKeys.userFollowers(userId),
    queryFn: () => profileApi.getUserFollowers(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 10,
  });
}

export function useUserFollowingQuery(userId: string) {
  return useQuery<User[]>({
    queryKey: profileQueryKeys.userFollowing(userId),
    queryFn: () => profileApi.getUserFollowing(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useMyFollowRequestsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<FollowRequest[]>({
    queryKey: profileQueryKeys.followRequests(),
    queryFn: () => profileApi.getMyFollowRequests(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
  });
}

export function useMyBlockedUsersQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User[]>({
    queryKey: profileQueryKeys.blockedUsers(),
    queryFn: () => profileApi.getMyBlockedUsers(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

export function useMyRatingSummaryQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<RatingSummaryResponse>({
    queryKey: profileQueryKeys.ratingSummary(),
    queryFn: () => profileApi.getMyRatingSummary(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => profileApi.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers() });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following() });
    },
  });
}

export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => profileApi.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers() });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following() });
    },
  });
}

export function useApproveFollowRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => profileApi.approveFollowRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followRequests(),
      });
    },
  });
}

export function useRejectFollowRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => profileApi.rejectFollowRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followRequests(),
      });
    },
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => profileApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.blockedUsers(),
      });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers() });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following() });
    },
  });
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => profileApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.blockedUsers(),
      });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.followers() });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.following() });
    },
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      fullName?: string;
      bio?: string;
      profileImageUrl?: string;
      isPrivate?: boolean;
    }) => profileApi.updateMyProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile() });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
}

export function useRemoveMyProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.removeMyProfileImage(),
    onSuccess: () => {
      toast.success("Profile image removed successfully!");
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile() });
    },
    onError: (error) => {
      console.error("Profile image removal error:", error);
    },
  });
}
