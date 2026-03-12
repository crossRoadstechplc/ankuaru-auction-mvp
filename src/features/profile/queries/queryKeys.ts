export const profileQueryKeys = {
  profile: () => ["profile"] as const,
  followers: () => ["profile", "followers"] as const,
  following: () => ["profile", "following"] as const,
  userFollowers: (userId: string) =>
    ["profile", "users", userId, "followers"] as const,
  userFollowing: (userId: string) =>
    ["profile", "users", userId, "following"] as const,
  followRequests: () => ["profile", "followRequests"] as const,
  blockedUsers: () => ["profile", "blockedUsers"] as const,
  ratingSummary: () => ["profile", "ratingSummary"] as const,
} as const;
