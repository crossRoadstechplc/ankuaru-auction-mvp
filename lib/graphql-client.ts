/**
 * Enhanced GraphQL Client for Ankuaru Auction Backend
 *
 * Features:
 * - TypeScript generics for type safety
 * - Comprehensive error handling
 * - Development logging
 * - Token management integration
 */

export class GraphQLError extends Error {
  public readonly errors: any[];
  public readonly status?: number;

  constructor(message: string, errors: any[] = [], status?: number) {
    super(message);
    this.name = "GraphQLError";
    this.errors = errors;
    this.status = status;

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
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://testauction.ankuaru.com";
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
  ): Promise<T> {
    const url = `${this.baseURL}/graphql`;
    const headers = this.buildHeaders();

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
        throw new GraphQLError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          [],
          response.status,
        );
      }

      const json = await response.json();

      // Handle GraphQL errors
      if (json.errors?.length) {
        const primaryError = json.errors[0];
        const message = this.extractErrorMessage(primaryError);
        throw new GraphQLError(message, json.errors, response.status);
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new GraphQLError(
          `HTTP ${response.status}: ${response.statusText}`,
          [],
          response.status,
        );
      }

      // Return data with proper typing
      return json.data as T;
    } catch (error) {
      // Re-throw GraphQL errors
      if (error instanceof GraphQLError) {
        if (this.isDebug) {
          console.error(`[GraphQL Error] ${error.message}`, error.errors);
        }
        throw error;
      }

      // Handle network/parsing errors
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
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
