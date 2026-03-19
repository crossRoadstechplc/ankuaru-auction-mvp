import { FollowRequest, RatingSummaryResponse, User, UserProfileDetails } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonObject,
  toJsonArray,
  toOptionalBoolean,
  toOptionalNumber,
  toOptionalString,
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

function extractUserObject(value: unknown): Record<string, unknown> {
  return (toJsonObject(extractUserPayload(value)) ?? {}) as Record<string, unknown>;
}

function extractUserRelationshipEntry(
  value: unknown,
  relation: "followers" | "following",
): unknown {
  const entry = toJsonObject(value);
  if (!entry) {
    return value;
  }

  const candidates =
    relation === "followers"
      ? [
          entry.user,
          entry.follower,
          entry.followerUser,
          entry.requester,
          entry.profile,
        ]
      : [
          entry.user,
          entry.following,
          entry.followee,
          entry.followeeUser,
          entry.followedUser,
          entry.target,
          entry.profile,
        ];

  for (const candidate of candidates) {
    const user = toJsonObject(candidate);
    if (user) {
      return user;
    }
  }

  return value;
}

function pickUserList(
  raw: Record<string, unknown>,
  keys: string[],
  relation: "followers" | "following",
): User[] {
  const nestedSources = [
    raw,
    toJsonObject(raw.relationships),
    toJsonObject(raw.social),
    toJsonObject(raw.connections),
    toJsonObject(raw.profile),
    toJsonObject(raw.data),
  ].filter((source): source is Record<string, unknown> => source !== null);

  for (const source of nestedSources) {
    for (const key of keys) {
      if (!(key in source)) {
        continue;
      }

      const list = toJsonArray(source[key]);
      return list.map((entry) =>
        mapUserDto(extractUserRelationshipEntry(entry, relation)),
      );
    }
  }

  return [];
}

function pickNumericMetric(
  raw: Record<string, unknown>,
  keys: string[],
  fallback = 0,
): number {
  const nestedSources = [
    raw,
    toJsonObject(raw.stats),
    toJsonObject(raw.metrics),
    toJsonObject(raw.summary),
    toJsonObject(raw.counts),
    toJsonObject(raw.relationships),
    toJsonObject(raw.data),
  ].filter((source): source is Record<string, unknown> => source !== null);

  for (const source of nestedSources) {
    for (const key of keys) {
      const value = toOptionalNumber(source[key]);
      if (value !== undefined) {
        return value;
      }
    }
  }

  return fallback;
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
  const rawUser = extractUserPayload(value);

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

export function mapUserProfileDetailsPayload(
  value: unknown,
  userId: string,
): UserProfileDetails {
  const fallback = createUnknownUserFallback(userId);
  const rawUser = extractUserObject(value);
  const followers = pickUserList(
    rawUser,
    ["followers", "followerUsers", "followersList"],
    "followers",
  );
  const following = pickUserList(
    rawUser,
    ["following", "followingUsers", "followees"],
    "following",
  );
  const baseUser = mapUserDto(rawUser, {
    ...fallback,
    rating:
      pickNumericMetric(rawUser, ["rating", "averageRating"], fallback.rating ?? 0) ||
      fallback.rating,
    isPrivate:
      toOptionalBoolean(rawUser.isPrivate) ?? fallback.isPrivate,
  });

  return {
    ...baseUser,
    rating:
      baseUser.rating ??
      pickNumericMetric(rawUser, ["rating", "averageRating"], 0),
    followers,
    following,
    followersCount: pickNumericMetric(
      rawUser,
      ["followersCount", "followerCount", "totalFollowers"],
      followers.length,
    ),
    followingCount: pickNumericMetric(
      rawUser,
      ["followingCount", "followingsCount", "followeeCount", "totalFollowing"],
      following.length,
    ),
    ratingsCount: pickNumericMetric(
      rawUser,
      ["ratingsCount", "reviewsCount", "totalRatings"],
      0,
    ),
  };
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
    "mySentFollowRequests",
    "sentFollowRequests",
    "requests",
    "followRequests",
  ]);

  return list.map((entry) => mapFollowRequestDto(entry));
}

function mapFollowRequestDto(value: unknown): FollowRequest {
  const raw = toJsonObject(value) ?? {};
  const requester = mapFollowRequestParty(raw, "requester");
  const target = mapFollowRequestParty(raw, "target");

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

function mapFollowRequestParty(
  raw: Record<string, unknown>,
  role: "requester" | "target",
): User {
  const nestedCandidates =
    role === "requester"
      ? [
          raw.requester,
          raw.requesterUser,
          raw.requesterProfile,
          raw.requestedBy,
          raw.requestedByUser,
          raw.sender,
          raw.senderUser,
          raw.follower,
          raw.followerUser,
          raw.user,
        ]
      : [
          raw.target,
          raw.targetUser,
          raw.targetProfile,
          raw.requestedUser,
          raw.requestedTo,
          raw.followee,
          raw.followeeUser,
          raw.following,
          raw.followingUser,
          raw.recipient,
          raw.user,
        ];

  const nestedUser = nestedCandidates
    .map((candidate) => toJsonObject(candidate))
    .find((candidate) => candidate !== null);

  const prefix = role === "requester" ? "requester" : "target";
  const fallbackId = pickString(
    raw[`${prefix}Id`],
    raw[`${prefix}_id`],
    raw[role === "requester" ? "requestedById" : "requestedToId"],
    raw[role === "requester" ? "senderId" : "recipientId"],
    raw[role === "requester" ? "followerId" : "followeeId"],
    nestedUser?.id,
  );
  const fallbackUsername = pickString(
    raw[`${prefix}Username`],
    raw[`${prefix}_username`],
    raw[role === "requester" ? "requestedByUsername" : "requestedToUsername"],
    raw[role === "requester" ? "senderUsername" : "recipientUsername"],
    raw[role === "requester" ? "followerUsername" : "followeeUsername"],
    nestedUser?.username,
  );
  const fallbackFullName = pickString(
    raw[`${prefix}FullName`],
    raw[`${prefix}_full_name`],
    raw[role === "requester" ? "requestedByFullName" : "requestedToFullName"],
    raw[role === "requester" ? "senderFullName" : "recipientFullName"],
    raw[role === "requester" ? "followerFullName" : "followeeFullName"],
    nestedUser?.fullName,
  );
  const fallbackAvatar = pickString(
    raw[`${prefix}Avatar`],
    raw[`${prefix}_avatar`],
    raw[role === "requester" ? "requestedByAvatar" : "requestedToAvatar"],
    raw[role === "requester" ? "senderAvatar" : "recipientAvatar"],
    raw[role === "requester" ? "followerAvatar" : "followeeAvatar"],
    nestedUser?.avatar,
  );

  return mapUserDto(nestedUser ?? {}, {
    id: fallbackId ?? "",
    username:
      fallbackUsername ??
      (role === "requester" ? "Unknown requester" : "Unknown target"),
    email: "",
    fullName: fallbackFullName,
    avatar: fallbackAvatar,
  });
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = toOptionalString(value);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
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
