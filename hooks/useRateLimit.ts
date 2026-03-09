/**
 * React Hook for Rate Limiting
 *
 * Provides easy integration with the rate limiting system
 * for React components and forms.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  formatTimeRemaining,
  RATE_LIMITS,
  RateLimiter,
  RateLimitResult,
  RateLimitStatus,
  shouldEnforceRateLimit,
} from "../lib/rate-limiter";

export interface UseRateLimitOptions {
  key: keyof typeof RATE_LIMITS;
  customConfig?: {
    maxRequests: number;
    windowMs: number;
    message?: string;
  };
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface UseRateLimitReturn {
  checkLimit: () => RateLimitResult;
  status: RateLimitStatus;
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  timeUntilReset: string;
  resetLimit: () => void;
  executeWithLimit: <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    args?: T,
  ) => Promise<R>;
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(options: UseRateLimitOptions): UseRateLimitReturn {
  const { key, customConfig, onError, onSuccess } = options;

  const rateLimiter = RateLimiter.getInstance("global");
  const [status, setStatus] = useState<RateLimitStatus>({
    remaining: Infinity,
    resetTime: 0,
    isLimited: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the rate limit if custom config is provided
  useEffect(() => {
    if (customConfig) {
      rateLimiter.addLimit(key, customConfig);
    }
  }, [key, customConfig, rateLimiter]);

  // Check rate limit status
  const checkLimit = useCallback((): RateLimitResult => {
    if (!shouldEnforceRateLimit(key)) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: 0,
      };
    }

    const result = rateLimiter.checkLimit(key);
    const newStatus = rateLimiter.getStatus(key);

    setStatus(newStatus);

    // Set up timeout to update status when limit resets
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newStatus.isLimited && newStatus.resetTime > Date.now()) {
      timeoutRef.current = setTimeout(() => {
        setStatus(rateLimiter.getStatus(key));
      }, newStatus.resetTime - Date.now());
    }

    return result;
  }, [key, rateLimiter]);

  // Reset the rate limit
  const resetLimit = useCallback(() => {
    rateLimiter.resetLimit(key);
    setStatus(rateLimiter.getStatus(key));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [key, rateLimiter]);

  // Execute a function with rate limiting
  const executeWithLimit = useCallback(
    async <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      args: T = [] as T,
    ): Promise<R> => {
      const result = checkLimit();

      if (!result.allowed) {
        const error = new Error(result.message || "Rate limit exceeded");
        if (onError) {
          onError(error);
        }
        throw error;
      }

      try {
        const response = await fn(...args);
        if (onSuccess) {
          onSuccess();
        }
        return response;
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
        throw error;
      }
    },
    [checkLimit, onError, onSuccess],
  );

  // Calculate formatted time until reset
  const timeUntilReset = formatTimeRemaining(status.resetTime - Date.now());

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    checkLimit,
    status,
    isLimited: status.isLimited,
    remaining: status.remaining,
    resetTime: status.resetTime,
    timeUntilReset,
    resetLimit,
    executeWithLimit,
  };
}

/**
 * Higher-order component for rate limiting
 */
export function withRateLimit<P extends object>(
  Component: React.ComponentType<P>,
  rateLimitKey: keyof typeof RATE_LIMITS,
  customConfig?: UseRateLimitOptions["customConfig"],
) {
  return function RateLimitedComponent(props: P) {
    const { isLimited, timeUntilReset, resetLimit } = useRateLimit({
      key: rateLimitKey,
      customConfig,
    });

    if (isLimited) {
      return React.createElement(
        "div",
        {
          className:
            "flex items-center justify-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg",
        },
        React.createElement(
          "div",
          {
            className: "text-center",
          },
          [
            React.createElement(
              "span",
              {
                key: "icon",
                className:
                  "material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl mb-2",
              },
              "timer",
            ),
            React.createElement(
              "h3",
              {
                key: "title",
                className:
                  "text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1",
              },
              "Rate Limit Exceeded",
            ),
            React.createElement(
              "p",
              {
                key: "message",
                className: "text-sm text-yellow-700 dark:text-yellow-300 mb-3",
              },
              `Please try again in ${timeUntilReset}`,
            ),
            React.createElement(
              "button",
              {
                key: "button",
                onClick: resetLimit,
                className:
                  "px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm",
              },
              "Reset Limit",
            ),
          ],
        ),
      );
    }

    return React.createElement(Component, props);
  };
}

/**
 * Hook for form submission with rate limiting
 */
export function useFormRateLimit(options: UseRateLimitOptions) {
  const { executeWithLimit, isLimited, timeUntilReset, remaining } =
    useRateLimit(options);

  const submitForm = useCallback(
    async <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      args: T,
    ): Promise<R> => {
      return executeWithLimit(fn, args);
    },
    [executeWithLimit],
  );

  return {
    submitForm,
    isLimited,
    timeUntilReset,
    remaining,
    canSubmit: !isLimited,
  };
}

/**
 * Hook for API calls with rate limiting
 */
export function useApiRateLimit(options: UseRateLimitOptions) {
  const { executeWithLimit, isLimited, remaining } = useRateLimit(options);

  const callApi = useCallback(
    async <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      args: T,
    ): Promise<R> => {
      return executeWithLimit(fn, args);
    },
    [executeWithLimit],
  );

  return {
    callApi,
    isLimited,
    remaining,
    canCall: !isLimited,
  };
}

/**
 * Pre-configured hooks for common rate limits
 */
export const useLoginRateLimit = () => useRateLimit({ key: "LOGIN" });
export const useRegisterRateLimit = () => useRateLimit({ key: "REGISTER" });
export const useCreateAuctionRateLimit = () =>
  useRateLimit({ key: "CREATE_AUCTION" });
export const usePlaceBidRateLimit = () => useRateLimit({ key: "PLACE_BID" });
export const useUpdateProfileRateLimit = () =>
  useRateLimit({ key: "UPDATE_PROFILE" });
export const useFollowRateLimit = () => useRateLimit({ key: "FOLLOW_USER" });
