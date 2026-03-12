import { Auction } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonArray,
  toJsonObject,
  toOptionalNumber,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

function toAuctionStatus(value: unknown): Auction["status"] {
  switch (toStringOr(value)) {
    case "OPEN":
    case "REVEAL":
    case "CLOSED":
    case "SCHEDULED":
      return value as Auction["status"];
    default:
      return "SCHEDULED";
  }
}

function toAuctionType(value: unknown): Auction["auctionType"] {
  return toStringOr(value) === "BUY" ? "BUY" : "SELL";
}

function toAuctionVisibility(value: unknown): Auction["visibility"] {
  switch (toStringOr(value)) {
    case "FOLLOWERS":
    case "SELECTED":
      return value as Auction["visibility"];
    default:
      return "PUBLIC";
  }
}

function mapAuctionCreator(
  createdBy: string,
  creatorValue: unknown,
): Auction["creator"] {
  const creator = toJsonObject(creatorValue);
  if (creator) {
    return {
      id: toStringOr(creator.id, createdBy),
      username: toStringOr(creator.username, `User ${createdBy.slice(0, 8)}...`),
      fullName: toOptionalString(creator.fullName),
      avatar: toOptionalString(creator.avatar),
    };
  }

  if (!createdBy) {
    return undefined;
  }

  return {
    id: createdBy,
    username: `User ${createdBy.slice(0, 8)}...`,
    fullName: undefined,
    avatar: undefined,
  };
}

export function mapAuctionDto(value: unknown): Auction {
  const dto = toJsonObject(value) ?? {};
  const createdBy = toStringOr(
    dto.createdBy ?? dto.creatorId ?? dto.userId,
  );
  const createdAt = toStringOr(dto.createdAt, new Date().toISOString());

  return {
    id: toStringOr(dto.id),
    title: toStringOr(dto.title),
    auctionCategory: toStringOr(dto.auctionCategory),
    itemDescription: toStringOr(dto.itemDescription),
    reservePrice: toStringOr(dto.reservePrice),
    minBid: toStringOr(dto.minBid),
    auctionType: toAuctionType(dto.auctionType),
    visibility: toAuctionVisibility(dto.visibility),
    startAt: toStringOr(dto.startAt),
    endAt: toStringOr(dto.endAt),
    status: toAuctionStatus(dto.status),
    createdBy,
    createdAt,
    bidCount: toOptionalNumber(dto.bidCount),
    currentBid: toOptionalString(dto.currentBid),
    winnerId: toOptionalString(dto.winnerId),
    winningBid: toOptionalString(dto.winningBid),
    closedAt: toOptionalString(dto.closedAt),
    creator: mapAuctionCreator(createdBy, dto.creator),
    tag: toOptionalString(dto.tag),
    tagColor: toOptionalString(dto.tagColor),
    bid: toOptionalString(dto.bid),
    bids: toOptionalString(dto.bids),
    image: toOptionalString(dto.image),
    details: toOptionalString(dto.details),
  };
}

export function mapAuctionsPayload(value: unknown): Auction[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);

  const list = envelope
    ? toJsonArray(envelope.auctions ?? envelope.data ?? parsed)
    : toJsonArray(parsed);

  return list.map((entry) => mapAuctionDto(entry));
}

export function mapAuctionPayload(value: unknown): Auction {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const rawAuction = envelope?.auction ?? envelope?.data ?? parsed;
  return mapAuctionDto(rawAuction);
}
