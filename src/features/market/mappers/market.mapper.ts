import { MarketListing } from "@/src/features/market/types/market.types";
import {
  parseJsonScalar,
  toJsonArray,
  toJsonObject,
  toOptionalNumber,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

function mapMarketListingDto(value: unknown, index: number): MarketListing {
  const dto = toJsonObject(value) ?? {};
  const code = toOptionalString(dto.code) ?? `LIST-${index + 1}`;

  return {
    code,
    name: toStringOr(dto.name, "Unknown commodity"),
    currency: toStringOr(dto.currency, "ETB"),
    price: toOptionalNumber(dto.price) ?? null,
    change: toOptionalNumber(dto.change) ?? null,
    changePercent: toOptionalNumber(dto.changePercent) ?? null,
    type: toStringOr(dto.type, "Commodity"),
  };
}

export function mapMarketListingsPayload(value: unknown): MarketListing[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const root = toJsonObject(envelope?.marketListings) ?? envelope;
  const list = toJsonArray(root?.listings ?? parsed);

  return list.map((entry, index) => mapMarketListingDto(entry, index));
}
