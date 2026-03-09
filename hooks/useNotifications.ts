import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphQLApiClient } from "../lib/graphql-api";
import { Notification } from "../lib/types";
import { useAuthStore } from "../stores/auth.store";

// Query keys for better cache management
export const notificationsQueryKeys = {
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unreadCount"] as const,
};

// Hook for fetching current user's notifications
export function useMyNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery<Notification[]>({
    queryKey: notificationsQueryKeys.notifications,
    queryFn: () => graphQLApiClient.getMyNotifications(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes - notifications should be fresh
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // Auto-refetch every 3 minutes for real-time updates
    refetchIntervalInBackground: false, // Only refetch when tab is active
  });
}

// Hook for fetching unread notifications count
export function useUnreadNotificationsCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount,
    queryFn: async () => {
      const notifications = await graphQLApiClient.getMyNotifications();
      return notifications.filter(
        (notification: Notification) => !notification.is_read,
      ).length;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute - unread count should be very fresh
    gcTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Mutation for marking a notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      graphQLApiClient.markNotificationRead(notificationId),

    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.notifications,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount,
      });
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
    },
  });
}

// Mutation for marking all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const notifications = await graphQLApiClient.getMyNotifications();
      const unreadNotifications = notifications.filter(
        (n: Notification) => !n.is_read,
      );

      // Mark each unread notification as read
      await Promise.all(
        unreadNotifications.map((notification: Notification) =>
          graphQLApiClient.markNotificationRead(notification.id),
        ),
      );
    },

    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.notifications,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount,
      });
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
    },
  });
}

// Hook for notifications with real-time updates and better UX
export function useNotificationsWithRealTime() {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Derived states - ensure notifications is always an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = notificationsArray.filter(
    (notification) => !notification.is_read,
  );
  const readNotifications = notificationsArray.filter(
    (notification) => notification.is_read,
  );

  // Action handlers
  const handleMarkAsRead = async (notificationId: string) => {
    await markReadMutation.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  return {
    // Data
    notifications: notificationsArray,
    unreadNotifications,
    readNotifications,
    unreadCount,

    // States
    isLoading,
    error,

    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch,

    // Loading states for actions
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
