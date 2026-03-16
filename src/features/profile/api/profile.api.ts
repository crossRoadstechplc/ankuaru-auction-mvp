import * as mutations from "@/lib/graphql/mutations";
import * as queries from "@/lib/graphql/queries";
import { GraphQLError, graphqlClient } from "@/lib/graphql-client";
import { FollowRequest, RatingSummaryResponse, User, UserProfileDetails } from "@/lib/types";
import { getGraphqlBaseUrl } from "@/src/platform/config/env";
import {
  ApproveFollowRequestMutationResultDto,
  BlockUserMutationResultDto,
  FollowUserMutationResultDto,
  MyBlockedUsersQueryResultDto,
  MyFollowersQueryResultDto,
  MyFollowRequestsQueryResultDto,
  MySentFollowRequestsQueryResultDto,
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
  mapUserProfileDetailsPayload,
  mapRatingSummaryPayload,
  mapUsersPayload,
} from "@/src/features/profile/mappers/profile.mapper";
import { resolveGraphqlEndpoint } from "@/src/platform/graphql/endpoint";
import { parseJsonScalar } from "@/src/platform/graphql/json-scalar";

export type UpdateProfileInput = {
  fullName?: string;
  bio?: string;
  profileImageUrl?: File | string | null;
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

async function getUserProfileDetails(userId: string): Promise<UserProfileDetails> {
  const response = await graphqlClient.request<UserByIdQueryResultDto>(
    queries.USER_BY_ID_QUERY,
    { userId },
  );

  return mapUserProfileDetailsPayload(response.userById, userId);
}

async function getUserFollowers(userId: string): Promise<User[]> {
  const response = await getUserProfileDetails(userId);
  return response.followers;
}

async function getUserFollowing(userId: string): Promise<User[]> {
  const response = await getUserProfileDetails(userId);
  return response.following;
}

async function getMyFollowRequests(): Promise<FollowRequest[]> {
  const response = await graphqlClient.request<MyFollowRequestsQueryResultDto>(
    queries.MY_FOLLOW_REQUESTS_QUERY,
  );

  return mapFollowRequestsPayload(response.myFollowRequests);
}

async function getMySentFollowRequests(): Promise<FollowRequest[]> {
  const response =
    await graphqlClient.request<MySentFollowRequestsQueryResultDto>(
      queries.MY_SENT_FOLLOW_REQUESTS_QUERY,
    );

  return mapFollowRequestsPayload(response.mySentFollowRequests);
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

function isProfileImageUpload(
  value: UpdateProfileInput["profileImageUrl"],
): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

async function updateMyProfileWithImageUpload(
  input: UpdateProfileInput,
  file: File,
): Promise<User> {
  const token = graphqlClient.getToken();
  const endpoint = resolveGraphqlEndpoint(getGraphqlBaseUrl());
  const inputWithoutFile = sanitizeInput({
    ...input,
    profileImageUrl: undefined,
  });
  const body = new FormData();

  body.append(
    "operations",
    JSON.stringify({
      query: mutations.UPDATE_MY_PROFILE_MUTATION,
      variables: {
        input: {
          ...inputWithoutFile,
          profileImageUrl: null,
        },
      },
    }),
  );
  body.append(
    "map",
    JSON.stringify({
      0: ["variables.input.profileImageUrl"],
    }),
  );
  body.append("0", file);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Apollo-Require-Preflight": "true",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body,
  });

  const responseText = await response.text();
  const payload = (() => {
    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText) as {
        data?: UpdateMyProfileMutationResultDto;
        errors?: Array<{ message?: string }>;
        error?: string;
        message?: string;
      };
    } catch {
      return null;
    }
  })();

  const result = payload?.data;
  const errorMessage =
    payload?.errors && payload.errors.length > 0
      ? payload.errors[0]?.message || "Failed to update profile"
      : payload?.error ||
        payload?.message ||
        responseText.trim() ||
        null;

  if (result?.updateMyProfile) {
    return mapProfilePayload(result.updateMyProfile);
  }

  if (!response.ok || !result?.updateMyProfile) {
    throw new GraphQLError(
      errorMessage || `HTTP ${response.status}`,
      [],
      response.status || undefined,
    );
  }

  throw new GraphQLError(
    errorMessage || "Profile update response did not include user data",
    [],
    response.status || undefined,
  );
}

async function updateMyProfile(input: UpdateProfileInput): Promise<User> {
  if (isProfileImageUpload(input.profileImageUrl)) {
    return updateMyProfileWithImageUpload(input, input.profileImageUrl);
  }

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
    return await getUserProfileDetails(userId);
  } catch {
    return createUnknownUserFallback(userId);
  }
}

export const profileApi = {
  getMyProfile,
  getMyFollowers,
  getMyFollowing,
  getUserProfileDetails,
  getUserFollowers,
  getUserFollowing,
  getMyFollowRequests,
  getMySentFollowRequests,
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
