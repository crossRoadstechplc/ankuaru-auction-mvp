import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/lib/types";
import { useAuthStore } from "@/stores/auth.store";
import { notificationsApi } from "@/src/features/notifications/api/notifications.api";
import { notificationsQueryKeys } from "@/src/features/notifications/queries/queryKeys";

type NotificationsMutationContext = {
  previousNotifications?: Notification[];
};

const MARK_ALL_READ_BATCH_SIZE = 10;

function normalizeNotifications(
  notifications: Notification[] | undefined,
): Notification[] {
  return Array.isArray(notifications) ? notifications : [];
}

async function markNotificationsReadInBatches(
  notifications: Notification[],
): Promise<void> {
  for (
    let index = 0;
    index < notifications.length;
    index += MARK_ALL_READ_BATCH_SIZE
  ) {
    const batch = notifications.slice(index, index + MARK_ALL_READ_BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((notification) =>
        notificationsApi.markNotificationRead(notification.id),
      ),
    );

    const failed = batchResults.find((result) => result.status === "rejected");
    if (failed?.status === "rejected") {
      throw failed.reason;
    }
  }
}

export function useMyNotificationsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Notification[]>({
    queryKey: notificationsQueryKeys.list(),
    queryFn: () => notificationsApi.getMyNotifications(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 3,
    refetchIntervalInBackground: false,
  });
}

export function useUnreadNotificationsCountQuery() {
  const notificationsQuery = useMyNotificationsQuery();
  const notifications = normalizeNotifications(notificationsQuery.data);
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return {
    ...notificationsQuery,
    data: unreadCount,
  };
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markNotificationRead(notificationId),
    onMutate: async (
      notificationId: string,
    ): Promise<NotificationsMutationContext> => {
      await queryClient.cancelQueries({
        queryKey: notificationsQueryKeys.list(),
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationsQueryKeys.list(),
      );

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationsQueryKeys.list(),
          previousNotifications.map((notification) => {
            if (notification.id !== notificationId) {
              return notification;
            }

            return {
              ...notification,
              is_read: true,
            };
          }),
        );
      }

      return { previousNotifications };
    },
    onError: (error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationsQueryKeys.list(),
          context.previousNotifications,
        );
      }

      console.error("Failed to mark notification as read:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list(),
        refetchType: "inactive",
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      let notifications = queryClient.getQueryData<Notification[]>(
        notificationsQueryKeys.list(),
      );

      if (!notifications || notifications.length === 0) {
        notifications = await notificationsApi.getMyNotifications();
      }

      const unreadNotifications = notifications.filter((n) => !n.is_read);

      if (unreadNotifications.length === 0) {
        return;
      }

      await markNotificationsReadInBatches(unreadNotifications);
    },
    onMutate: async (): Promise<NotificationsMutationContext> => {
      await queryClient.cancelQueries({
        queryKey: notificationsQueryKeys.list(),
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationsQueryKeys.list(),
      );

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationsQueryKeys.list(),
          previousNotifications.map((notification) => ({
            ...notification,
            is_read: true,
          })),
        );
      }

      return { previousNotifications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationsQueryKeys.list(),
          context.previousNotifications,
        );
      }

      console.error("Failed to mark all notifications as read:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.list(),
        refetchType: "inactive",
      });
    },
  });
}

export function useNotificationsWithRealTimeQuery() {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useMyNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notificationsArray = normalizeNotifications(notifications);
  const unreadNotifications = notificationsArray.filter(
    (notification) => !notification.is_read,
  );
  const readNotifications = notificationsArray.filter(
    (notification) => notification.is_read,
  );

  const markAsRead = async (notificationId: string) => {
    await markReadMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  return {
    notifications: notificationsArray,
    unreadNotifications,
    readNotifications,
    unreadCount: unreadNotifications.length,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
