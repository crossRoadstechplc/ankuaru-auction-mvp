// API Types for Ankuaru Auction Backend

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  profileImageUrl?: string;
  isPrivate?: boolean;
  avatar?: string;
  rating?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDetails extends User {
  followers: User[];
  following: User[];
  followersCount: number;
  followingCount: number;
  ratingsCount: number;
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
  productName?: string;
  region?: string;
  commodityType?: string;
  grade?: string;
  process?: string;
  transaction?: string;
  commodityClass?: string;
  commoditySize?: string;
  commodityBrand?: string;
  quantity?: string;
  quantityUnit?: string;
  itemDescription: string;
  reservePrice: string;
  minBid: string;
  auctionType: "SELL" | "BUY";
  visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED";
  createdBy: string;
  createdAt: string;
  bidCount?: number;
  currentBid?: string;
  winnerId?: string;
  winningBid?: string;
  closedAt?: string;
  canBid?: boolean;
  hasRequestedBidAccess?: boolean;
  // Creator information (populated from GraphQL)
  creator?: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  // UI-specific fields for feed display
  tag?: string;
  tagColor?: string;
  bid?: string;
  bids?: string;
  image?: string;
  details?: string;
}

export interface AuctionCloseResponse {
  auction: {
    id: string;
    title: string;
    auctionCategory: string;
    itemDescription: string;
    reservePrice: string;
    minBid: string;
    auctionType: "SELL" | "BUY";
    bidCount: number;
    visibility: string;
    startAt: string;
    endAt: string;
    status: "CLOSED";
    createdBy: string;
    createdAt: string;
    winnerId: string;
    winningBid: string;
    closedAt: string;
  };
}

export interface AuctionReportTopBid {
  bidderId: string;
  bidderUsername?: string;
  bidderAvatar?: string | null;
  revealedAmount?: string;
  revealedAt?: string;
  isValid?: boolean;
  invalidReason?: string | null;
}

export interface AuctionReportTimelinePoint {
  timestamp: string;
  bidCount: number;
  averageAmount?: string;
}

export interface AuctionReport {
  auction: {
    id: string;
    title: string;
    status: "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED" | string;
    startAt: string;
    endAt: string;
    createdAt?: string;
    closedAt?: string;
    winnerId?: string;
    winningBid?: string;
  };
  totalBids: number;
  revealedBids: number;
  validBids: number;
  invalidBids: number;
  highestRevealedBid?: string;
  averageRevealedBid?: string;
  uniqueBidders?: number;
  revenue?: string;
  averageBidAmount?: string;
  topBids: AuctionReportTopBid[];
  bidTimeline: AuctionReportTimelinePoint[];
}

export interface CloseAuctionResult {
  auctionId: string;
  title: string;
  auctionCategory: string;
  reservePrice: string;
  minBid: string;
  bidCount: number;
  winnerId?: string;
  winningBid?: string;
  closedAt?: string;
}

export interface CreateAuctionData {
  title: string;
  auctionCategory: string;
  productName?: string;
  region?: string;
  commodityType?: string;
  grade?: string;
  process?: string;
  transaction?: string;
  commodityClass?: string;
  commoditySize?: string;
  commodityBrand?: string;
  quantity?: string;
  quantityUnit?: string;
  itemDescription: string;
  reservePrice: string;
  minBid: string;
  auctionType: "SELL" | "BUY";
  visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
  selectedUserIds?: string[];
  auctionImageUrl?: File | string | null;
  startAt: string;
  endAt: string;
}

export interface AuctionSelectOption {
  value: string;
  label: string;
}

export interface AuctionFormOptions {
  categories: AuctionSelectOption[];
  productNames: AuctionSelectOption[];
  regions: AuctionSelectOption[];
  commodityTypes: AuctionSelectOption[];
  grades: AuctionSelectOption[];
  processes: AuctionSelectOption[];
  transactions: AuctionSelectOption[];
  commodityClasses: AuctionSelectOption[];
  commoditySizes: AuctionSelectOption[];
  commodityBrands: AuctionSelectOption[];
  quantityUnits: AuctionSelectOption[];
  requiredFields: string[];
}

export interface AuctionFormOptionsParams {
  category?: string;
  productName?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  commitHash?: string;
  amount?: string;
  revealed?: boolean;
  bidderUsername?: string;
  bidderEmail?: string;
  revealedAmount?: string;
  revealedAt?: string;
  isValid?: boolean;
  invalidReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BidAccessRequestUser {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

export interface BidAccessRequest {
  id: string;
  auctionId: string;
  auctionTitle?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  createdAt: string;
  requester: BidAccessRequestUser;
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
  winner_agreement_file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface FollowRequest {
  id: string;
  requester: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  target: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<string, number>;
  recentReviews: {
    id: string;
    rating: number;
    reviewText: string;
    reviewer: {
      id: string;
      username: string;
      fullName?: string;
      avatar?: string;
    };
    createdAt: string;
  }[];
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
