import { AuthResponse } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonObject,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";
import { mapUserDto } from "@/src/shared/mappers/user.mapper";

function unwrapAuthEnvelope(value: unknown): Record<string, unknown> {
  const parsed = parseJsonScalar(value);
  const root = toJsonObject(parsed) ?? {};

  const nestedData = toJsonObject(root.data);
  if (nestedData) {
    return nestedData;
  }

  return root;
}

export function mapAuthResponsePayload(value: unknown): AuthResponse {
  const envelope = unwrapAuthEnvelope(value);
  const token = toStringOr(
    envelope.token ?? envelope.accessToken ?? envelope.jwt,
  );

  if (!token) {
    throw new Error("Authentication response missing token");
  }

  const fallbackUserId = toStringOr(envelope.userId, "unknown-user");
  const user = mapUserDto(envelope.user, {
    id: fallbackUserId,
    username: toStringOr(envelope.username, "unknown-user"),
    email: toStringOr(envelope.email, ""),
  });

  return {
    token,
    user,
  };
}
