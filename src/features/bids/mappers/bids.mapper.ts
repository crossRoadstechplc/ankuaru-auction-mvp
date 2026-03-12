import { Auction, Bid, BidResponse, BidWithAuction } from "@/lib/types";
import {
  parseJsonScalar,
  toJsonArray,
  toJsonObject,
  toOptionalBoolean,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

function mapBidDto(value: unknown): Bid {
  const dto = toJsonObject(value) ?? {};

  return {
    id: toStringOr(dto.id),
    auctionId: toStringOr(dto.auctionId),
    bidderId: toStringOr(dto.bidderId),
    commitHash: toOptionalString(dto.commitHash),
    amount: toOptionalString(dto.amount),
    revealed: toOptionalBoolean(dto.revealed ?? dto.isRevealed),
    bidderUsername: toOptionalString(dto.bidderUsername),
    bidderEmail: toOptionalString(dto.bidderEmail),
    revealedAmount: toOptionalString(dto.revealedAmount),
    revealedAt: toOptionalString(dto.revealedAt),
    isValid: toOptionalBoolean(dto.isValid),
    invalidReason: toOptionalString(dto.invalidReason) ?? null,
    createdAt: toStringOr(dto.createdAt, new Date().toISOString()),
    updatedAt: toOptionalString(dto.updatedAt),
  };
}

export function mapAuctionBidsPayload(value: unknown): Bid[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);

  const list = envelope
    ? toJsonArray(envelope.auctionBids ?? envelope.bids ?? parsed)
    : toJsonArray(parsed);

  return list.map((entry) => mapBidDto(entry));
}

export function mapMyBidPayload(value: unknown): Bid | null {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const bidValue = envelope?.bid ?? envelope?.myBid ?? parsed;

  if (bidValue === null || bidValue === undefined) {
    return null;
  }

  const bidRecord = toJsonObject(bidValue);
  if (!bidRecord) {
    return null;
  }

  return mapBidDto(bidRecord);
}

export function mapMyBidsPayload(value: unknown): Bid[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);

  const list = envelope
    ? toJsonArray(envelope.myBids ?? envelope.bids ?? parsed)
    : toJsonArray(parsed);

  return list.map((entry) => mapBidDto(entry));
}

export function mapSubmitBidPayload(value: unknown): BidResponse {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const rawBid = envelope?.bid ?? parsed;
  const bid = mapBidDto(rawBid);

  return {
    bid,
    success: true,
    message: "Bid submitted successfully",
  } as BidResponse & { success: boolean };
}

function mapBidWithAuctionFallback(bid: Bid): BidWithAuction {
  return {
    id: bid.id,
    auctionId: bid.auctionId,
    bidderId: bid.bidderId,
    commitHash: bid.commitHash ?? "",
    revealedAmount: bid.revealedAmount ?? bid.amount ?? null,
    revealedAt: bid.revealedAt ?? null,
    isValid: bid.isValid ?? true,
    invalidReason: bid.invalidReason ?? null,
    createdAt: bid.createdAt,
    auction: {
      id: bid.auctionId,
      title: "Unknown Auction",
      status: "OPEN",
      visibility: "UNKNOWN",
      startAt: "",
      endAt: "",
      createdBy: "",
    },
  };
}

function toBidAuctionStatus(
  status: Auction["status"],
): BidWithAuction["auction"]["status"] {
  switch (status) {
    case "REVEAL":
      return "REVEAL";
    case "CLOSED":
      return "CLOSED";
    case "OPEN":
    case "SCHEDULED":
    default:
      return "OPEN";
  }
}

export function mapBidWithAuction(
  bid: Bid,
  auction: Auction | null,
): BidWithAuction {
  if (!auction) {
    return mapBidWithAuctionFallback(bid);
  }

  return {
    id: bid.id,
    auctionId: bid.auctionId,
    bidderId: bid.bidderId,
    commitHash: bid.commitHash ?? "",
    revealedAmount: bid.revealedAmount ?? bid.amount ?? null,
    revealedAt: bid.revealedAt ?? null,
    isValid: bid.isValid ?? true,
    invalidReason: bid.invalidReason ?? null,
    createdAt: bid.createdAt,
    auction: {
      id: auction.id,
      title: auction.title,
      status: toBidAuctionStatus(auction.status),
      visibility: auction.visibility,
      startAt: auction.startAt,
      endAt: auction.endAt,
      createdBy: auction.createdBy,
    },
  };
}
