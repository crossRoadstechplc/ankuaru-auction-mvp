import {
  Auction,
  Bid,
  BidAccessRequest,
  BidResponse,
  BidWithAuction,
} from "@/lib/types";
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
  const normalizedAmount = toOptionalString(dto.amount ?? dto.revealedAmount);
  const revealedAt = toOptionalString(dto.revealedAt);
  const revealedAmount = toOptionalString(dto.revealedAmount ?? dto.amount);
  const revealedFlag = toOptionalBoolean(dto.revealed ?? dto.isRevealed);

  return {
    id: toStringOr(dto.id),
    auctionId: toStringOr(dto.auctionId),
    bidderId: toStringOr(dto.bidderId),
    commitHash: toOptionalString(dto.commitHash),
    amount: normalizedAmount,
    revealed:
      revealedFlag ??
      (revealedAmount !== undefined || revealedAt !== undefined
        ? true
        : undefined),
    bidderUsername: toOptionalString(dto.bidderUsername),
    bidderEmail: toOptionalString(dto.bidderEmail),
    revealedAmount,
    revealedAt,
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

function mapBidAccessRequestUser(
  userValue: unknown,
  fallback: {
    id?: unknown;
    username?: unknown;
    fullName?: unknown;
    avatar?: unknown;
  },
): BidAccessRequest["requester"] {
  const dto = toJsonObject(userValue) ?? {};
  const id = toStringOr(dto.id ?? fallback.id);
  const username =
    toOptionalString(dto.username ?? fallback.username) ??
    (id ? `User ${id.slice(0, 8)}...` : "Unknown requester");

  return {
    id,
    username,
    fullName: toOptionalString(dto.fullName ?? fallback.fullName),
    avatar: toOptionalString(dto.avatar ?? fallback.avatar),
  };
}

function mapBidAccessRequestDto(value: unknown): BidAccessRequest {
  const raw = toJsonObject(value) ?? {};
  const auction = toJsonObject(raw.auction);
  const requester =
    raw.requester ?? raw.requesterUser ?? raw.bidder ?? raw.bidderUser ?? raw.user;

  return {
    id: toStringOr(raw.id),
    auctionId: toStringOr(raw.auctionId ?? raw.auction_id ?? auction?.id),
    auctionTitle: toOptionalString(raw.auctionTitle ?? auction?.title),
    status: toStringOr(raw.status, "PENDING"),
    createdAt: toStringOr(raw.createdAt, new Date().toISOString()),
    requester: mapBidAccessRequestUser(requester, {
      id: raw.requesterId ?? raw.bidderId ?? raw.userId,
      username: raw.requesterUsername ?? raw.bidderUsername ?? raw.username,
      fullName: raw.requesterFullName ?? raw.bidderFullName ?? raw.fullName,
      avatar: raw.requesterAvatar ?? raw.bidderAvatar ?? raw.avatar,
    }),
  };
}

export function mapBidAccessRequestsPayload(value: unknown): BidAccessRequest[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);

  const list = envelope
    ? toJsonArray(
        envelope.bidRequests ??
          envelope.myBidRequests ??
          envelope.auctionBidRequests ??
          envelope.requests ??
          parsed,
      )
    : toJsonArray(parsed);

  return list.map((entry) => mapBidAccessRequestDto(entry));
}

export function mapBidRequestMutationPayload(value: unknown): boolean {
  const parsed = parseJsonScalar(value);

  if (typeof parsed === "boolean") {
    return parsed;
  }

  if (typeof parsed === "string") {
    return parsed.trim().length > 0;
  }

  return parsed !== null && parsed !== undefined;
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
