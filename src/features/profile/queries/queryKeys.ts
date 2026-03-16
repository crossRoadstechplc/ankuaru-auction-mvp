export const profileQueryKeys = {
  profile: () => ["profile"] as const,
  user: (userId: string) => ["profile", "user", userId] as const,
  userDetails: (userId: string) => ["profile", "user", userId, "details"] as const,
  followers: () => ["profile", "followers"] as const,
  following: () => ["profile", "following"] as const,
  userFollowers: (userId: string) =>
    ["profile", "users", userId, "followers"] as const,
  userFollowing: (userId: string) =>
    ["profile", "users", userId, "following"] as const,
  followRequests: () => ["profile", "followRequests"] as const,
  sentFollowRequests: () => ["profile", "sentFollowRequests"] as const,
  blockedUsers: () => ["profile", "blockedUsers"] as const,
  ratingSummary: () => ["profile", "ratingSummary"] as const,
} as const;
