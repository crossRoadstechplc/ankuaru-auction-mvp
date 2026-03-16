import { TransportError } from "../error/transport-errors";
import { resolveGraphqlEndpoint, resolveHealthEndpoint } from "./endpoint";

type GraphqlErrorPayload = {
  message?: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: GraphqlErrorPayload[];
};

type RequestContext = Record<string, unknown> | undefined;

export type GraphqlTransportRequest = {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  context?: RequestContext;
};

type GraphqlTransportOptions = {
  baseUrl: string;
  getAccessToken: () => string | null;
  onUnauthorized?: () => void;
  isDebug?: boolean;
};

function extractOperationName(query: string): string | undefined {
  const firstLine = query.trim().split("\n")[0] || "";
  const match = firstLine.match(/(query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[2];
}

function extractPrimaryMessage(errors: GraphqlErrorPayload[] | undefined): string {
  if (!errors || errors.length === 0) {
    return "GraphQL request failed";
  }

  const primary = errors[0];
  return (
    primary?.message ||
    (typeof primary?.extensions?.code === "string"
      ? primary.extensions.code
      : "GraphQL request failed")
  );
}

export class GraphQLTransport {
  private readonly graphqlEndpoint: string;
  private readonly healthEndpoint: string;
  private readonly getAccessToken: () => string | null;
  private readonly onUnauthorized?: () => void;
  private readonly isDebug: boolean;

  constructor(options: GraphqlTransportOptions) {
    this.graphqlEndpoint = resolveGraphqlEndpoint(options.baseUrl);
    this.healthEndpoint = resolveHealthEndpoint(options.baseUrl);
    this.getAccessToken = options.getAccessToken;
    this.onUnauthorized = options.onUnauthorized;
    this.isDebug = options.isDebug ?? false;
  }

  public async checkHealth(): Promise<{
    url: string;
    status: string;
    error?: string;
  }> {
    try {
      const response = await fetch(this.healthEndpoint);
      return {
        url: this.healthEndpoint,
        status: response.ok ? "OK" : `Error: ${response.status}`,
      };
    } catch (error) {
      return {
        url: this.healthEndpoint,
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public async request<TData>(
    request: GraphqlTransportRequest,
  ): Promise<TData> {
    const operationName =
      request.operationName || extractOperationName(request.query);
    const skipAuth = request.context?.skipAuth === true;

    if (this.isDebug) {
      console.log("[GraphQLTransport] Request", {
        endpoint: this.graphqlEndpoint,
        operationName,
        variables: request.variables || {},
        skipAuth,
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = skipAuth ? null : this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: request.query,
          variables: request.variables || {},
        }),
      });
    } catch (error) {
      throw TransportError.network("Failed to fetch GraphQL endpoint", {
        operationName,
        context: request.context,
        originalError:
          error instanceof Error ? error.message : "Unknown network error",
      });
    }

    let payload: GraphqlResponse<TData> | null = null;
    try {
      payload = (await response.json()) as GraphqlResponse<TData>;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.errors?.length
        ? extractPrimaryMessage(payload.errors)
        : `HTTP ${response.status}: ${response.statusText}`;

      const code = payload?.errors?.[0]?.extensions?.code;
      if (response.status === 401 || code === "UNAUTHENTICATED") {
        this.onUnauthorized?.();
        throw TransportError.authentication(message, response.status, {
          operationName,
          graphqlErrors: payload?.errors,
          context: request.context,
        });
      }

      if (response.status === 403) {
        throw TransportError.authorization(message, response.status, {
          operationName,
          graphqlErrors: payload?.errors,
          context: request.context,
        });
      }

      if (response.status >= 500) {
        throw TransportError.server(message, response.status, {
          operationName,
          graphqlErrors: payload?.errors,
          context: request.context,
        });
      }

      throw TransportError.validation(message, response.status, {
        operationName,
        graphqlErrors: payload?.errors,
        context: request.context,
      });
    }

    if (payload?.errors?.length) {
      const message = extractPrimaryMessage(payload.errors);
      const code = payload.errors[0]?.extensions?.code;

      if (code === "UNAUTHENTICATED") {
        this.onUnauthorized?.();
        throw TransportError.authentication(message, 401, {
          operationName,
          graphqlErrors: payload.errors,
          context: request.context,
        });
      }

      if (code === "FORBIDDEN" || code === "PERMISSION_DENIED") {
        throw TransportError.authorization(message, 403, {
          operationName,
          graphqlErrors: payload.errors,
          context: request.context,
        });
      }

      if (code === "GRAPHQL_VALIDATION_FAILED" || code === "BAD_USER_INPUT") {
        throw TransportError.validation(message, 400, {
          operationName,
          graphqlErrors: payload.errors,
          context: request.context,
        });
      }

      if (code === "NOT_FOUND") {
        throw TransportError.business(message, 404, {
          operationName,
          graphqlErrors: payload.errors,
          context: request.context,
        });
      }

      throw TransportError.unknown(message, {
        operationName,
        graphqlErrors: payload.errors,
        context: request.context,
      });
    }

    if (!payload || typeof payload !== "object" || !("data" in payload)) {
      throw TransportError.unknown("GraphQL response missing data field", {
        operationName,
        context: request.context,
      });
    }

    if (this.isDebug) {
      console.log("[GraphQLTransport] Response success", {
        operationName,
        endpoint: this.graphqlEndpoint,
      });
    }

    return payload.data as TData;
  }
}
