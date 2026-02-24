// API Client for Ankuaru Auction Backend

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

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use environment variable or fallback to production URL
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://testauction.ankuaru.com";

    // Load token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    silent: boolean = false,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(
      `API Request: ${options.method || "GET"} ${url}`,
      headers,
      options,
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData: any = {};
        const text = await response.text();

        try {
          if (text) errorData = JSON.parse(text);
        } catch (e) {
          errorData = { text };
        }

        let errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          response.statusText ||
          `Request failed with status ${response.status}`;

        // Append validation details if present so it doesn't just say "Validation error"
        if (errorData.details && Array.isArray(errorData.details)) {
          const detailMsgs = errorData.details
            .map((d: any) => `${d.path?.join(".")}: ${d.message}`)
            .join(", ");
          if (detailMsgs) {
            errorMessage += ` | Details: ${detailMsgs}`;
          }
        }

        if (!silent) {
          console.error("API Error Details:", JSON.stringify(errorData, null, 2));
        }

        throw new Error(errorMessage);
      }

      // Parse JSON response (since we already checked response.ok, if it's 204 No Content, text is empty)
      const text = await response.text();
      return (text ? JSON.parse(text) : {}) as T;
    } catch (error) {
      console.error("API Error:", error);
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Authentication methods
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Store token in localStorage
    if (response.token) {
      this.token = response.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token);
      }
    }

    return response;
  }

  logout(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // User management
  async getUserRating(userId: string): Promise<UserRating> {
    return this.request<UserRating>(`/api/auth/ratings/${userId}`);
  }

  async followUser(userId: string): Promise<void> {
    return this.request<void>(`/api/auth/follow/${userId}`, {
      method: "POST",
    });
  }

  async unfollowUser(userId: string): Promise<void> {
    return this.request<void>(`/api/auth/follow/${userId}`, {
      method: "DELETE",
    });
  }

  async getMyFollowers(): Promise<User[]> {
    try {
      const response = await this.request<User[] | { followers: User[] }>(
        "/api/auth/followers/me",
      );
      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.followers)) {
        return response.followers;
      }
      console.warn("Unexpected followers response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch followers:", error);
      return [];
    }
  }

  async getMyFollowing(): Promise<User[]> {
    try {
      const response = await this.request<User[] | { following: User[] }>(
        "/api/auth/following/me",
      );
      if (Array.isArray(response)) return response;
      if (
        response &&
        Array.isArray((response as { following: User[] }).following)
      ) {
        return (response as { following: User[] }).following;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch following list:", error);
      return [];
    }
  }

  async getMyNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>("/api/auth/notifications/me");
  }

  async getMyRatingSummary(): Promise<RatingSummaryResponse> {
    return this.request<RatingSummaryResponse>("/api/auth/ratings/me/summary");
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request<void>(
      `/api/auth/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      },
    );
  }

  // Auction methods
  async getAuctions(): Promise<Auction[]> {
    try {
      const response = await this.request<{ auctions: Auction[] }>(
        "/api/auctions",
      );
      return Array.isArray(response.auctions) ? response.auctions : [];
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
      // Return empty array as fallback
      return [];
    }
  }

  async getUserAuctions(userId: string): Promise<Auction[]> {
    try {
      const response = await this.request<{ auctions: Auction[] }>(
        `/api/auctions/user/${userId}`,
      );
      return Array.isArray(response.auctions) ? response.auctions : [];
    } catch (error) {
      console.error(`Failed to fetch auctions for user ${userId}:`, error);
      return [];
    }
  }

  async getAuction(id: string): Promise<Auction> {
    const response = await this.request<{ auction: Auction }>(
      `/api/auctions/${id}`,
    );
    return response.auction;
  }

  async getAuctionBids(id: string): Promise<Bid[]> {
    try {
      const response = await this.request<{ bids: Bid[] }>(
        `/api/auctions/${id}/bids`,
      );
      return Array.isArray(response.bids) ? response.bids : [];
    } catch (error) {
      console.error(`Failed to fetch bids for auction ${id}:`, error);
      return [];
    }
  }

  async createAuction(data: CreateAuctionData): Promise<Auction> {
    return this.request<Auction>("/api/auctions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async placeBid(auctionId: string, amount: string): Promise<BidResponse> {
    console.log("Placing bid:", amount);
    return this.request<BidResponse>(`/api/auctions/${auctionId}/bids`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  async revealBid(
    auctionId: string,
    amount: string,
    nonce: string,
  ): Promise<void> {
    return this.request<void>(`/api/auctions/${auctionId}/reveal`, {
      method: "POST",
      body: JSON.stringify({ amount, nonce }),
    });
  }

  async getMyBid(auctionId: string): Promise<Bid | null> {
    try {
      // Use silent=true because "no bid found" (404) is an expected state
      return await this.request<Bid>(
        `/api/auctions/${auctionId}/my-bid`,
        {},
        true,
      );
    } catch {
      // Return null if no bid exists
      return null;
    }
  }

  async getMyBids(): Promise<BidWithAuction[]> {
    try {
      const response = await this.request<{ bids: BidWithAuction[] }>(
        "/api/auctions/my-bids",
      );
      return Array.isArray(response.bids) ? response.bids : [];
    } catch (error) {
      console.error("Failed to fetch my bids:", error);
      return [];
    }
  }

  async closeAuction(auctionId: string): Promise<AuctionCloseResponse> {
    return this.request<AuctionCloseResponse>(`/api/auctions/${auctionId}/close`, {
      method: "POST",
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }

  // Debug method to check API connectivity
  async checkApiStatus(): Promise<{
    url: string;
    status: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const status = response.ok ? "OK" : `Error: ${response.status}`;
      return { url: this.baseURL, status };
    } catch (error) {
      return {
        url: this.baseURL,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
