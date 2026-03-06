/**
 * API Client for Ankuaru Auction Backend
 * 
 * Senior Architect Refactor:
 * - Robust Error Handling (ApiError)
 * - Sanitized Logging (Development only)
 * - Consistent Response Parsing
 * - Logical Method Grouping
 */

import {
  Auction,
  AuctionCloseResponse,
  AuthResponse,
  Bid,
  BidResponse,
  BidWithAuction,
  CreateAuctionData,
  LoginData,
  Notification,
  RatingSummaryResponse,
  RegisterData,
  User,
  UserRating,
} from "./types";

/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
  public status: number;
  public responseData: any;

  constructor(message: string, status: number, responseData?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.responseData = responseData;
    
    // Ensure stack trace is captured (V8 environment)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

class ApiClient {
  private readonly baseURL: string;
  private token: string | null = null;
  private readonly isDebug: boolean;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://testauction.ankuaru.com";
    this.isDebug = process.env.NODE_ENV !== "production";

    // Initialize token from localStorage if on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  /**
   * Builds headers for the request
   */
  private getHeaders(options: RequestInit = {}): Headers {
    const headers = new Headers(options.headers);

    // Automatically set Content-Type to JSON if body is present and not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Attach Authorization header if token exists
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    return headers;
  }

  /**
   * Sanitizes request options for logging (removes sensitive data)
   */
  private sanitizeForLog(options: RequestInit, headers: Headers): any {
    const sanitizedOptions = { ...options };
    const sanitizedHeaders: Record<string, string> = {};
    
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "authorization") {
        sanitizedHeaders[key] = "[REDACTED]";
      } else {
        sanitizedHeaders[key] = value;
      }
    });

    return {
      method: sanitizedOptions.method || "GET",
      headers: sanitizedHeaders,
      body: sanitizedOptions.body instanceof FormData ? "[FormData]" : sanitizedOptions.body,
    };
  }

  /**
   * Standardized response handler
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const isNoContent = response.status === 204;
    let data: any = null;

    if (!isNoContent) {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = text;
      }
    }

    if (!response.ok) {
      const message = this.extractErrorMessage(data, response.statusText);
      throw new ApiError(message, response.status, data);
    }

    return data as T;
  }

  /**
   * Utility to pull the best message from various API error formats
   */
  private extractErrorMessage(data: any, fallback: string): string {
    if (typeof data === "string") return data;
    if (!data) return fallback;

    let msg = data.message || data.error || data.detail || fallback;

    // Append validation details if available
    if (data.details && Array.isArray(data.details)) {
      const details = data.details
        .map((d: any) => `${d.path?.join(".") || "field"}: ${d.message}`)
        .filter(Boolean)
        .join(", ");
      
      if (details) msg += ` (${details})`;
    }

    return msg;
  }

  /**
   * Core request implementation
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    silent: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options);

    if (this.isDebug) {
      const sanitized = this.sanitizeForLog(options, headers);
      console.log(`[API Request] ${sanitized.method} ${url}`, sanitized);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (this.isDebug) {
        console.log(`[API Response] ${response.status} ${url}`);
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Re-throw if it's already an ApiError
      if (error instanceof ApiError) {
        if (!silent && this.isDebug) {
          console.error(`[API Error] ${error.status} ${url}`, error.message, error.responseData);
        }
        throw error;
      }

      // Network or parsing error
      const networkError = new ApiError(
        error instanceof Error ? error.message : "Network error occurred",
        0
      );
      
      if (!silent && this.isDebug) {
        console.error(`[Network Error] ${url}`, networkError);
      }
      
      throw networkError;
    }
  }

  // ==========================================
  // 1. Authentication
  // ==========================================

  /**
   * Syncs token in memory and local storage
   */
  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Login existing user
   */
  public async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Clear current session
   */
  public logout(): void {
    this.setToken(null);
  }

  // ==========================================
  // 2. User & Relationship
  // ==========================================

  public async getUserRating(userId: string): Promise<UserRating> {
    return this.request<UserRating>(`/api/auth/ratings/${userId}`);
  }

  public async getMyRatingSummary(): Promise<RatingSummaryResponse> {
    return this.request<RatingSummaryResponse>("/api/auth/ratings/me/summary");
  }

  public async followUser(userId: string): Promise<void> {
    return this.request<void>(`/api/auth/follow/${userId}`, {
      method: "POST",
    });
  }

  public async unfollowUser(userId: string): Promise<void> {
    return this.request<void>(`/api/auth/follow/${userId}`, {
      method: "DELETE",
    });
  }

  public async getMyFollowers(): Promise<User[]> {
    const res = await this.request<User[] | { followers: User[] }>("/api/auth/followers/me");
    if (Array.isArray(res)) return res;
    return res?.followers || [];
  }

  public async getMyFollowing(): Promise<User[]> {
    const res = await this.request<User[] | { following: User[] }>("/api/auth/following/me");
    if (Array.isArray(res)) return res;
    return res?.following || [];
  }

  // ==========================================
  // 3. Notifications
  // ==========================================

  public async getMyNotifications(): Promise<Notification[]> {
    const res = await this.request<{ notifications: Notification[] }>("/api/auth/notifications/me");
    return res?.notifications || [];
  }

  public async markNotificationRead(notificationId: string): Promise<void> {
    return this.request<void>(`/api/auth/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  // ==========================================
  // 4. Auctions
  // ==========================================

  public async getAuctions(): Promise<Auction[]> {
    const res = await this.request<{ auctions: Auction[] }>("/api/auctions");
    return res?.auctions || [];
  }

  public async getUserAuctions(userId: string): Promise<Auction[]> {
    const res = await this.request<{ auctions: Auction[] }>(`/api/auctions/user/${userId}`);
    return res?.auctions || [];
  }

  public async getAuction(id: string): Promise<Auction> {
    const res = await this.request<{ auction: Auction }>(`/api/auctions/${id}`);
    return res.auction;
  }

  public async createAuction(data: CreateAuctionData): Promise<Auction> {
    return this.request<Auction>("/api/auctions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async closeAuction(auctionId: string): Promise<AuctionCloseResponse> {
    return this.request<AuctionCloseResponse>(`/api/auctions/${auctionId}/close`, {
      method: "POST",
    });
  }

  // ==========================================
  // 5. Bids
  // ==========================================

  public async getAuctionBids(id: string): Promise<Bid[]> {
    const res = await this.request<{ bids: Bid[] }>(`/api/auctions/${id}/bids`);
    return res?.bids || [];
  }

  public async placeBid(auctionId: string, amount: string): Promise<BidResponse> {
    return this.request<BidResponse>(`/api/auctions/${auctionId}/bids`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  public async revealBid(auctionId: string, amount: string, nonce: string): Promise<void> {
    return this.request<void>(`/api/auctions/${auctionId}/reveal`, {
      method: "POST",
      body: JSON.stringify({ amount, nonce }),
    });
  }

  /**
   * Special case: returns null on 404, throws on other errors
   */
  public async getMyBid(auctionId: string): Promise<Bid | null> {
    try {
      return await this.request<Bid>(`/api/auctions/${auctionId}/my-bid`, {}, true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async getMyBids(): Promise<BidWithAuction[]> {
    const res = await this.request<{ bids: BidWithAuction[] }>("/api/auctions/my-bids");
    return res?.bids || [];
  }

  // ==========================================
  // 6. System & Health
  // ==========================================

  public async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }

  /**
   * Raw health probe that skips the standard wrapper logic
   */
  public async checkApiStatus(): Promise<{ url: string; status: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return { 
        url: this.baseURL, 
        status: response.ok ? "OK" : `Error: ${response.status}` 
      };
    } catch (error) {
      return {
        url: this.baseURL,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
