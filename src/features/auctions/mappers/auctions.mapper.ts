import {
  Auction,
  AuctionFormOptions,
  AuctionSelectOption,
  AuctionReport,
  AuctionReportTimelinePoint,
  AuctionReportTopBid,
  CloseAuctionResult,
} from "@/lib/types";
import {
  AuctionFormOptionsDto,
  CloseAuctionResultDto,
} from "@/src/features/auctions/dto/auctions.dto";
import {
  parseJsonScalar,
  toJsonArray,
  toJsonObject,
  toOptionalBoolean,
  toOptionalNumber,
  toOptionalString,
  toStringOr,
} from "@/src/platform/graphql/json-scalar";

function toOptionalValueString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

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

function mapAuctionFormOption(value: unknown): AuctionSelectOption | null {
  if (typeof value === "string" && value.length > 0) {
    return { value, label: value };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = String(value);
    return { value: normalized, label: normalized };
  }

  const dto = toJsonObject(value);
  if (!dto) {
    return null;
  }

  const normalizedValue = toStringOr(
    dto.value ?? dto.id ?? dto.name ?? dto.code,
  );
  const normalizedLabel = toStringOr(
    dto.label ?? dto.name ?? dto.value ?? dto.id,
    normalizedValue,
  );

  if (!normalizedValue) {
    return null;
  }

  return {
    value: normalizedValue,
    label: normalizedLabel || normalizedValue,
  };
}

function mapAuctionFormOptionList(value: unknown): AuctionSelectOption[] {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed);
  const list = toJsonArray(
    envelope?.options ?? envelope?.items ?? envelope?.values ?? parsed,
  );

  return list
    .map((entry) => mapAuctionFormOption(entry))
    .filter((entry): entry is AuctionSelectOption => entry !== null);
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
    productName: toOptionalValueString(
      dto.productName ?? dto.product_name,
    ),
    region: toOptionalValueString(dto.region),
    commodityType: toOptionalValueString(
      dto.commodityType ?? dto.commodity_type,
    ),
    grade: toOptionalValueString(dto.grade),
    process: toOptionalValueString(dto.process),
    transaction: toOptionalValueString(dto.transaction),
    commodityClass: toOptionalValueString(
      dto.commodityClass ?? dto.commodity_class,
    ),
    commoditySize: toOptionalValueString(
      dto.commoditySize ?? dto.commodity_size,
    ),
    commodityBrand: toOptionalValueString(
      dto.commodityBrand ?? dto.commodity_brand,
    ),
    quantity: toOptionalValueString(dto.quantity),
    quantityUnit: toOptionalValueString(
      dto.quantityUnit ?? dto.quantity_unit ?? dto.unit,
    ),
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
    currentBid: toOptionalString(dto.currentBid ?? dto.currentBidAmount),
    winnerId: toOptionalString(dto.winnerId),
    winningBid: toOptionalString(dto.winningBid),
    closedAt: toOptionalString(dto.closedAt),
    canBid: toOptionalBoolean(dto.canBid),
    hasRequestedBidAccess: toOptionalBoolean(dto.hasRequestedBidAccess),
    creator: mapAuctionCreator(createdBy, dto.creator),
    tag: toOptionalString(dto.tag),
    tagColor: toOptionalString(dto.tagColor),
    bid: toOptionalString(dto.bid),
    bids: toOptionalString(dto.bids),
    image: toOptionalString(
      dto.image ?? dto.auctionImageUrl ?? dto.auction_image_url,
    ),
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

