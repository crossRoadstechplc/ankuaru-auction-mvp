"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import apiClient from "../lib/api";
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
          const response = await apiClient.login(data);
          apiClient.setToken(response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(data);
          apiClient.setToken(response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Registration failed",
          });
          throw error;
        }
      },
      logout: async () => {
        set({ isLoading: true, error: null });
        apiClient.logout();
        queryClient.removeQueries({ queryKey: ["bids", "my"] });
        queryClient.removeQueries({ queryKey: ["followers"] });
        queryClient.removeQueries({ queryKey: ["following"] });
        queryClient.removeQueries({ queryKey: ["notifications"] });
        set({
          ...initialState,
          isLoading: false,
          hasHydrated: true,
        });
      },
      hydrate: () => {
        const { hasHydrated, token } = get();
        if (hasHydrated) {
          return;
        }
        apiClient.setToken(token);
        set({ hasHydrated: true, isLoading: false });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        apiClient.setToken(state?.token ?? null);
        useAuthStore.setState({
          hasHydrated: true,
          isLoading: false,
        });
      },
    },
  ),
);
