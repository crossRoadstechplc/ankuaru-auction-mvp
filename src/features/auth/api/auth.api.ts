import * as mutations from "@/lib/graphql/mutations";
import { graphqlClient } from "@/lib/graphql-client";
import { AuthResponse, LoginData, RegisterData } from "@/lib/types";
import {
  LoginMutationResultDto,
  RegisterMutationResultDto,
} from "@/src/features/auth/dto/auth.dto";
import { mapAuthResponsePayload } from "@/src/features/auth/mappers/auth.mapper";

async function login(input: LoginData): Promise<AuthResponse> {
  const response = await graphqlClient.request<LoginMutationResultDto>(
    mutations.LOGIN_MUTATION,
    { input },
  );

  return mapAuthResponsePayload(response.login);
}

async function register(input: RegisterData): Promise<AuthResponse> {
  const response = await graphqlClient.request<RegisterMutationResultDto>(
    mutations.REGISTER_MUTATION,
    { input },
  );

  return mapAuthResponsePayload(response.register);
}

export const authApi = {
  login,
  register,
};
