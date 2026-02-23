// API Types for Ankuaru Auction Backend

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  rating?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Auction {
  id: string;
  title: string;
  auctionCategory: string;
  itemDescription: string;
  reservePrice: string;
  minBid: string;
  auctionType: "SELL" | "BUY";
  visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
  startAt: string;
  endAt: string;
  status: "OPEN" | "REVEAL" | "CLOSED";
  createdBy: string;
  createdAt: string;
  bidCount?: number;
  currentBid?: string;
  // UI-specific fields for feed display
  tag?: string;
  tagColor?: string;
  bid?: string;
  bids?: string;
  image?: string;
  details?: string;
}

export interface CreateAuctionData {
  title: string;
  auctionCategory: string;
  itemDescription: string;
  reservePrice: string;
  minBid: string;
  auctionType: "SELL" | "BUY";
  visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
  selectedUserIds?: string[];
  startAt: string;
  endAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  commitHash: string;
  amount?: string;
  revealed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BidResponse {
  bid: Bid;
  message?: string;
}

export interface BidWithAuction {
  id: string;
  auctionId: string;
  bidderId: string;
  commitHash: string;
  revealedAmount: string | null;
  revealedAt: string | null;
  isValid: boolean;
  invalidReason: string | null;
  createdAt: string;
  auction: {
    id: string;
    title: string;
    status: "OPEN" | "REVEAL" | "CLOSED";
    visibility: string;
    startAt: string;
    endAt: string;
    createdBy: string;
  };
}


export interface CommitBidData {
  commitHash: string;
}

export interface RevealBidData {
  amount: string;
  nonce: string;
}

export interface UserRating {
  user: {
    id: string;
    username: string;
    averageRating: string;
    ratingsCount: number;
  };
}

export interface RatingSummaryResponse {
  user: {
    id?: string;
    username?: string;
    averageRating: string;
    ratingsCount?: number;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  auction_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

