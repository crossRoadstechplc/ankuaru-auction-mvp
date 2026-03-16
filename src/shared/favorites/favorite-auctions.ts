"use client";

import { useMemo, useSyncExternalStore } from "react";

const FAVORITE_AUCTIONS_STORAGE_KEY = "ankuaru.favoriteAuctionIds";
const FAVORITE_AUCTIONS_EVENT = "ankuaru:favorites:changed";

function normalizeFavoriteAuctionIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    ),
  );
}

function serializeFavoriteAuctionIds(ids: string[]): string {
  return JSON.stringify(normalizeFavoriteAuctionIds(ids));
}

function readFavoriteAuctionIdsSnapshot(): string {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return window.localStorage.getItem(FAVORITE_AUCTIONS_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function emitFavoritesChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(FAVORITE_AUCTIONS_EVENT));
}

function writeFavoriteAuctionIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextSnapshot = serializeFavoriteAuctionIds(ids);
  const currentSnapshot = readFavoriteAuctionIdsSnapshot();

  if (nextSnapshot === currentSnapshot) {
    return;
  }

  window.localStorage.setItem(FAVORITE_AUCTIONS_STORAGE_KEY, nextSnapshot);
  emitFavoritesChanged();
}

function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITE_AUCTIONS_STORAGE_KEY) {
      listener();
    }
  };

  const handleFavoritesChanged = () => {
    listener();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FAVORITE_AUCTIONS_EVENT, handleFavoritesChanged);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FAVORITE_AUCTIONS_EVENT, handleFavoritesChanged);
  };
}

export function useFavoriteAuctions() {
  const favoriteAuctionIdsSnapshot = useSyncExternalStore(
    subscribe,
    readFavoriteAuctionIdsSnapshot,
    () => "[]",
  );
  const favoriteAuctionIds = useMemo(() => {
    try {
      return normalizeFavoriteAuctionIds(
        JSON.parse(favoriteAuctionIdsSnapshot),
      );
    } catch {
      return [];
    }
  }, [favoriteAuctionIdsSnapshot]);

  const favoriteAuctionIdSet = useMemo(
    () => new Set(favoriteAuctionIds),
    [favoriteAuctionIds],
  );

  const addFavoriteAuction = (auctionId: string) => {
    if (!auctionId) {
      return;
    }

    writeFavoriteAuctionIds([...favoriteAuctionIds, auctionId]);
  };

  const removeFavoriteAuction = (auctionId: string) => {
    if (!auctionId) {
      return;
    }

    writeFavoriteAuctionIds(
      favoriteAuctionIds.filter((favoriteId) => favoriteId !== auctionId),
    );
  };

  const toggleFavoriteAuction = (auctionId: string) => {
    if (!auctionId) {
      return;
    }

    if (favoriteAuctionIds.includes(auctionId)) {
      removeFavoriteAuction(auctionId);
      return;
    }

    addFavoriteAuction(auctionId);
  };

  return {
    favoriteAuctionIds,
    favoriteCount: favoriteAuctionIds.length,
    isFavoriteAuction: (auctionId: string) =>
      favoriteAuctionIdSet.has(auctionId),
    addFavoriteAuction,
    removeFavoriteAuction,
    toggleFavoriteAuction,
  };
}
