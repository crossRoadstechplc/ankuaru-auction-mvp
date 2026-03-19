"use client";

import { cn } from "@/lib/utils";
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";

type NetworkStatus = "online" | "offline";

const NETWORK_STATUS_KEY = "ankuaru-network-status";

function readStoredStatus(): NetworkStatus | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(NETWORK_STATUS_KEY);
    if (value === "online" || value === "offline") {
      return value;
    }
  } catch {
    // Ignore storage failures and fall back to live navigator state.
  }

  return null;
}

function writeStoredStatus(status: NetworkStatus): void {
  try {
    window.sessionStorage.setItem(NETWORK_STATUS_KEY, status);
  } catch {
    // Ignore storage failures; the indicator still works from navigator events.
  }
}

export function NetworkStatusIndicator({
  className,
}: {
  className?: string;
}) {
  const isOnline = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);

      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => window.navigator.onLine,
    () => true,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextStatus: NetworkStatus = isOnline ? "online" : "offline";
    const storedStatus = readStoredStatus();

    if (storedStatus !== nextStatus) {
      if (nextStatus === "offline") {
        toast.error(
          "You are offline. Some actions may not sync until the network returns.",
        );
      } else if (storedStatus === "offline") {
        toast.success("Back online. Syncing can continue again.");
      }
    }

    writeStoredStatus(nextStatus);
  }, [isOnline]);

  return (
    <div
      role="status"
      aria-live="polite"
      title={isOnline ? "Connection active" : "No network connection"}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-colors",
        isOnline
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
        className,
      )}
    >
      {isOnline ? "Online" : "Offline"}
    </div>
  );
}
