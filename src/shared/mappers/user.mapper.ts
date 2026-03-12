import { User } from "@/lib/types";
import {
  toJsonObject,
  toOptionalBoolean,
  toOptionalNumber,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

type UserFallback = Partial<User> & {
  id?: string;
  username?: string;
  email?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

export function mapUserDto(
  value: unknown,
  fallback: UserFallback = {},
): User {
  const dto = toJsonObject(value) ?? {};
  const createdAtFallback = fallback.createdAt ?? nowIso();
  const updatedAtFallback = fallback.updatedAt ?? createdAtFallback;
  const profileImageUrl = toOptionalString(dto.profileImageUrl);
  const avatar = toOptionalString(dto.avatar) ?? profileImageUrl;

  return {
    id: toStringOr(dto.id, fallback.id ?? ""),
    username: toStringOr(dto.username, fallback.username ?? "Unknown user"),
    email: toStringOr(dto.email, fallback.email ?? ""),
    fullName: toOptionalString(dto.fullName) ?? fallback.fullName,
    bio: toOptionalString(dto.bio) ?? fallback.bio,
    profileImageUrl,
    isPrivate: toOptionalBoolean(dto.isPrivate) ?? fallback.isPrivate,
    avatar: avatar ?? fallback.avatar,
    rating: toOptionalNumber(dto.rating) ?? fallback.rating,
    isFollowing:
      toOptionalBoolean(dto.isFollowing) ?? fallback.isFollowing,
    createdAt: toStringOr(dto.createdAt, createdAtFallback),
    updatedAt: toStringOr(dto.updatedAt, updatedAtFallback),
  };
}

export function mapUsersListDto(value: unknown): User[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry) => mapUserDto(entry));
}
