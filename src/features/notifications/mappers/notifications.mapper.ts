import { Notification } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonArray,
  toJsonObject,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

function toReadFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  return false;
}

export function mapNotificationDto(value: unknown): Notification {
  const dto = toJsonObject(value) ?? {};

  return {
    id: toStringOr(dto.id),
    user_id: toStringOr(dto.user_id ?? dto.userId),
    auction_id: toOptionalString(dto.auction_id ?? dto.auctionId),
    type: toStringOr(dto.type),
    title: toStringOr(dto.title),
    message: toStringOr(dto.message),
    winner_agreement_file_url: toOptionalString(
      dto.winner_agreement_file_url ?? dto.winnerAgreementFileUrl,
    ),
    is_read: toReadFlag(dto.is_read ?? dto.isRead),
    created_at: toStringOr(dto.created_at ?? dto.createdAt, new Date().toISOString()),
  };
}

export function mapNotificationsPayload(value: unknown): Notification[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const list = envelope
    ? toJsonArray(envelope.notifications ?? envelope.data ?? parsed)
    : toJsonArray(parsed);

  return list.map((entry) => mapNotificationDto(entry));
}
