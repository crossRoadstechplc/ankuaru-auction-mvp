import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { graphqlClient } from "@/lib/graphql-client";
import { FollowRequest, RatingSummaryResponse, User } from "@/lib/types";
import {
  ApproveFollowRequestMutationResultDto,
  BlockUserMutationResultDto,
  FollowUserMutationResultDto,
  MyBlockedUsersQueryResultDto,
  MyFollowersQueryResultDto,
  MyFollowRequestsQueryResultDto,
  MyFollowingQueryResultDto,
  MyProfileQueryResultDto,
  MyRatingSummaryQueryResultDto,
  RejectFollowRequestMutationResultDto,
  RemoveMyProfileImageMutationResultDto,
  UnblockUserMutationResultDto,
  UnfollowUserMutationResultDto,
  UpdateMyAccountMutationResultDto,
  UpdateMyProfileMutationResultDto,
  UserByIdQueryResultDto,
} from "@/src/features/profile/dto/profile.dto";
import {
  createUnknownUserFallback,
  mapFollowRequestsPayload,
  mapProfilePayload,
  mapRatingSummaryPayload,
  mapUserByIdPayload,
  mapUsersPayload,
} from "@/src/features/profile/mappers/profile.mapper";
import { parseJsonScalar } from "@/src/platform/graphql/json-scalar";

type UpdateProfileInput = {
  fullName?: string;
  bio?: string;
  profileImageUrl?: string;
  isPrivate?: boolean;
};

type UpdateAccountInput = {
  username?: string;
  email?: string;
};

function sanitizeInput<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== "" && value !== undefined),
  ) as Partial<T>;
}

async function getMyProfile(): Promise<User> {
  const response = await graphqlClient.request<MyProfileQueryResultDto>(
    queries.MY_PROFILE_QUERY,
  );

  return mapProfilePayload(response.myProfile);
}

async function getMyFollowers(): Promise<User[]> {
  const response = await graphqlClient.request<MyFollowersQueryResultDto>(
    queries.MY_FOLLOWERS_QUERY,
  );

  return mapUsersPayload(response.myFollowers, ["myFollowers", "followers"]);
}

async function getMyFollowing(): Promise<User[]> {
  const response = await graphqlClient.request<MyFollowingQueryResultDto>(
    queries.MY_FOLLOWING_QUERY,
  );

  return mapUsersPayload(response.myFollowing, ["myFollowing", "following"]);
}

async function getUserFollowers(_userId: string): Promise<User[]> {
  void _userId;
  return getMyFollowers();
}

async function getUserFollowing(_userId: string): Promise<User[]> {
  void _userId;
  return getMyFollowing();
}

async function getMyFollowRequests(): Promise<FollowRequest[]> {
  const response = await graphqlClient.request<MyFollowRequestsQueryResultDto>(
    queries.MY_FOLLOW_REQUESTS_QUERY,
  );

  return mapFollowRequestsPayload(response.myFollowRequests);
}

async function getMyBlockedUsers(): Promise<User[]> {
  const response = await graphqlClient.request<MyBlockedUsersQueryResultDto>(
    queries.MY_BLOCKED_USERS_QUERY,
  );

  return mapUsersPayload(response.myBlockedUsers, [
    "myBlockedUsers",
    "blockedUsers",
  ]);
}

async function getMyRatingSummary(): Promise<RatingSummaryResponse> {
  const response = await graphqlClient.request<MyRatingSummaryQueryResultDto>(
    queries.MY_RATING_SUMMARY_QUERY,
  );

  return mapRatingSummaryPayload(response.myRatingSummary);
}

async function followUser(userId: string): Promise<void> {
  const response = await graphqlClient.request<FollowUserMutationResultDto>(
    mutations.FOLLOW_USER_MUTATION,
    { userId },
  );

  parseJsonScalar(response.followUser);
}

async function unfollowUser(userId: string): Promise<void> {
  const response = await graphqlClient.request<UnfollowUserMutationResultDto>(
    mutations.UNFOLLOW_USER_MUTATION,
    { userId },
  );

  parseJsonScalar(response.unfollowUser);
}

async function approveFollowRequest(requestId: string): Promise<void> {
  const response =
    await graphqlClient.request<ApproveFollowRequestMutationResultDto>(
      mutations.APPROVE_FOLLOW_REQUEST_MUTATION,
      { requestId },
    );

  parseJsonScalar(response.approveFollowRequest);
}

async function rejectFollowRequest(requestId: string): Promise<void> {
  const response =
    await graphqlClient.request<RejectFollowRequestMutationResultDto>(
      mutations.REJECT_FOLLOW_REQUEST_MUTATION,
      { requestId },
    );

  parseJsonScalar(response.rejectFollowRequest);
}

async function blockUser(userId: string): Promise<void> {
  const response = await graphqlClient.request<BlockUserMutationResultDto>(
    mutations.BLOCK_USER_MUTATION,
    { userId },
  );

  parseJsonScalar(response.blockUser);
}

async function unblockUser(userId: string): Promise<void> {
  const response = await graphqlClient.request<UnblockUserMutationResultDto>(
    mutations.UNBLOCK_USER_MUTATION,
    { userId },
  );

  parseJsonScalar(response.unblockUser);
}

async function updateMyProfile(input: UpdateProfileInput): Promise<User> {
  const response = await graphqlClient.request<UpdateMyProfileMutationResultDto>(
    mutations.UPDATE_MY_PROFILE_MUTATION,
    { input: sanitizeInput(input) },
  );

  return mapProfilePayload(response.updateMyProfile);
}

async function updateMyAccount(input: UpdateAccountInput): Promise<User> {
  const response = await graphqlClient.request<UpdateMyAccountMutationResultDto>(
    mutations.UPDATE_MY_ACCOUNT_MUTATION,
    { input: sanitizeInput(input) },
  );

  return mapProfilePayload(response.updateMyAccount);
}

async function removeMyProfileImage(): Promise<User> {
  const response =
    await graphqlClient.request<RemoveMyProfileImageMutationResultDto>(
      mutations.REMOVE_MY_PROFILE_IMAGE_MUTATION,
    );

  return mapProfilePayload(response.removeMyProfileImage);
}

async function getUserById(userId: string): Promise<User> {
  try {
    const response = await graphqlClient.request<UserByIdQueryResultDto>(
      queries.USER_BY_ID_QUERY,
      { userId },
    );

    return mapUserByIdPayload(response.userById, userId);
  } catch {
    return createUnknownUserFallback(userId);
  }
}

export const profileApi = {
  getMyProfile,
  getMyFollowers,
  getMyFollowing,
  getUserFollowers,
  getUserFollowing,
  getMyFollowRequests,
  getMyBlockedUsers,
  getMyRatingSummary,
  followUser,
  unfollowUser,
  approveFollowRequest,
  rejectFollowRequest,
  blockUser,
  unblockUser,
  updateMyProfile,
  updateMyAccount,
  removeMyProfileImage,
  getUserById,
};
