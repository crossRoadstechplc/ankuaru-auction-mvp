import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { graphqlClient } from "@/lib/graphql-client";
import { Notification } from "@/lib/types";
import {
  MarkNotificationReadMutationResultDto,
  MyNotificationsQueryResultDto,
} from "@/src/features/notifications/dto/notifications.dto";
import { mapNotificationsPayload } from "@/src/features/notifications/mappers/notifications.mapper";
import { parseJsonScalar } from "@/src/platform/graphql/json-scalar";

async function getMyNotifications(): Promise<Notification[]> {
  const response = await graphqlClient.request<MyNotificationsQueryResultDto>(
    queries.MY_NOTIFICATIONS_QUERY,
  );

  return mapNotificationsPayload(response.myNotifications);
}

async function markNotificationRead(notificationId: string): Promise<void> {
  const response =
    await graphqlClient.request<MarkNotificationReadMutationResultDto>(
      mutations.MARK_NOTIFICATION_READ_MUTATION,
      { notificationId },
    );

  parseJsonScalar(response.markNotificationRead);
}

export const notificationsApi = {
  getMyNotifications,
  markNotificationRead,
};
