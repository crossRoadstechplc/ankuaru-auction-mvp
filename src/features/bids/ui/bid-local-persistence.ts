type BidDraft = {
  amount: string;
  nonce: string;
};

type BidPersistenceIdentity = {
  auctionId: string;
  userId: string;
};

const BID_DRAFT_PREFIX = "ui_bid_draft";
const BID_PLACED_PREFIX = "ui_bid_placed";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function buildStorageKey(
  prefix: string,
  identity: BidPersistenceIdentity,
): string {
  return `${prefix}:${identity.auctionId}:${identity.userId}`;
}

function readJson<T>(storageKey: string): T | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

function writeValue(storageKey: string, value: string): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.setItem(storageKey, value);
}

// Temporary UI persistence only. This data must never be used as the source of
// truth for bid domain state.
export function loadBidDraftFromUiStorage(
  identity: BidPersistenceIdentity,
): BidDraft | null {
  const key = buildStorageKey(BID_DRAFT_PREFIX, identity);
  const parsed = readJson<Partial<BidDraft>>(key);

  if (!parsed) {
    return null;
  }

  if (typeof parsed.amount !== "string" || typeof parsed.nonce !== "string") {
    return null;
  }

  return {
    amount: parsed.amount,
    nonce: parsed.nonce,
  };
}

export function saveBidDraftToUiStorage(
  identity: BidPersistenceIdentity,
  draft: BidDraft,
): void {
  const key = buildStorageKey(BID_DRAFT_PREFIX, identity);
  writeValue(key, JSON.stringify(draft));
}

export function loadPlacedBidFlagFromUiStorage(
  identity: BidPersistenceIdentity,
): boolean {
  const key = buildStorageKey(BID_PLACED_PREFIX, identity);
  if (!canUseBrowserStorage()) {
    return false;
  }

  return localStorage.getItem(key) === "true";
}

export function savePlacedBidFlagToUiStorage(
  identity: BidPersistenceIdentity,
  hasPlacedBid: boolean,
): void {
  const key = buildStorageKey(BID_PLACED_PREFIX, identity);
  writeValue(key, hasPlacedBid.toString());
}

