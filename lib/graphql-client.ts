"use client";

import { validateJwtToken } from "../src/features/auth/session/token";
import { getGraphqlBaseUrl } from "../src/platform/config/env";
import { TransportError } from "../src/platform/error/transport-errors";
import { GraphQLTransport } from "../src/platform/graphql/graphql-transport";
import { clearAuthSensitiveQueries } from "../src/shared/query/auth-cache";

type GraphQLAuthAdapter = {
  getToken: () => string | null;
  setToken?: (token: string | null) => void;
  clearSession?: () => void;
};

let graphQLAuthAdapter: GraphQLAuthAdapter = {
  getToken: () => null,
};

export function configureGraphQLAuthAdapter(adapter: GraphQLAuthAdapter): void {
  graphQLAuthAdapter = adapter;
}

export class GraphQLError extends Error {
  public readonly errors: unknown[];
  public readonly status?: number;
  public readonly statusCode?: number;

  constructor(message: string, errors: unknown[] = [], statusCode?: number) {
    super(message);
    this.name = "GraphQLError";
    this.errors = errors;
    this.status = statusCode;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    }
  }
}

export class GraphQLClient {
  private readonly baseURL: string;
  private tokenOverride: string | null = null;
  private readonly isDebug: boolean;
  private readonly transport: GraphQLTransport;

  constructor() {
    this.baseURL = getGraphqlBaseUrl();
    this.isDebug = process.env.NODE_ENV !== "production";
    this.transport = new GraphQLTransport({
      baseUrl: this.baseURL,
      getAccessToken: () => this.tokenOverride ?? graphQLAuthAdapter.getToken(),
      onUnauthorized: () => {
        this.tokenOverride = null;
        graphQLAuthAdapter.clearSession?.();
        void clearAuthSensitiveQueries();
      },
      isDebug: this.isDebug,
    });
  }

  public setToken(token: string | null): void {
    this.tokenOverride = token;
    graphQLAuthAdapter.setToken?.(token);

    if (this.isDebug) {
      console.log(`[GraphQL] Token ${token ? "set" : "cleared"}`);
    }
  }

  public getToken(): string | null {
    return this.tokenOverride ?? graphQLAuthAdapter.getToken();
  }

  public logout(): void {
    this.setToken(null);
    void clearAuthSensitiveQueries();

    if (this.isDebug) {
      console.log("[GraphQL] Token cleared (logout)");
    }
  }

  public validateToken(token: string): boolean {
    return validateJwtToken(token, 3600).valid;
  }

  public async checkGraphQLHealth(): Promise<{
    url: string;
    status: string;
    error?: string;
  }> {
    return this.transport.checkHealth();
  }

  public async request<T>(
    query: string,
    variables?: Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await this.transport.request<T>({
        query,
        variables,
        context,
      });
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }

      if (error instanceof TransportError) {
        const graphqlErrors =
          (error.details?.graphqlErrors as unknown[] | undefined) ?? [];
        const message = error.statusCode
          ? error.message.includes(`${error.statusCode}`)
            ? error.message
            : `HTTP ${error.statusCode}: ${error.message}`
          : error.message;

        throw new GraphQLError(message, graphqlErrors, error.statusCode);
      }

      if (error instanceof Error) {
        throw new GraphQLError(error.message);
      }

      throw new GraphQLError("Unknown GraphQL transport error");
    }
  }
}

export const graphqlClient = new GraphQLClient();
export default graphqlClient;
