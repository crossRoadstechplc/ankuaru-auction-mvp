const GRAPHQL_SUFFIX = "/graphql";
const HEALTH_SUFFIX = "/health";

function normalizeBase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/\/+$/, "");
}

export function resolveGraphqlEndpoint(baseOrEndpoint: string): string {
  const normalized = normalizeBase(baseOrEndpoint);
  if (!normalized) {
    return GRAPHQL_SUFFIX;
  }

  if (normalized.endsWith(GRAPHQL_SUFFIX)) {
    return normalized;
  }

  return `${normalized}${GRAPHQL_SUFFIX}`;
}

export function resolveHealthEndpoint(baseOrEndpoint: string): string {
  const graphqlEndpoint = resolveGraphqlEndpoint(baseOrEndpoint);
  if (graphqlEndpoint.endsWith(GRAPHQL_SUFFIX)) {
    return `${graphqlEndpoint.slice(0, -GRAPHQL_SUFFIX.length)}${HEALTH_SUFFIX}`;
  }

  return `${graphqlEndpoint}${HEALTH_SUFFIX}`;
}

