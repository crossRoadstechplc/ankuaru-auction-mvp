/**
 * Client-Side Rate Limiter
 *
 * Implements token bucket algorithm for preventing abuse and API spam
 * on the client side before requests reach the server.
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Token bucket rate limiter implementation
 */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(maxTokens: number, refillRateMs: number) {
    this.maxTokens = maxTokens;
    this.refillRate = maxTokens / refillRateMs;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed * this.refillRate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  consume(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  getTimeUntilNextToken(): number {
    this.refill();

    if (this.tokens >= 1) {
      return 0;
    }

    const tokensNeeded = 1;
    const timeNeeded = tokensNeeded / this.refillRate;
    return Math.ceil(timeNeeded);
  }
}

/**
 * Rate limiter class for managing multiple rate limits
 */
export class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();

  private limiters: Map<string, TokenBucket> = new Map();

  /**
   * Get or create a rate limiter instance
   */
  static getInstance(key: string = "default"): RateLimiter {
    let instance = RateLimiter.instances.get(key);

    if (!instance) {
      instance = new RateLimiter();
      RateLimiter.instances.set(key, instance);
    }

    return instance;
  }

  /**
   * Add a new rate limit rule
   */
  addLimit(key: string, config: RateLimitConfig): void {
    const bucket = new TokenBucket(config.maxRequests, config.windowMs);
    this.limiters.set(key, bucket);
  }

  /**
   * Check if a request is allowed
   */
  checkLimit(key: string): RateLimitResult {
    const bucket = this.limiters.get(key);

    if (!bucket) {
      // If no limit is set, allow all requests
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: 0,
      };
    }

    const allowed = bucket.consume();
    const remaining = bucket.getTokens();
    const resetTime = Date.now() + bucket.getTimeUntilNextToken();

    return {
      allowed,
      remaining,
      resetTime,
      message: allowed
        ? undefined
        : "Rate limit exceeded. Please try again later.",
    };
  }

  /**
   * Get current status for a limit
   */
  getStatus(key: string): RateLimitStatus {
    const bucket = this.limiters.get(key);

    if (!bucket) {
      return {
        remaining: Infinity,
        resetTime: 0,
        isLimited: false,
      };
    }

    const remaining = bucket.getTokens();
    const resetTime = Date.now() + bucket.getTimeUntilNextToken();
    const isLimited = remaining === 0;

    return {
      remaining,
      resetTime,
      isLimited,
    };
  }

  /**
   * Reset a specific limit
   */
  resetLimit(key: string): void {
    const bucket = this.limiters.get(key);
    if (bucket) {
      // Create a new bucket to effectively reset it
      const config = this.getLimitConfig(key);
      if (config) {
        this.addLimit(key, config);
      }
    }
  }

  /**
   * Get configuration for a limit (stored for reset purposes)
   */
  private getLimitConfig(key: string): RateLimitConfig | null {
    // This would need to be implemented based on how configs are stored
    // For now, return null to indicate no config is stored
    return null;
  }

  /**
   * Clear all limits
   */
  clearAllLimits(): void {
    this.limiters.clear();
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication limits
  LOGIN: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
    message: "Too many login attempts. Please try again in a minute.",
  },
  REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 3 requests per minute
    message: "Too many registration attempts. Please try again in a minute.",
  },

  // Auction limits
  CREATE_AUCTION: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 requests per hour
    message: "Too many auction creations. Please try again later.",
  },
  PLACE_BID: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute per auction
    message: "Too many bid attempts. Please slow down.",
  },
  REVEAL_BID: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
    message: "Too many bid reveals. Please try again later.",
  },

  // Profile limits
  UPDATE_PROFILE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 requests per hour
    message: "Too many profile updates. Please try again later.",
  },
  UPDATE_ACCOUNT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 requests per hour
    message: "Too many account updates. Please try again later.",
  },

  // General API limits
  GENERAL_API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
    message: "API rate limit exceeded. Please try again later.",
  },

  // Follow/Unfollow limits
  FOLLOW_USER: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
    message: "Too many follow attempts. Please try again later.",
  },

  // Notification limits
  MARK_NOTIFICATION_READ: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 50 requests per minute
    message: "Too many notification updates. Please try again later.",
  },
} as const;

/**
 * Initialize rate limiter with predefined limits
 */
export function initializeRateLimiter(): RateLimiter {
  const rateLimiter = RateLimiter.getInstance("global");

  // Add all predefined limits
  Object.entries(RATE_LIMITS).forEach(([key, config]) => {
    rateLimiter.addLimit(key, config);
  });

  return rateLimiter;
}

/**
 * Utility function to format remaining time
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "now";

  const seconds = Math.ceil(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours}h`;
}

/**
 * Utility function to check if rate limit should be enforced
 */
export function shouldEnforceRateLimit(key: string): boolean {
  // In development, we might want to relax rate limits
  if (process.env.NODE_ENV === "development") {
    return false;
  }

  // Always enforce in production
  return true;
}

/**
 * Create a rate-limited function wrapper
 */
export function withRateLimit<T extends any[], R>(
  key: string,
  fn: (...args: T) => Promise<R>,
  options?: {
    onError?: (error: Error) => void;
    customMessage?: string;
  },
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    if (!shouldEnforceRateLimit(key)) {
      return fn(...args);
    }

    const rateLimiter = RateLimiter.getInstance("global");
    const result = rateLimiter.checkLimit(key);

    if (!result.allowed) {
      const error = new Error(
        options?.customMessage || result.message || "Rate limit exceeded",
      );

      if (options?.onError) {
        options.onError(error);
      }

      throw error;
    }

    return fn(...args);
  };
}
