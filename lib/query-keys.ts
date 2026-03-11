// Query keys for React Query cache management

export const profileQueryKeys = {
  profile: ["profile"] as const,
  followers: ["followers"] as const,
  following: ["following"] as const,
  followRequests: ["followRequests"] as const,
  blockedUsers: ["blockedUsers"] as const,
  ratingSummary: ["ratingSummary"] as const,
} as const;
