import { FollowRequest, RatingSummaryResponse, User } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonObject,
  toOptionalNumber,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";
import { mapUserDto, mapUsersListDto } from "@/src/shared/mappers/user.mapper";

function extractUserPayload(value: unknown): unknown {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);

  if (!envelope) {
    return parsed;
  }

  return (
    envelope.user ??
    envelope.profile ??
    envelope.myProfile ??
    envelope.data ??
    parsed
  );
}

export function mapProfilePayload(
  value: unknown,
  fallback: Partial<User> = {},
): User {
  return mapUserDto(extractUserPayload(value), fallback);
}

export function createUnknownUserFallback(userId: string): User {
  const now = new Date().toISOString();
  return {
    id: userId,
    username: `User ${userId.slice(0, 8)}...`,
    email: "",
    fullName: undefined,
    bio: undefined,
    profileImageUrl: undefined,
    isPrivate: undefined,
    avatar: undefined,
    rating: undefined,
    isFollowing: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function mapUserByIdPayload(value: unknown, userId: string): User {
  const fallback = createUnknownUserFallback(userId);
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const rawUser =
    envelope?.userById ?? envelope?.user ?? envelope?.profile ?? parsed;

  return mapUserDto(rawUser, {
    id: fallback.id,
    username: fallback.username,
    email: fallback.email,
    fullName: fallback.fullName,
    avatar: fallback.avatar,
    createdAt: toStringOr(fallback.createdAt, nowIso()),
    updatedAt: toStringOr(fallback.updatedAt, nowIso()),
  });
}

function pickList(
  envelope: Record<string, unknown> | null,
  keys: string[],
): unknown[] {
  if (!envelope) {
    return [];
  }

  for (const key of keys) {
    const candidate = envelope[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const nestedData = toJsonObject(envelope.data);
  if (!nestedData) {
    return [];
  }

  for (const key of keys) {
    const candidate = nestedData[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function mapUsersPayload(value: unknown, keys: string[]): User[] {
  const parsed = parseJsonScalar(value);

  if (Array.isArray(parsed)) {
    return mapUsersListDto(parsed);
  }

  const envelope = toJsonObject(parsed);
  return mapUsersListDto(pickList(envelope, keys));
}

export function mapFollowRequestsPayload(value: unknown): FollowRequest[] {
  const parsed = parseJsonScalar(value);

  if (Array.isArray(parsed)) {
    return parsed.map((entry) => mapFollowRequestDto(entry));
  }

  const envelope = toJsonObject(parsed);
  const list = pickList(envelope, [
    "myFollowRequests",
    "requests",
    "followRequests",
  ]);

  return list.map((entry) => mapFollowRequestDto(entry));
}

function mapFollowRequestDto(value: unknown): FollowRequest {
  const raw = toJsonObject(value) ?? {};
  const requester = mapUserDto(raw.requester, {
    id: "",
    username: "Unknown requester",
    email: "",
  });
  const target = mapUserDto(raw.target, {
    id: "",
    username: "Unknown target",
    email: "",
  });

  return {
    id: toStringOr(raw.id, ""),
    requester: {
      id: requester.id,
      username: requester.username,
      fullName: requester.fullName,
      avatar: requester.avatar,
    },
    target: {
      id: target.id,
      username: target.username,
      fullName: target.fullName,
      avatar: target.avatar,
    },
    status: toStringOr(raw.status, "PENDING"),
    createdAt: toStringOr(raw.createdAt, nowIso()),
  };
}

export function mapRatingSummaryPayload(value: unknown): RatingSummaryResponse {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const userPayload =
    toJsonObject(envelope?.user) ??
    toJsonObject(envelope?.myRatingSummary) ??
    toJsonObject(envelope?.ratingSummary) ??
    envelope ??
    toJsonObject(parsed) ??
    {};

  const ratingsCount = toOptionalNumber(userPayload.ratingsCount) ?? 0;

  return {
    user: {
      id: typeof userPayload.id === "string" ? userPayload.id : undefined,
      username:
        typeof userPayload.username === "string"
          ? userPayload.username
          : undefined,
      averageRating: toStringOr(userPayload.averageRating, "0"),
      ratingsCount,
    },
  };
}

function nowIso(): string {
  return new Date().toISOString();
}
