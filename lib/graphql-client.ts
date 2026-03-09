/**
 * Enhanced GraphQL Client for Ankuaru Auction Backend
 *
 * Features:
 * - TypeScript generics for type safety
 * - Comprehensive error handling
 * - Development logging
 * - Token management integration
 */

import { ErrorHandler } from "./error-handler/error-handler";
import { toastManager } from "./error-handler/toast-manager";

/**
 * GraphQL Client with Centralized Error Handling
 */

export class GraphQLError extends Error {
  public readonly errors: unknown[];
  public readonly statusCode?: number;

  constructor(message: string, errors: unknown[] = [], statusCode?: number) {
    super(message);
    this.name = "GraphQLError";
    this.errors = errors;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    }
  }
}

export class GraphQLClient {
  private readonly baseURL: string;
  private token: string | null = null;
  private readonly isDebug: boolean;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://gql.ankuaru.com/graphql";
    this.isDebug = process.env.NODE_ENV !== "production";
  }

  /**
   * Set authentication token for all subsequent requests
   */
  public setToken(token: string | null): void {
    this.token = token;

    if (this.isDebug) {
      console.log(`[GraphQL] Token ${token ? "set" : "cleared"}`);
    }
  }

  /**
   * Get current authentication token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication token (logout)
   */
  public logout(): void {
    this.token = null;

    if (this.isDebug) {
      console.log("[GraphQL] Token cleared (logout)");
    }
  }

  /**
   * Validate token format and basic structure
   */
  public validateToken(token: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    // Basic JWT format check (header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Try to decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      // Check if token is expired or will expire within 1 hour
      if (payload.exp && payload.exp < now + 3600) {
        if (this.isDebug) {
          console.log("[GraphQL] Token expired or will expire soon");
        }
        return false;
      }

      return true;
    } catch (error) {
      if (this.isDebug) {
        console.log("[GraphQL] Token validation failed:", error);
      }
      return false;
    }
  }

  /**
   * Check if GraphQL endpoint is accessible
   */
  public async checkGraphQLHealth(): Promise<{
    url: string;
    status: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return {
        url: this.baseURL,
        status: response.ok ? "OK" : `Error: ${response.status}`,
      };
    } catch (error) {
      return {
        url: this.baseURL,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute GraphQL request with comprehensive error handling
   */
  public async request<T>(
    query: string,
    variables?: Record<string, unknown>,
    context?: any,
  ): Promise<T> {
    const url = `${this.baseURL}/graphql`;
    const headers = this.buildHeaders();
    const errorHandler = ErrorHandler.getInstance();

    if (this.isDebug) {
      console.log(`[GraphQL Request] POST ${url}`, {
        query: query.trim().split("\n")[0], // Show first line for brevity
        variables: variables || {},
      });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
      });

      if (this.isDebug) {
        console.log(`[GraphQL Response] ${response.status} ${url}`);
        console.log(
          `[GraphQL Response Headers]`,
          Object.fromEntries(response.headers.entries()),
        );
      }

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        const error = new GraphQLError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          [],
          response.status,
        );

        // Handle through centralized error system
        const centralizedError = errorHandler.handleError(error, {
          ...context,
          url,
          method: "POST",
          query: query.trim().split("\n")[0],
          variables,
        });

        // Show toast for user-facing errors
        if (centralizedError.category !== "BUSINESS_LOGIC_ERROR") {
          toastManager.showError(centralizedError, {
            showRetry: centralizedError.retryable,
            onRetry: () => this.request<T>(query, variables, context),
          });
        }

        throw error;
      }

      const json = await response.json();

      // Handle GraphQL errors
      if (json.errors?.length) {
        const primaryError = json.errors[0];
        const message = this.extractErrorMessage(primaryError);
        const error = new GraphQLError(message, json.errors, response.status);

        // Handle through centralized error system
        const centralizedError = errorHandler.handleError(error, {
          ...context,
          url,
          method: "POST",
          query: query.trim().split("\n")[0],
          variables,
          graphqlErrors: json.errors,
        });

        // Show toast for user-facing errors
        if (centralizedError.category !== "BUSINESS_LOGIC_ERROR") {
          toastManager.showError(centralizedError, {
            showRetry: centralizedError.retryable,
            onRetry: () => this.request<T>(query, variables, context),
          });
        }

        throw error;
      }

      // Return data with proper typing
      return json.data as T;
    } catch (error) {
      // Re-throw GraphQL errors (already handled above)
      if (error instanceof GraphQLError) {
        throw error;
      }

      // Handle network/parsing errors through centralized system
      const centralizedError = errorHandler.handleError(error, {
        ...context,
        url,
        method: "POST",
        query: query.trim().split("\n")[0],
        variables,
      });

      // Show toast for network errors
      toastManager.showError(centralizedError, {
        showRetry: centralizedError.retryable,
        onRetry: () => this.request<T>(query, variables, context),
      });

      // Debug: Log the error to understand its structure
      if (this.isDebug) {
        console.error("[GraphQL Debug] Network error structure:", {
          error,
          errorType: typeof error,
          isError: error instanceof Error,
          errorMessage: error instanceof Error ? error.message : "not an Error",
          errorString: String(error),
        });
      }

      // More defensive error message extraction
      let errorMessage: string;
      try {
        if (error instanceof Error && error.message) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (
          error &&
          typeof error === "object" &&
          Object.keys(error).length > 0
        ) {
          // Handle error objects with properties
          errorMessage = error.message || error.error || String(error);
        } else {
          // Handle empty objects, null, undefined, etc.
          errorMessage = "Network error occurred";
        }
      } catch (e) {
        errorMessage = "Network error occurred";
      }

      // Final fallback to ensure errorMessage is never undefined
      if (
        !errorMessage ||
        errorMessage === "undefined" ||
        errorMessage === "null" ||
        errorMessage === "[object Object]"
      ) {
        errorMessage = "Network error occurred";
      }

      const networkError = new GraphQLError(errorMessage, [], undefined);

      if (this.isDebug) {
        console.error(`[Network Error] ${url}`, networkError);
        console.error(`[Network Error Details]`, {
          url,
          message: errorMessage,
          error,
        });
      }

      throw networkError;
    }
  }

  /**
   * Build request headers with authentication
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Extract meaningful error message from GraphQL error
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === "string") return error;
    if (!error) return "Unknown GraphQL error";

    // Try common error message fields
    return (
      error.message ||
      error.extensions?.message ||
      error.extensions?.code ||
      "GraphQL operation failed"
    );
  }
}

// Export singleton instance
export const graphqlClient = new GraphQLClient();
export default graphqlClient;
