"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  tokenValidationReasonToMessage,
  validateJwtToken,
} from "./token";

export type SessionStatus =
  | "unknown"
  | "authenticated"
  | "unauthenticated";

type SessionState = {
  token: string | null;
  status: SessionStatus;
  hasHydrated: boolean;
  authError: string | null;
  bootstrap: (minValiditySeconds?: number) => void;
  setToken: (token: string | null) => void;
  setAuthError: (message: string | null) => void;
  clearSession: () => void;
};

const DEFAULT_MIN_VALIDITY_SECONDS = 3600;

const initialState: Omit<
  SessionState,
  "bootstrap" | "setToken" | "setAuthError" | "clearSession"
> = {
  token: null,
  status: "unknown",
  hasHydrated: false,
  authError: null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialState,
      bootstrap: (minValiditySeconds = DEFAULT_MIN_VALIDITY_SECONDS) => {
        const token = get().token;
        const validation = validateJwtToken(token, minValiditySeconds);

        if (!validation.valid) {
          const authError =
            validation.reason === "missing"
              ? null
              : tokenValidationReasonToMessage(validation.reason);

          set({
            token: null,
            status: "unauthenticated",
            hasHydrated: true,
            authError,
          });
          return;
        }

        set({
          status: "authenticated",
          hasHydrated: true,
          authError: null,
        });
      },
      setToken: (token) => {
        set({
          token,
          status: token ? "authenticated" : "unauthenticated",
          authError: null,
        });
      },
      setAuthError: (message) => {
        set({ authError: message });
      },
      clearSession: () => {
        set({
          token: null,
          status: "unauthenticated",
          hasHydrated: true,
          authError: null,
        });
      },
    }),
    {
      name: "auth-session-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
      }),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<SessionState> | undefined;
        const token = state?.token ?? null;

        if (version < 2) {
          return {
            ...initialState,
            token,
          };
        }

        return {
          ...initialState,
          ...state,
          token,
        };
      },
    },
  ),
);
