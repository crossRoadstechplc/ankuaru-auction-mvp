/**
 * GraphQL API Wrapper
 *
 * Replaces the REST API client with GraphQL operations
 * Maintains the same interface for seamless migration
 */

import { graphqlClient } from "./graphql-client";
import * as mutations from "./graphql/mutations";
import * as queries from "./graphql/queries";
import {
  Auction,
  AuthResponse,
  Bid,
  BidResponse,
  BidWithAuction,
  CreateAuctionData,
  FollowRequest,
  LoginData,
  Notification,
  RatingSummaryResponse,
  RegisterData,
  User,
} from "./types";

/**
 * GraphQL API Client
 *
 * Provides the same interface as the REST API client
 * but uses GraphQL under the hood
 */
class GraphQLApiClient {
  // ==========================================
  // 1. Authentication
  // ==========================================

  /**
   * Syncs token in GraphQL client
   */
  public setToken(token: string | null): void {
    graphqlClient.setToken(token);
  }

  public getToken(): string | null {
    return graphqlClient.getToken();
  }

  public isAuthenticated(): boolean {
    return !!graphqlClient.getToken();
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    const response = await graphqlClient.request<{
      register: any; // JSON! type
    }>(mutations.REGISTER_MUTATION, { input: data });

    // Parse the JSON response to extract token and user
    const authData = graphqlClient.parseJSONResponse<AuthResponse>(response.register);

    if (authData.token) {
      this.setToken(authData.token);
    }
    return authData as AuthResponse;
  }

  /**
   * Login existing user
   */
  public async login(data: LoginData): Promise<AuthResponse> {
    const response = await graphqlClient.request<{
      login: any; // JSON! type
    }>(mutations.LOGIN_MUTATION, { input: data });

    // Parse the JSON response to extract token and user
    const authData = graphqlClient.parseJSONResponse<AuthResponse>(response.login);

    if (authData.token) {
      this.setToken(authData.token);
    }
    return authData as AuthResponse;
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

  public async getUserRating(userId: string): Promise<any> {
    // TODO: Not available in GraphQL collection - need backend implementation
    throw new Error(
      "getUserRating not available in GraphQL - backend implementation needed",
    );
  }

  public async getMyRatingSummary(): Promise<RatingSummaryResponse> {
    const response = await graphqlClient.request<{
      myRatingSummary: any; // JSON! type
    }>(queries.MY_RATING_SUMMARY_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw rating summary response:", response);
      console.log(
        "[GraphQL Debug] myRatingSummary type:",
        typeof response.myRatingSummary,
      );
      console.log(
        "[GraphQL Debug] myRatingSummary value:",
        JSON.stringify(response.myRatingSummary, null, 2),
      );
    }

    // Parse the JSON response to extract rating summary data
    const ratingSummaryData = graphqlClient.parseJSONResponse<any>(response.myRatingSummary);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed rating summary data:",
        JSON.stringify(ratingSummaryData, null, 2),
      );
      console.log(
        "[GraphQL Debug] ratingSummaryData.user:",
        JSON.stringify(ratingSummaryData.user, null, 2),
      );
    }