export function mapAuctionFormOptionsPayload(
  value: unknown,
): AuctionFormOptions {
  const parsed = parseJsonScalar(value);
  const dto = (toJsonObject(parsed) ?? {}) as AuctionFormOptionsDto;
  const categoryOptions = toJsonObject(dto.categoryOptions);
  const productOptions = toJsonObject(dto.productOptions);
  const requiredFields = toJsonArray(
    productOptions?.requiredFields ?? dto.requiredFields,
  )
    .map((field) => toOptionalString(field))
    .filter((field): field is string => !!field);

  return {
    categories: mapAuctionFormOptionList(
      dto.categories ?? dto.auctionCategories,
    ),
    productNames: mapAuctionFormOptionList(
      dto.productNames ?? dto.products,
    ),
    regions: mapAuctionFormOptionList(
      productOptions?.regions ?? dto.regions,
    ),
    commodityTypes: mapAuctionFormOptionList(
      productOptions?.commodityTypes ??
        dto.commodityTypes ??
        dto.commodityTypeOptions,
    ),
    grades: mapAuctionFormOptionList(
      productOptions?.grades ?? dto.grades ?? dto.gradeOptions,
    ),
    processes: mapAuctionFormOptionList(
      productOptions?.processes ?? dto.processes,
    ),
    transactions: mapAuctionFormOptionList(
      productOptions?.transactions ?? dto.transactions,
    ),
    commodityClasses: mapAuctionFormOptionList(
      productOptions?.commodityClasses ?? dto.commodityClasses,
    ),
    commoditySizes: mapAuctionFormOptionList(
      productOptions?.commoditySizes ?? dto.commoditySizes,
    ),
    commodityBrands: mapAuctionFormOptionList(
      productOptions?.commodityBrands ?? dto.commodityBrands,
    ),
    quantityUnits: mapAuctionFormOptionList(
      productOptions?.quantityUnits ??
        categoryOptions?.quantityUnits ??
        dto.quantityUnits ??
        dto.quantityUnitOptions ??
        dto.units,
    ),
    requiredFields,
  };
}

export function mapCloseAuctionPayload(
  dto: CloseAuctionResultDto,
): CloseAuctionResult {
  const source = dto.auction ?? dto;

  return {
    auctionId: toStringOr(source.id),
    title: toStringOr(source.title),
    auctionCategory: toStringOr(source.auctionCategory),
    reservePrice: toStringOr(source.reservePrice),
    minBid: toStringOr(source.minBid),
    bidCount: toOptionalNumber(source.bidCount) ?? 0,
    winnerId: toOptionalString(source.winnerId),
    winningBid: toOptionalString(source.winningBid),
    closedAt: toOptionalString(source.closedAt),
  };
}

function toAuctionReportStatus(value: unknown): AuctionReport["auction"]["status"] {
  switch (toStringOr(value).toUpperCase()) {
    case "OPEN":
    case "REVEAL":
    case "CLOSED":
    case "SCHEDULED":
      return toStringOr(value).toUpperCase() as AuctionReport["auction"]["status"];
    default:
      return "CLOSED";
  }
}

function toOptionalBooleanLike(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
}

function mapAuctionReportBid(value: unknown): AuctionReportTopBid | null {
  const dto = toJsonObject(value);
  if (!dto) {
    return null;
  }

  const bidder = toJsonObject(dto.bidder);
  const bidderId = toStringOr(
    dto.bidderId ?? bidder?.id ?? dto.userId ?? dto.id,
  );

  if (!bidderId) {
    return null;
  }

  return {
    bidderId,
    bidderUsername: toOptionalString(
      dto.bidderUsername ?? bidder?.username ?? bidder?.fullName,
    ),
    bidderAvatar: toOptionalString(dto.bidderAvatar ?? bidder?.avatar),
    revealedAmount: toOptionalString(
      dto.revealedAmount ?? dto.amount ?? dto.bidAmount,
    ),
    revealedAt: toOptionalString(dto.revealedAt ?? dto.createdAt),
    isValid: toOptionalBooleanLike(dto.isValid),
    invalidReason: toOptionalString(dto.invalidReason),
  };
}

function mapAuctionReportTimelinePoint(
  value: unknown,
): AuctionReportTimelinePoint | null {
  const dto = toJsonObject(value);
  if (!dto) {
    return null;
  }

  const timestamp = toStringOr(dto.timestamp ?? dto.createdAt);
  if (!timestamp) {
    return null;
  }

  return {
    timestamp,
    bidCount: toOptionalNumber(dto.bidCount) ?? 0,
    averageAmount: toOptionalString(dto.averageAmount),
  };
}

