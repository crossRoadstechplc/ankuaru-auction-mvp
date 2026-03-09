/**
 * Validation Module Index
 * 
 * Central exports for all validation schemas and utilities
 */

// Export all schemas
export * from './schemas';

// Re-export commonly used validation functions
export { safeParse, getValidationMessage, validateFields } from './schemas';

// Export specific schemas for convenience
export {
  // Authentication
  loginDataSchema,
  registerDataSchema,
  authResponseSchema,
  
  // Auctions
  createAuctionDataSchema,
  auctionSchema,
  
  // Bids
  commitBidDataSchema,
  revealBidDataSchema,
  bidSchema,
  bidResponseSchema,
  
  // User profiles
  updateProfileDataSchema,
  updateAccountDataSchema,
  
  // Notifications and follows
  notificationSchema,
  followRequestSchema,
  
  // API responses
  apiResponseSchema,
  apiErrorSchema,
  graphQLResponseSchema,
} from './schemas';

// Export types for convenience
export type {
  LoginData,
  RegisterData,
  AuthResponse,
  CreateAuctionData,
  Auction,
  CommitBidData,
  RevealBidData,
  Bid,
  BidResponse,
  UpdateProfileData,
  UpdateAccountData,
  Notification,
  FollowRequest,
} from './schemas';
