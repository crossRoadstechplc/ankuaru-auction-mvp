/**
 * Shared formatting utilities for numbers, currency, dates, and IDs.
 */

export function formatNumber(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const normalized = String(value).replace(/,/g, "").trim();
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return value;
  }

  return numeric.toLocaleString("en-US", {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  });
}

export function formatEtbValue(value?: string | null): string {
  const formatted = formatNumber(value);
  return formatted === "—" ? "ETB —" : `ETB ${formatted}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatShortDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function shortId(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return value.length > 8 ? `${value.slice(0, 8)}...` : value.slice(0, 8);
}
