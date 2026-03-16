/**
 * GraphQL Query Definitions
 *
 * All GraphQL queries used throughout the application
 * Based on the provided Postman collection
 */

// ==========================================
// 1. Authentication & User Queries
// ==========================================

export const HEALTH_QUERY = `
  query Health {
    health
  }
`;

export const MY_PROFILE_QUERY = `
  query MyProfile {
    myProfile
  }
`;

export const USERS_QUERY = `
  query Users {
    users {
      id
      username
      email
      fullName
      bio
      profileImageUrl
      isPrivate
      avatar
      rating
      isFollowing
      createdAt
      updatedAt
    }
  }
`;

export const USER_BY_ID_QUERY = `
  query UserById($userId: ID!) {
    userById(userId: $userId)
  }
`;

export const MY_FOLLOWERS_QUERY = `
  query MyFollowers {
    myFollowers
  }
`;

export const MY_FOLLOWING_QUERY = `
  query MyFollowing {
    myFollowing
  }
`;

export const MY_FOLLOW_REQUESTS_QUERY = `
  query MyFollowRequests {
    myFollowRequests
  }
`;

export const MY_BLOCKED_USERS_QUERY = `
  query MyBlockedUsers {
    myBlockedUsers
  }
`;

export const MY_SENT_FOLLOW_REQUESTS_QUERY = `
  query MySentFollowRequests {
    mySentFollowRequests
  }
`;

export const MY_RATING_SUMMARY_QUERY = `
  query MyRatingSummary {
    myRatingSummary
  }
`;

// ==========================================
// 2. Notifications Queries
// ==========================================

export const MY_NOTIFICATIONS_QUERY = `
  query MyNotifications {
    myNotifications
  }
`;

// ==========================================
// 3. Auctions Queries
// ==========================================

export const AUCTIONS_QUERY = `
  query Auctions {
    auctions
  }
`;

export const AUCTION_QUERY = `
  query Auction($id: ID!) {
    auction(id: $id)
  }
`;

export const AUCTION_FORM_OPTIONS_QUERY = `
  query AuctionFormOptions($category: String, $productName: String) {
    auctionFormOptions(category: $category, productName: $productName)
  }
`;

export const AUCTIONS_BY_USER_QUERY = `
  query AuctionsByUser($userId: ID!) {
    auctionsByUser(userId: $userId)
  }
`;

// ==========================================
// 4. Bids Queries
// ==========================================

export const MY_BID_QUERY = `
  query MyBid($id: ID!) {
    myBid(id: $id)
  }
`;

export const MY_BIDS_QUERY = `
  query MyBids {
    myBids
  }
`;

export const AUCTION_BIDS_QUERY = `
  query AuctionBids($id: ID!) {
    auctionBids(id: $id)
  }
`;

export const MY_BID_REQUESTS_QUERY = `
  query MyBidRequests {
    myBidRequests
  }
`;

export const AUCTION_BID_REQUESTS_QUERY = `
  query AuctionBidRequests($id: ID!) {
    auctionBidRequests(id: $id)
  }
`;

export const ALL_BIDS_QUERY = `
  query AllBids {
    allBids {
      id
      auctionId
      bidderId
      amount
      isRevealed
      nonce
      createdAt
      updatedAt
      auction {
        id
        title
        status
        endAt
        creator {
          id
          username
          avatar
        }
      }
      bidder {
        id
        username
        avatar
        fullName
      }
    }
  }
`;

// ==========================================
// 5. Reports Queries
// ==========================================

export const AUCTION_REPORT_SUMMARY_QUERY = `
  query AuctionReportSummary {
    auctionReportSummary {
      totalAuctions
      activeAuctions
      closedAuctions
      totalBids
      totalRevenue
      averageAuctionPrice
      topCategories {
        category
        count
        revenue
      }
    }
  }
`;

export const AUCTION_REPORT_QUERY = `
  query AuctionReport($id: ID!) {
    auctionReport(id: $id) {
      auction {
        id
        title
        status
        startAt
        endAt
        createdAt
        closedAt
      }
      totalBids
      uniqueBidders
      winningBid {
        id
        amount
        bidder {
          id
          username
          avatar
        }
      }
      bidHistory {
        id
        amount
        isRevealed
        createdAt
        bidder {
          id
          username
          avatar
        }
      }
      revenue
      averageBidAmount
      bidTimeline {
        timestamp
        bidCount
        averageAmount
      }
    }
  }
`;

// ==========================================
// 6. Market Queries
// ==========================================

export const MARKET_LISTINGS_QUERY = `
  query MarketListings {
    marketListings
  }
`;
