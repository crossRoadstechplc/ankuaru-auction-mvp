/**
 * GraphQL Mutation Definitions
 *
 * All GraphQL mutations used throughout the application
 * Based on the provided Postman collection
 */

// ==========================================
// 1. Authentication Mutations
// ==========================================

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input)
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input)
  }
`;

// ==========================================
// 2. Profile Management Mutations
// ==========================================

export const UPDATE_MY_PROFILE_MUTATION = `
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
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

export const UPDATE_MY_ACCOUNT_MUTATION = `
  mutation UpdateMyAccount($input: UpdateAccountInput!) {
    updateMyAccount(input: $input) {
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

export const REMOVE_MY_PROFILE_IMAGE_MUTATION = `
  mutation RemoveMyProfileImage {
    removeMyProfileImage {
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

// ==========================================
// 3. Follow System Mutations
// ==========================================

export const FOLLOW_USER_MUTATION = `
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER_MUTATION = `
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

export const APPROVE_FOLLOW_REQUEST_MUTATION = `
  mutation ApproveFollowRequest($requestId: ID!) {
    approveFollowRequest(requestId: $requestId)
  }
`;

export const REJECT_FOLLOW_REQUEST_MUTATION = `
  mutation RejectFollowRequest($requestId: ID!) {
    rejectFollowRequest(requestId: $requestId)
  }
`;

// ==========================================
// 4. User Blocking Mutations
// ==========================================

export const BLOCK_USER_MUTATION = `
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId)
  }
`;

export const UNBLOCK_USER_MUTATION = `
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;

// ==========================================
// 5. Notifications Mutations
// ==========================================

export const MARK_NOTIFICATION_READ_MUTATION = `
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      success
    }
  }
`;

// ==========================================
// 6. Auctions Mutations
// ==========================================

export const CREATE_AUCTION_MUTATION = `
  mutation CreateAuction($input: CreateAuctionInput!) {
    createAuction(input: $input)
  }
`;

export const EDIT_AUCTION_MUTATION = `
  mutation EditAuction($id: ID!, $input: EditAuctionInput!) {
    editAuction(id: $id, input: $input) {
      id
      title
      auctionCategory
      itemDescription
      reservePrice
      minBid
      auctionType
      visibility
      startAt
      endAt
      status
      createdBy
      createdAt
      bidCount
      currentBid
      winnerId
      winningBid
      closedAt
      # UI-specific fields for feed display
      creator {
        id
        username
        avatar
        fullName
      }
      timeLeft
      isActive
      isEndingSoon
      currentBidAmount
      totalBids
    }
  }
`;

export const CLOSE_AUCTION_MUTATION = `
  mutation CloseAuction($id: ID!) {
    closeAuction(id: $id) {
      id
      title
      auctionCategory
      itemDescription
      reservePrice
      minBid
      auctionType
      visibility
      startAt
      endAt
      status
      createdBy
      createdAt
      bidCount
      currentBid
      winnerId
      winningBid
      closedAt
      # UI-specific fields for feed display
      creator {
        id
        username
        avatar
        fullName
      }
      timeLeft
      isActive
      isEndingSoon
      currentBidAmount
      totalBids
    }
  }
`;

// ==========================================
// 7. Bids Mutations
// ==========================================

export const SUBMIT_BID_MUTATION = `
  mutation SubmitBid($id: ID!, $input: SubmitBidInput!) {
    submitBid(id: $id, input: $input) {
      id
      auctionId
      bidderId
      amount
      isRevealed
      nonce
      createdAt
      updatedAt
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
// 8. Input Type Definitions (for reference)
// ==========================================

/*
RegisterInput {
  username: String!
  email: String!
  password: String!
}

LoginInput {
  email: String!
  password: String!
}

UpdateProfileInput {
  fullName: String
  bio: String
  profileImageUrl: String
  isPrivate: Boolean
}

UpdateAccountInput {
  username: String
  email: String
}

CreateAuctionInput {
  title: String!
  auctionCategory: String!
  itemDescription: String!
  reservePrice: String!
  minBid: String!
  auctionType: AuctionType!
  visibility: AuctionVisibility!
  startAt: DateTime!
  endAt: DateTime!
}

EditAuctionInput {
  title: String
  itemDescription: String
}

SubmitBidInput {
  amount: String!
}
*/