export function mapAuctionReportPayload(value: unknown): AuctionReport {
  const parsed = parseJsonScalar(value);
  const envelope = toJsonObject(parsed) ?? {};
  const rawReport = toJsonObject(parseJsonScalar(envelope.report)) ?? envelope;
  const auctionValue = toJsonObject(parseJsonScalar(rawReport.auction)) ?? {};
  const winningBidValue = toJsonObject(parseJsonScalar(rawReport.winningBid));
  const winningBidBidder = toJsonObject(winningBidValue?.bidder);

  const topBidSource = toJsonArray(
    parseJsonScalar(rawReport.topBids ?? rawReport.bidHistory ?? rawReport.bids),
  );
  const topBids = topBidSource
    .map((entry) => mapAuctionReportBid(entry))
    .filter((entry): entry is AuctionReportTopBid => entry !== null)
    .sort((left, right) => {
      const rightAmount = Number(
        (right.revealedAmount ?? "0").replace(/,/g, "").trim(),
      );
      const leftAmount = Number(
        (left.revealedAmount ?? "0").replace(/,/g, "").trim(),
      );

      if (rightAmount !== leftAmount) {
        return rightAmount - leftAmount;
      }

      const rightTime = new Date(right.revealedAt ?? 0).getTime();
      const leftTime = new Date(left.revealedAt ?? 0).getTime();
      return rightTime - leftTime;
    });

  const countedValidBids = topBids.filter((bid) => bid.isValid !== false).length;
  const countedInvalidBids = topBids.filter((bid) => bid.isValid === false).length;
  const derivedHighestBid = topBids[0]?.revealedAmount;
  const derivedAverageBid =
    topBids.length > 0
      ? (
          topBids.reduce((sum, bid) => {
            const numeric = Number(
              (bid.revealedAmount ?? "0").replace(/,/g, "").trim(),
            );
            return Number.isFinite(numeric) ? sum + numeric : sum;
          }, 0) / topBids.length
        ).toString()
      : undefined;

  const timeline = toJsonArray(parseJsonScalar(rawReport.bidTimeline))
    .map((entry) => mapAuctionReportTimelinePoint(entry))
    .filter((entry): entry is AuctionReportTimelinePoint => entry !== null);

  const auctionId = toStringOr(
    auctionValue.id ?? rawReport.auctionId ?? envelope.auctionId,
  );
  const title = toStringOr(auctionValue.title ?? rawReport.title);
  const status = toAuctionReportStatus(
    auctionValue.status ?? rawReport.status ?? "CLOSED",
  );

  const winningBid =
    toOptionalString(
      auctionValue.winningBid ??
        winningBidValue?.amount ??
        winningBidValue?.revealedAmount ??
        rawReport.winningBid ??
        derivedHighestBid,
    ) ?? undefined;

  const winnerId =
    toOptionalString(
      auctionValue.winnerId ??
        winningBidValue?.bidderId ??
        winningBidBidder?.id,
    ) ?? undefined;

  return {
    auction: {
      id: auctionId,
      title,
      status,
      startAt: toStringOr(auctionValue.startAt ?? rawReport.startAt),
      endAt: toStringOr(auctionValue.endAt ?? rawReport.endAt),
      createdAt: toOptionalString(auctionValue.createdAt ?? rawReport.createdAt),
      closedAt: toOptionalString(auctionValue.closedAt ?? rawReport.closedAt),
      winnerId,
      winningBid,
    },
    totalBids: toOptionalNumber(rawReport.totalBids) ?? 0,
    revealedBids:
      toOptionalNumber(rawReport.revealedBids) ?? topBids.length,
    validBids:
      toOptionalNumber(rawReport.validBids) ?? countedValidBids,
    invalidBids:
      toOptionalNumber(rawReport.invalidBids) ?? countedInvalidBids,
    highestRevealedBid:
      toOptionalString(rawReport.highestRevealedBid) ??
      toOptionalString(derivedHighestBid) ??
      winningBid,
    averageRevealedBid:
      toOptionalString(rawReport.averageRevealedBid) ??
      toOptionalString(rawReport.averageBidAmount) ??
      derivedAverageBid,
    uniqueBidders: toOptionalNumber(rawReport.uniqueBidders),
    revenue: toOptionalString(rawReport.revenue),
    averageBidAmount: toOptionalString(rawReport.averageBidAmount),
    topBids,
    bidTimeline: timeline,
  };
}
