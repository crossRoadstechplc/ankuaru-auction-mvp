"use client";

import { queryClient } from "./query-client";

/**
 * Temporary coarse-grained cache reset during auth transitions.
 * We will narrow this to user-scoped keys once feature query keys are unified.
 */
export async function clearAuthSensitiveQueries(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
}
