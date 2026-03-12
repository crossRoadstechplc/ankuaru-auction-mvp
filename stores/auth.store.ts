"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LoginData, RegisterData, User } from "../lib/types";
import { authApi } from "../src/features/auth/api/auth.api";
import { useSessionStore } from "../src/features/auth/session/session.store";
import { clearAuthSensitiveQueries } from "../src/shared/query/auth-cache";

type AuthState = {
  user: User | null;
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
  user: null,
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

  return {
    token: session.token,
    isAuthenticated,
    hasHydrated: session.hasHydrated,
    isLoading: !session.hasHydrated,
    error:
      session.authError !== null
        ? session.authError
        : isAuthenticated
          ? null
          : current.error,
    user: isAuthenticated ? current.user : null,
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
            user: response.user,
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
            user: null,
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
            user: response.user,
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
            user: null,
            token: null,
          });
          throw error;
        }
      },
      logout: async () => {
        try {
          useSessionStore.getState().clearSession();
          set({
            user: null,
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
            user: null,
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
        user: state.user,
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
