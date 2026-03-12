"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/auth.store";

export default function AuthHydrator() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || hasHydrated) {
      return;
    }

    didRun.current = true;
    hydrate();
  }, [hasHydrated, hydrate]);

  return null;
}
