const DEFAULT_GRAPHQL_BASE_URL = "https://gql.ankuaru.com";

export function getGraphqlBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    return DEFAULT_GRAPHQL_BASE_URL;
  }

  return configured.replace(/\/+$/, "");
}

