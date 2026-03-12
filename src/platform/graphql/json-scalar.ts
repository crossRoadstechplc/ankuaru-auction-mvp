export type JsonObject = Record<string, unknown>;

export function parseJsonScalar<T = unknown>(value: unknown): T {
  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toJsonObject(value: unknown): JsonObject | null {
  if (!isJsonObject(value)) {
    return null;
  }

  return value;
}

export function toJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function toStringOr(
  value: unknown,
  fallback: string = "",
): string {
  return typeof value === "string" ? value : fallback;
}

export function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function toOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}
