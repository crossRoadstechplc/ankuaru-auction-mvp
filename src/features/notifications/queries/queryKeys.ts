export const notificationsQueryKeys = {
  all: () => ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
  unreadCount: () => ["notifications", "unreadCount"] as const,
} as const;
