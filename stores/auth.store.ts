"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import graphQLApiClient from "../lib/graphql-api";
import { queryClient } from "../lib/query-client";
import { LoginData, RegisterData, User } from "../lib/types";

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

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await graphQLApiClient.login(data);
          graphQLApiClient.setToken(response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // Clear any cached data on login
          queryClient.clear();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      },
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await graphQLApiClient.register(data);
          graphQLApiClient.setToken(response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // Clear any cached data on register
          queryClient.clear();
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
        }
      },
      logout: async () => {
        try {
          graphQLApiClient.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          // Clear all cached data on logout
          queryClient.clear();
        } catch (error) {
          console.error("Logout error:", error);
          // Force logout even on error
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          queryClient.clear();
        }
      },
      hydrate: () => {
        const token = get().token;
        console.log(
          "[Auth Debug] Hydration started, token from storage:",
          token,
        );

        if (token) {
          // Simple token validation
          try {
            // Basic JWT format check
            const parts = token.split(".");
            console.log("[Auth Debug] Token parts:", parts.length, parts);

            if (parts.length === 3) {
              // Try to decode payload to check expiration
              const payload = JSON.parse(atob(parts[1]));
              const now = Math.floor(Date.now() / 1000);
              console.log("[Auth Debug] Token payload:", {
                exp: payload.exp,
                now,
                timeUntilExpiry: payload.exp - now,
              });

              // Check if token is expired or will expire within 60 seconds
              if (!payload.exp || payload.exp < now + 60) {
                console.warn(
                  "[Auth] Token expired or will expire soon, clearing auth",
                );
                // Clear invalid token from storage
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: "Authentication token expired",
                  hasHydrated: true,
                });
                return;
              }

              console.log(
                "[Auth Debug] Token is valid, setting in GraphQL client",
              );
              graphQLApiClient.setToken(token);
              if (process.env.NODE_ENV !== "production") {
                console.log(
                  "[Auth] Token restored from storage:",
                  token.substring(0, 20) + "...",
                );
              }
            } else {
              console.warn("[Auth] Invalid token format, clearing auth");
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Invalid authentication token",
                hasHydrated: true,
              });
              return;
            }
          } catch (error) {
            console.warn("[Auth] Token validation failed:", error);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Invalid authentication token",
              hasHydrated: true,
            });
            return;
          }
        } else {
          console.log("[Auth Debug] No token found in storage");
        }

        console.log("[Auth Debug] Final auth state:", {
          hasHydrated: true,
          isLoading: false,
        });
        set({ hasHydrated: true, isLoading: false });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
