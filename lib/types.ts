// API Types for Ankuaru Auction Backend

export interface User {
  id: string;
  username: string;
  email: string;
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
  visibility: "PUBLIC" | "FOLLOWERS" | "CUSTOM";
  startAt: string;
  endAt: string;
  status: "LIVE" | "CLOSED" | "UPCOMING";
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  currentBid?: string;
  totalBids?: number;
  timeLeft?: string;
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
  visibility: "PUBLIC" | "FOLLOWERS" | "CUSTOM";
  startAt: string;
  endAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: string;
  commitHash: string;
  revealed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BidResponse {
  bid: Bid;
  message: string;
}

export interface CommitBidData {
  commitHash: string;
}

export interface RevealBidData {
  amount: string;
  nonce: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
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
