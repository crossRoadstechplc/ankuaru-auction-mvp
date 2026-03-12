type TokenValidationFailureReason =
  | "missing"
  | "invalid_format"
  | "decode_failed"
  | "missing_exp"
  | "expired_or_expiring";

type TokenValidationResult =
  | { valid: true; exp: number }
  | { valid: false; reason: TokenValidationFailureReason };

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  if (typeof atob === "function") {
    return atob(padded);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  throw new Error("No base64 decoder available");
}

export function validateJwtToken(
  token: string | null | undefined,
  minValiditySeconds = 0,
): TokenValidationResult {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "invalid_format" };
  }

  try {
    const decoded = decodeBase64Url(parts[1]);
    const payload = JSON.parse(decoded) as { exp?: number };

    if (!payload.exp || typeof payload.exp !== "number") {
      return { valid: false, reason: "missing_exp" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now + minValiditySeconds) {
      return { valid: false, reason: "expired_or_expiring" };
    }

    return { valid: true, exp: payload.exp };
  } catch {
    return { valid: false, reason: "decode_failed" };
  }
}

export function tokenValidationReasonToMessage(
  reason: TokenValidationFailureReason,
): string {
  switch (reason) {
    case "missing":
      return "No authentication token found";
    case "invalid_format":
      return "Invalid authentication token format";
    case "decode_failed":
      return "Failed to decode authentication token";
    case "missing_exp":
      return "Authentication token expiration is invalid";
    case "expired_or_expiring":
      return "Authentication token expired";
    default:
      return "Authentication token is invalid";
  }
}

