"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LoginData, RegisterData } from "../lib/types";
import { authApi } from "../src/features/auth/api/auth.api";
import { useSessionStore } from "../src/features/auth/session/session.store";
import { extractUserIdFromJwt } from "../src/features/auth/session/token";
import { clearAuthSensitiveQueries } from "../src/shared/query/auth-cache";

type AuthState = {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
  clearError: () => void;
};

const initialState: Omit<
  AuthState,
  "login" | "register" | "logout" | "hydrate" | "clearError"
> = {
  userId: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasHydrated: false,
};

type SessionSnapshot = Pick<
  ReturnType<typeof useSessionStore.getState>,
  "token" | "status" | "hasHydrated" | "authError"
>;

function getSessionSnapshot(): SessionSnapshot {
  const { token, status, hasHydrated, authError } = useSessionStore.getState();
  return { token, status, hasHydrated, authError };
}

function projectSessionToAuthState(
  session: SessionSnapshot,
  current: AuthState,
): Partial<AuthState> {
  const isAuthenticated =
    session.status === "authenticated" && !!session.token;
  const tokenUserId = extractUserIdFromJwt(session.token);

  return {
    token: session.token,
    userId: isAuthenticated
      ? (tokenUserId ?? current.userId)
      : null,
    isAuthenticated,
    hasHydrated: session.hasHydrated,
    isLoading: !session.hasHydrated,
    error:
      session.authError !== null
        ? session.authError
        : isAuthenticated
          ? null
          : current.error,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          useSessionStore.getState().setToken(response.token);
          set({
            userId: response.user.id || extractUserIdFromJwt(response.token),
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            hasHydrated: true,
          });
          await clearAuthSensitiveQueries();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            userId: null,
            token: null,
          });
          throw error;
        }
      },
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          useSessionStore.getState().setToken(response.token);
          set({
            userId: response.user.id || extractUserIdFromJwt(response.token),
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            hasHydrated: true,
          });
          await clearAuthSensitiveQueries();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Registration failed";
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            userId: null,
            token: null,
          });
          throw error;
        }
      },
      logout: async () => {
        try {
          useSessionStore.getState().clearSession();
          set({
            userId: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            hasHydrated: true,
          });
          await clearAuthSensitiveQueries();
        } catch (error) {
          console.error("Logout error:", error);
          set({
            userId: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            hasHydrated: true,
          });
          await clearAuthSensitiveQueries();
        }
      },
      hydrate: () => {
        if (get().hasHydrated) {
          return;
        }

        set({ isLoading: true });
        useSessionStore.getState().bootstrap();
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-ui-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
      }),
    },
  ),
);

let sessionSyncInitialized = false;

if (!sessionSyncInitialized) {
  sessionSyncInitialized = true;

  useSessionStore.subscribe((sessionState) => {
    useAuthStore.setState((current) =>
      projectSessionToAuthState(
        {
          token: sessionState.token,
          status: sessionState.status,
          hasHydrated: sessionState.hasHydrated,
          authError: sessionState.authError,
        },
        current,
      ),
    );
  });

  useAuthStore.setState((current) =>
    projectSessionToAuthState(getSessionSnapshot(), current),
  );
}
