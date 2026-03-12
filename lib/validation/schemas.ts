/**
 * Zod Validation Schemas
 *
 * Comprehensive validation schemas for all user inputs and API responses
 * in the Ankuaru B2B coffee auction platform.
 */

import { z } from "zod";

// ==========================================
// Base Schemas
// ==========================================

/**
 * Base user schema with common fields
 */
export const baseUserSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  fullName: z
    .string()
    .min(1, "Full name cannot be empty")
    .max(100, "Full name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profileImageUrl: z.string().url("Invalid profile image URL").optional(),
  isPrivate: z.boolean().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  rating: z.number().min(0).max(5).optional(),
  isFollowing: z.boolean().optional(),
  createdAt: z.string().datetime("Invalid creation date"),
  updatedAt: z.string().datetime("Invalid update date"),
});

/**
 * Authentication schemas
 */
export const loginDataSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const registerDataSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
});

export const authResponseSchema = z.object({
  token: z.string().min(1, "Authentication token is required"),
  user: baseUserSchema,
});

// ==========================================
// Auction Schemas
// ==========================================

/**
 * Auction creation and management schemas
 */
export const createAuctionDataSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must be less than 200 characters"),
    auctionCategory: z
      .string()
      .min(1, "Category is required")
      .max(50, "Category must be less than 50 characters"),
    itemDescription: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be less than 2000 characters"),
    reservePrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Reserve price must be a valid number")
      .refine(
        (val) => parseFloat(val) > 0,
        "Reserve price must be greater than 0",
      ),
    minBid: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Minimum bid must be a valid number")
      .refine(
        (val) => parseFloat(val) > 0,
        "Minimum bid must be greater than 0",
      ),
    auctionType: z.enum(["SELL", "BUY"], {
      message: "Auction type must be either SELL or BUY",
    }),
    visibility: z.enum(["PUBLIC", "FOLLOWERS", "SELECTED"], {
      message: "Visibility must be PUBLIC, FOLLOWERS, or SELECTED",
    }),
    selectedUserIds: z
      .array(z.string().uuid("Invalid user ID format"))
      .optional(),
    startAt: z
      .string()
      .datetime("Invalid start date and time")
      .refine(
        (val) => new Date(val) > new Date(),
        "Start date must be in the future",
      ),
    endAt: z
      .string()
      .datetime("Invalid end date and time")
      .refine(
        (val) => new Date(val) > new Date(),
        "End date must be in the future",
      ),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "End date must be after start date",
  });

