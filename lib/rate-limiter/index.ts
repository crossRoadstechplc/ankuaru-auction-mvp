/**
 * Rate Limiter Module Index
 * 
 * Central exports for all rate limiting functionality
 */

import { initializeRateLimiter } from "./rate-limiter";

// Export main classes and utilities
export {
  RateLimiter,
  TokenBucket,
  initializeRateLimiter,
  formatTimeRemaining,
  shouldEnforceRateLimit,
  withRateLimit,
} from './rate-limiter';

// Export types and interfaces
export type {
  RateLimitConfig,
  RateLimitStatus,
  RateLimitResult,
} from './rate-limiter';

// Export predefined rate limits
export { RATE_LIMITS } from './rate-limiter';

// Create and export a global rate limiter instance
export const globalRateLimiter = initializeRateLimiter();