    // Extract rating summary from nested structure
    return ratingSummaryData.user || ratingSummaryData;
  }

  public async followUser(userId: string): Promise<void> {
    await graphqlClient.request<{
      followUser: { success: boolean };
    }>(mutations.FOLLOW_USER_MUTATION, { userId });
  }

  public async unfollowUser(userId: string): Promise<void> {
    await graphqlClient.request<{
      unfollowUser: { success: boolean };
    }>(mutations.UNFOLLOW_USER_MUTATION, { userId });
  }

  public async getMyFollowers(): Promise<User[]> {
    const response = await graphqlClient.request<{
      myFollowers: any; // JSON! type
    }>(queries.MY_FOLLOWERS_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw followers response:", response);
      console.log(
        "[GraphQL Debug] myFollowers type:",
        typeof response.myFollowers,
      );
      console.log(
        "[GraphQL Debug] myFollowers value:",
        JSON.stringify(response.myFollowers, null, 2),
      );
    }

    // Parse the JSON response to extract followers array
    const followersData = graphqlClient.parseJSONResponse<any>(response.myFollowers);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed followers data:",
        JSON.stringify(followersData, null, 2),
      );
      console.log(
        "[GraphQL Debug] followersData.myFollowers:",
        JSON.stringify(followersData.myFollowers, null, 2),
      );
      console.log(
        "[GraphQL Debug] followersData.followers:",
        JSON.stringify(followersData.followers, null, 2),
      );
    }

    return followersData.myFollowers || followersData.followers || [];
  }

  public async getMyFollowing(): Promise<User[]> {
    const response = await graphqlClient.request<{
      myFollowing: any; // JSON! type
    }>(queries.MY_FOLLOWING_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw following response:", response);
      console.log(
        "[GraphQL Debug] myFollowing type:",
        typeof response.myFollowing,
      );
      console.log(
        "[GraphQL Debug] myFollowing value:",
        JSON.stringify(response.myFollowing, null, 2),
      );
    }

    // Parse the JSON response to extract following array
    const followingData = graphqlClient.parseJSONResponse<any>(response.myFollowing);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed following data:",
        JSON.stringify(followingData, null, 2),
      );
      console.log(
        "[GraphQL Debug] followingData.myFollowing:",
        JSON.stringify(followingData.myFollowing, null, 2),
      );
      console.log(
        "[GraphQL Debug] followingData.following:",
        JSON.stringify(followingData.following, null, 2),
      );
    }

    return followingData.myFollowing || followingData.following || [];
  }

  public async getMyFollowRequests(): Promise<FollowRequest[]> {
    const response = await graphqlClient.request<{
      myFollowRequests: any; // JSON! type
    }>(queries.MY_FOLLOW_REQUESTS_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw follow requests response:", response);
      console.log(
        "[GraphQL Debug] myFollowRequests type:",
        typeof response.myFollowRequests,
      );
      console.log(
        "[GraphQL Debug] myFollowRequests value:",
        JSON.stringify(response.myFollowRequests, null, 2),
      );
    }

    // Parse the JSON response to extract follow requests array
    const followRequestsData = graphqlClient.parseJSONResponse<any>(response.myFollowRequests);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed follow requests data:",
        JSON.stringify(followRequestsData, null, 2),
      );
      console.log(
        "[GraphQL Debug] followRequestsData.requests:",
        JSON.stringify(followRequestsData.requests, null, 2),
      );
      console.log(
        "[GraphQL Debug] followRequestsData.myFollowRequests:",
        JSON.stringify(followRequestsData.myFollowRequests, null, 2),
      );
    }

    return (
      followRequestsData.requests || followRequestsData.myFollowRequests || []
    );
  }

  public async getMyBlockedUsers(): Promise<User[]> {
    const response = await graphqlClient.request<{
      myBlockedUsers: any; // JSON! type
    }>(queries.MY_BLOCKED_USERS_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw blocked users response:", response);
      console.log(
        "[GraphQL Debug] myBlockedUsers type:",
        typeof response.myBlockedUsers,
      );
      console.log(
        "[GraphQL Debug] myBlockedUsers value:",
        JSON.stringify(response.myBlockedUsers, null, 2),
      );
    }

    // Parse the JSON response to extract blocked users array
    const blockedUsersData = graphqlClient.parseJSONResponse<any>(response.myBlockedUsers);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed blocked users data:",
        JSON.stringify(blockedUsersData, null, 2),
      );
      console.log(
        "[GraphQL Debug] blockedUsersData.myBlockedUsers:",
        JSON.stringify(blockedUsersData.myBlockedUsers, null, 2),
      );
      console.log(
        "[GraphQL Debug] blockedUsersData.blockedUsers:",
        JSON.stringify(blockedUsersData.blockedUsers, null, 2),
      );
    }

    return (
      blockedUsersData.myBlockedUsers || blockedUsersData.blockedUsers || []
    );
  }

  // ==========================================
  // 3. Notifications
  // ==========================================

  public async getMyNotifications(): Promise<Notification[]> {
    const response = await graphqlClient.request<{
      myNotifications: any; // JSON! type
    }>(queries.MY_NOTIFICATIONS_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw notifications response:", response);
      console.log(
        "[GraphQL Debug] myNotifications type:",
        typeof response.myNotifications,
      );
      console.log(
        "[GraphQL Debug] myNotifications value:",
        response.myNotifications,
      );
    }

    // Parse the JSON response to extract notifications array
    const notificationsData = graphqlClient.parseJSONResponse<any>(response.myNotifications);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed notifications data:",
        notificationsData,
      );
      console.log(
        "[GraphQL Debug] notificationsData.notifications:",
        notificationsData.notifications,
      );
    }

    // Fix: Extract notifications from the correct property
    return notificationsData.notifications || [];
  }

  public async markNotificationRead(notificationId: string): Promise<void> {
    const response = await graphqlClient.request<{
      markNotificationRead: any; // JSON! type
    }>(mutations.MARK_NOTIFICATION_READ_MUTATION, { notificationId });

    // Parse the JSON response if needed
    const result = graphqlClient.parseJSONResponse<any>(response.markNotificationRead);

    // The mutation doesn't return meaningful data, just succeeds
    return;
  }

  public async blockUser(userId: string): Promise<void> {
    await graphqlClient.request<{
      blockUser: { success: boolean };
    }>(mutations.BLOCK_USER_MUTATION, { userId });
  }

  public async unblockUser(userId: string): Promise<void> {
    await graphqlClient.request<{
      unblockUser: { success: boolean };
    }>(mutations.UNBLOCK_USER_MUTATION, { userId });
  }

  public async approveFollowRequest(requestId: string): Promise<void> {
    await graphqlClient.request<{
      approveFollowRequest: { success: boolean };
    }>(mutations.APPROVE_FOLLOW_REQUEST_MUTATION, { requestId });
  }

  public async rejectFollowRequest(requestId: string): Promise<void> {
    await graphqlClient.request<{
      rejectFollowRequest: { success: boolean };
    }>(mutations.REJECT_FOLLOW_REQUEST_MUTATION, { requestId });
  }

  // ==========================================
  // 4. Auctions
  // ==========================================

  public async getAuctions(): Promise<Auction[]> {
    const response = await graphqlClient.request<{
      auctions: any; // JSON! type
    }>(queries.AUCTIONS_QUERY);

    // Parse the JSON response to extract auctions array
    const auctionsData = graphqlClient.parseJSONResponse<any>(response.auctions);

    return auctionsData.auctions || [];
  }

  public async getUserAuctions(userId: string): Promise<Auction[]> {
    const response = await graphqlClient.request<{
      auctionsByUser: any; // JSON! type
    }>(queries.AUCTIONS_BY_USER_QUERY, { userId });

    // Parse the JSON response to extract auctions array
    const auctionsData = graphqlClient.parseJSONResponse<any>(response.auctionsByUser);

    return auctionsData.auctions || [];
  }

  /**
   * Helper method to fetch user information by ID
   */
  private async getUserById(userId: string): Promise<User> {
    try {
      const response = await graphqlClient.request<{
        userById: any; // JSON! type
      }>(queries.USER_BY_ID_QUERY, { userId });

      // Debug: Log the raw response to see what's available
      if (process.env.NODE_ENV !== "production") {
        console.log("[GraphQL Debug] Raw userById response:", response);
        console.log("[GraphQL Debug] userById type:", typeof response.userById);
        console.log(
          "[GraphQL Debug] userById value:",
          JSON.stringify(response.userById, null, 2),
        );
      }

      // Parse the JSON response to extract user object
      const userData = graphqlClient.parseJSONResponse<any>(response.userById);

      // Debug: Log the parsed data
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[GraphQL Debug] Parsed user data:",
          JSON.stringify(userData, null, 2),
        );
        console.log(
          "[GraphQL Debug] userData.userById:",
          JSON.stringify(userData.userById, null, 2),
        );
        console.log(
          "[GraphQL Debug] userData.user:",
          JSON.stringify(userData.user, null, 2),
        );
      }

      return (
        userData.userById ||
        userData.user || {
          id: userId,
          username: `User ${userId.slice(0, 8)}...`,
          email: "",
          fullName: undefined,
          avatar: undefined,
          rating: undefined,
          isFollowing: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      // Return a basic user object if fetch fails
      return {
        id: userId,
        username: `User ${userId.slice(0, 8)}...`,
        email: "",
        fullName: undefined,
        avatar: undefined,
        rating: undefined,
        isFollowing: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Public method to get user information by ID
   */
  public async getUserInfo(userId: string): Promise<User> {
    return this.getUserById(userId);
  }

  public async getAuction(id: string): Promise<Auction> {
    const response = await graphqlClient.request<{
      auction: any; // JSON! type
    }>(queries.AUCTION_QUERY, { id });

    // Parse the JSON response to extract auction object
    const auctionData = graphqlClient.parseJSONResponse<any>(response.auction);

    // Debug: Log the raw auction data to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw auction data:", auctionData);
    }

    // Extract the auction object
    const auction = auctionData.auction;

    // TEMPORARILY disable automatic user lookup to prevent infinite loading
    // TODO: Implement proper caching strategy for user lookups
    if (auction && !auction.creator && auction.createdBy) {
      // Create a basic creator object with the available info
      auction.creator = {
        id: auction.createdBy,
        username: `User ${auction.createdBy.slice(0, 8)}...`, // Fallback
        fullName: undefined,
        avatar: undefined,
      };
    }

    return auction;
  }

  public async createAuction(data: CreateAuctionData): Promise<Auction> {
    const response = await graphqlClient.request<{
      createAuction: { auction: Auction };
    }>(mutations.CREATE_AUCTION_MUTATION, { input: data });

    return response.createAuction.auction;
  }

  public async closeAuction(auctionId: string): Promise<any> {
    const response = await graphqlClient.request<{
      closeAuction: any; // JSON! type
    }>(mutations.CLOSE_AUCTION_MUTATION, { id: auctionId });

    // Parse the JSON response to extract auction data
    const auctionData = graphqlClient.parseJSONResponse<any>(response.closeAuction);

    // Return the auction object from the parsed data
    return auctionData.auction || auctionData;
  }

  // ==========================================
  // 5. Bids
  // ==========================================

  public async getAuctionBids(id: string): Promise<Bid[]> {
    const response = await graphqlClient.request<{
      auctionBids: any; // JSON! type
    }>(queries.AUCTION_BIDS_QUERY, { id });

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw auctionBids response:", response);
      console.log(
        "[GraphQL Debug] auctionBids type:",
        typeof response.auctionBids,
      );
      console.log(
        "[GraphQL Debug] auctionBids value:",
        JSON.stringify(response.auctionBids, null, 2),
      );
    }

    // Parse the JSON response to extract bids array
    const bidsData = graphqlClient.parseJSONResponse<any>(response.auctionBids);

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed auctionBids data:",
        JSON.stringify(bidsData, null, 2),
      );
      console.log(
        "[GraphQL Debug] bidsData.auctionBids:",
        JSON.stringify(bidsData.auctionBids, null, 2),
      );
      console.log(
        "[GraphQL Debug] bidsData.bids:",
        JSON.stringify(bidsData.bids, null, 2),
      );
    }

    return bidsData.auctionBids || bidsData.bids || [];
  }

  public async placeBid(
    auctionId: string,
    amount: string,
  ): Promise<BidResponse> {
    const response = await graphqlClient.request<{
      submitBid: any; // JSON! type
    }>(mutations.SUBMIT_BID_MUTATION, {
      id: auctionId,
      input: { amount },
    });

    // Parse the JSON response to extract bid data
    const bidData = graphqlClient.parseJSONResponse<any>(response.submitBid);

    // Transform to match REST response shape
    return {
      bid: bidData.bid || bidData,
      success: true,
      message: "Bid submitted successfully",
    } as BidResponse & { success: boolean };
  }

  public async getMyBid(auctionId: string): Promise<Bid | null> {
    try {
      const response = await graphqlClient.request<{
        myBid: any; // JSON! type
      }>(queries.MY_BID_QUERY, { id: auctionId });

      // Debug: Log the raw response to see what's available
      if (process.env.NODE_ENV !== "production") {
        console.log("[GraphQL Debug] Raw myBid response:", response);
        console.log("[GraphQL Debug] myBid type:", typeof response.myBid);
        console.log(
          "[GraphQL Debug] myBid value:",
          JSON.stringify(response.myBid, null, 2),
        );
      }

      // Parse the JSON response to extract bid object
      const bidData = graphqlClient.parseJSONResponse<any>(response.myBid);

      // Debug: Log the parsed data
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[GraphQL Debug] Parsed bidData:",
          JSON.stringify(bidData, null, 2),
        );
        console.log(
          "[GraphQL Debug] bidData.myBid:",
          JSON.stringify(bidData.myBid, null, 2),
        );
      }

      return bidData.bid || bidData.myBid || bidData || null;
    } catch (error: any) {
      // Handle expected 404 errors when user hasn't placed a bid yet
      if (
        error.message?.includes("not found") ||
        error.status === 404 ||
        error.message?.includes("No bid found for this user in the auction")
      ) {
        // This is expected when user hasn't placed a bid yet
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[GraphQL Debug] No bid found for user in auction (expected)",
          );
        }
        return null;
      }
      throw error;
    }
  }

  public async getMyBids(): Promise<BidWithAuction[]> {
    const response = await graphqlClient.request<{
      myBids: any; // JSON! type
    }>(queries.MY_BIDS_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw myBids response:", response);
      console.log("[GraphQL Debug] myBids type:", typeof response.myBids);
      console.log(
        "[GraphQL Debug] myBids value:",
        JSON.stringify(response.myBids, null, 2),
      );
    }

    // Parse the JSON response to extract bids array
    const bidsData = graphqlClient.parseJSONResponse<any>(response.myBids);

    // Debug: Log the parsed data structure
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed bidsData:",
        JSON.stringify(bidsData, null, 2),
      );
      console.log(
        "[GraphQL Debug] bidsData.myBids:",
        JSON.stringify(bidsData.myBids, null, 2),
      );
    }

    const bids = bidsData.myBids || bidsData.bids || [];

    // For each bid, fetch the auction data to create BidWithAuction objects
    const bidsWithAuction: BidWithAuction[] = await Promise.all(
      bids.map(async (bid: any) => {
        try {
          const auction = await this.getAuction(bid.auctionId);
          return {
            ...bid,
            auction: {
              id: auction.id,
              title: auction.title,
              status: auction.status,
              visibility: auction.visibility,
              startAt: auction.startAt,
              endAt: auction.endAt,
              createdBy: auction.createdBy,
            },
          };
        } catch (error) {
          // If auction fetch fails, return bid with minimal auction data
          return {
            ...bid,
            auction: {
              id: bid.auctionId,
              title: "Unknown Auction",
              status: "UNKNOWN" as any,
              visibility: "UNKNOWN",
              startAt: "",
              endAt: "",
              createdBy: "",
            },
          };
        }
      }),
    );

    return bidsWithAuction;
  }

  public async revealBid(
    auctionId: string,
    amount: string,
    nonce: string,
  ): Promise<void> {
    // TODO: Reveal bid not available in GraphQL collection - marked as deprecated
    throw new Error(
      "revealBid not available in GraphQL - marked as deprecated in backend",
    );
  }

  /**
   * Raw health probe that skips the standard wrapper logic
   */
  public async checkApiStatus(): Promise<{
    url: string;
    status: string;
    error?: string;
  }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gql.ankuaru.com/graphql";
    // Remove /graphql if present for health check
    const healthUrl = baseUrl.replace(/\/graphql$/, "") + "/health";
    
    try {
      const response = await fetch(healthUrl);
      return {
        url: healthUrl,
        status: response.ok ? "OK" : `Error: ${response.status}`,
      };
    } catch (error) {
      return {
        url: healthUrl,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ==========================================
  // 7. New GraphQL Features (not used in current UI)
  // ==========================================

  /**
   * Get my profile information
   * NEW: Profile management feature
   */
  public async getMyProfile(): Promise<User> {
    const response = await graphqlClient.request<{
      myProfile: any; // JSON! type
    }>(queries.MY_PROFILE_QUERY);

    // Debug: Log the raw response to see what's available
    if (process.env.NODE_ENV !== "production") {
      console.log("[GraphQL Debug] Raw profile response:", response);
      console.log("[GraphQL Debug] myProfile type:", typeof response.myProfile);
      console.log(
        "[GraphQL Debug] myProfile value:",
        JSON.stringify(response.myProfile, null, 2),
      );
    }

    // Parse the JSON response to extract profile data
    const profileData =
      typeof response.myProfile === "string"
        ? JSON.parse(response.myProfile)
        : response.myProfile;

    // Debug: Log the parsed data
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[GraphQL Debug] Parsed profile data:",
        JSON.stringify(profileData, null, 2),
      );
      console.log(
        "[GraphQL Debug] profileData.user:",
        JSON.stringify(profileData.user, null, 2),
      );
    }

    // Extract user from nested structure
    return profileData.user || profileData;
  }

  /**
   * Update my profile information
   * NEW: Profile management feature
   */
  public async updateMyProfile(input: {
    fullName?: string;
    bio?: string;
    profileImageUrl?: string;
    isPrivate?: boolean;
  }): Promise<User> {
    const response = await graphqlClient.request<{
      updateMyProfile: User;
    }>(mutations.UPDATE_MY_PROFILE_MUTATION, { input });

    return response.updateMyProfile;
  }

  /**
   * Update my account information
   * NEW: Account management feature
   */
  public async updateMyAccount(input: {
    username?: string;
    email?: string;
  }): Promise<User> {
    const response = await graphqlClient.request<{
      updateMyAccount: User;
    }>(mutations.UPDATE_MY_ACCOUNT_MUTATION, { input });

    return response.updateMyAccount;
  }

  /**
   * Remove my profile image
   * NEW: Profile management feature
   */
  public async removeMyProfileImage(): Promise<User> {
    const response = await graphqlClient.request<{
      removeMyProfileImage: User;
    }>(mutations.REMOVE_MY_PROFILE_IMAGE_MUTATION);

    return response.removeMyProfileImage;
  }
}

// Export singleton instance
export const graphQLApiClient = new GraphQLApiClient();
export default graphQLApiClient;