export const auctionSchema = z.object({
  id: z.string().uuid("Invalid auction ID"),
  title: z.string(),
  auctionCategory: z.string(),
  itemDescription: z.string(),
  reservePrice: z.string(),
  minBid: z.string(),
  auctionType: z.enum(["SELL", "BUY"]),
  visibility: z.enum(["PUBLIC", "FOLLOWERS", "SELECTED"]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  status: z.enum(["SCHEDULED", "OPEN", "REVEAL", "CLOSED"]),
  createdBy: z.string().uuid("Invalid creator ID"),
  createdAt: z.string().datetime(),
  bidCount: z.number().int().min(0).optional(),
  currentBid: z.string().optional(),
  winnerId: z.string().uuid().optional(),
  winningBid: z.string().optional(),
  closedAt: z.string().datetime().optional(),
  creator: z
    .object({
      id: z.string().uuid(),
      username: z.string(),
      fullName: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
  // UI-specific fields
  tag: z.string().optional(),
  tagColor: z.string().optional(),
  bid: z.string().optional(),
  bids: z.string().optional(),
  image: z.string().optional(),
  details: z.string().optional(),
});

// ==========================================
// Bid Schemas
// ==========================================

/**
 * Bid submission and management schemas
 */
export const commitBidDataSchema = z.object({
  commitHash: z
    .string()
    .min(1, "Commit hash is required")
    .regex(/^[a-fA-F0-9]{64}$/, "Invalid commit hash format"),
});

export const revealBidDataSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Bid amount must be a valid number")
    .refine((val) => parseFloat(val) > 0, "Bid amount must be greater than 0"),
  nonce: z
    .string()
    .min(1, "Nonce is required")
    .regex(/^[a-fA-F0-9]{64}$/, "Invalid nonce format"),
});

export const bidSchema = z.object({
  id: z.string().uuid("Invalid bid ID"),
  auctionId: z.string().uuid("Invalid auction ID"),
  bidderId: z.string().uuid("Invalid bidder ID"),
  commitHash: z.string().optional(),
  amount: z.string().optional(),
  revealed: z.boolean().optional(),
  bidderUsername: z.string().optional(),
  bidderEmail: z.string().email().optional(),
  revealedAmount: z.string().optional(),
  revealedAt: z.string().datetime().optional(),
  isValid: z.boolean().optional(),
  invalidReason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const bidResponseSchema = z.object({
  bid: bidSchema,
  message: z.string().optional(),
});

// ==========================================
// User Profile Schemas
// ==========================================

/**
 * Profile and account management schemas
 */
export const updateProfileDataSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name cannot be empty")
    .max(100, "Full name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profileImageUrl: z.string().url("Invalid profile image URL").optional(),
  isPrivate: z.boolean().optional(),
});

export const updateAccountDataSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .optional(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(254, "Email address is too long")
      .optional(),
  })
  .refine((data) => data.username !== undefined || data.email !== undefined, {
    message: "At least one field must be provided for update",
  });

// ==========================================
// Notification and Follow Schemas
// ==========================================

/**
 * Notification and relationship schemas
 */
export const notificationSchema = z.object({
  id: z.string().uuid("Invalid notification ID"),
  user_id: z.string().uuid("Invalid user ID"),
  auction_id: z.string().uuid("Invalid auction ID").optional(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  winner_agreement_file_url: z.string().url().optional(),
  is_read: z.boolean(),
  created_at: z.string().datetime(),
});

export const followRequestSchema = z.object({
  id: z.string().uuid("Invalid follow request ID"),
  requester: z.object({
    id: z.string().uuid(),
    username: z.string(),
    fullName: z.string().optional(),
    avatar: z.string().optional(),
  }),
  target: z.object({
    id: z.string().uuid(),
    username: z.string(),
    fullName: z.string().optional(),
    avatar: z.string().optional(),
  }),
  status: z.string(),
  createdAt: z.string().datetime(),
});

// ==========================================
// API Response Schemas
// ==========================================

/**
 * Generic API response schemas
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const apiErrorSchema = z.object({
  message: z.string(),
  status: z.number().int().optional(),
  code: z.string().optional(),
});

// ==========================================
// GraphQL Response Schemas
// ==========================================

/**
 * GraphQL-specific response schemas
 */
export const graphQLResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.record(z.string(), dataSchema).optional(),
    errors: z
      .array(
        z.object({
          message: z.string(),
          locations: z
            .array(
              z.object({
                line: z.number().int(),
                column: z.number().int(),
              }),
            )
            .optional(),
          path: z.array(z.union([z.string(), z.number()])).optional(),
          extensions: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
  });

// ==========================================
// Type Exports
// ==========================================

// Extract inferred types for use in the application
export type LoginData = z.infer<typeof loginDataSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type CreateAuctionData = z.infer<typeof createAuctionDataSchema>;
export type Auction = z.infer<typeof auctionSchema>;
export type CommitBidData = z.infer<typeof commitBidDataSchema>;
export type RevealBidData = z.infer<typeof revealBidDataSchema>;
export type Bid = z.infer<typeof bidSchema>;
export type BidResponse = z.infer<typeof bidResponseSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileDataSchema>;
export type UpdateAccountData = z.infer<typeof updateAccountDataSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type FollowRequest = z.infer<typeof followRequestSchema>;

// ==========================================
// Validation Utilities
// ==========================================

/**
 * Helper function to validate and parse data with proper error handling
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

/**
 * Helper function to get human-readable error messages
 */
export function getValidationMessage(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (!firstError) return "Validation failed";

  return firstError.message;
}

/**
 * Helper function to validate multiple fields and collect all errors
 */
export function validateFields<T extends Record<string, z.ZodType>>(
  schemas: T,
  data: Record<string, unknown>,
): {
  isValid: boolean;
  errors: Record<string, string>;
  data: Partial<Record<keyof T, unknown>>;
} {
  const errors: Record<string, string> = {};
  const validData: Partial<Record<keyof T, unknown>> = {};
  let isValid = true;

  for (const [key, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(data[key]);

    if (result.success) {
      validData[key as keyof T] = result.data;
    } else {
      errors[key] = getValidationMessage(result.error);
      isValid = false;
    }
  }

  return { isValid, errors, data: validData };
}
