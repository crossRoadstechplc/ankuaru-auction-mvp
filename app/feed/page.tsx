"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { getLowestTierPrice } from "@/lib/format";
import type { Auction } from "@/lib/types";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import {
  useMyFollowingQuery,
  useMyProfileQuery,
  useMySentFollowRequestsQuery,
} from "@/src/features/profile/queries/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { FeedAuctionGrid } from "./components/FeedAuctionGrid";
import { FeedComposerBar } from "./components/FeedComposerBar";
import {
  FeedFilterOption,
  FeedFilterSidebar,
} from "./components/FeedFilterSidebar";
import PublicUserProfileModal from "../profile/components/PublicUserProfileModal";
import ProfileImageModal from "../profile/components/ProfileImageModal";

const DISPLAY_PAGE_SIZE = 6;
const CLOSED_HIDE_AFTER_DAYS = 10;
const STATUS_SORT_ORDER = ["OPEN", "SCHEDULED", "REVEAL", "CLOSED"] as const;
const STATUS_SORT_PRIORITY: Record<(typeof STATUS_SORT_ORDER)[number], number> = {
  OPEN: 0,
  SCHEDULED: 1,
  REVEAL: 2,
  CLOSED: 3,
};
const QUANTITY_RANGE_DEFINITIONS = [
  { id: "under-100", label: "Under 100" },
  { id: "100-499", label: "100 - 499" },
  { id: "500-999", label: "500 - 999" },
  { id: "1000-plus", label: "1000+" },
] as const;

const PRICE_RANGE_DEFINITIONS = [
  { id: "under-100", label: "Under 100 ETB" },
  { id: "100-500", label: "100 - 500 ETB" },
  { id: "500-1000", label: "500 - 1000 ETB" },
  { id: "1000-plus", label: "1000+ ETB" },
] as const;

const LOT_TYPE_DEFINITIONS = [
  { id: "SEALED", label: "Sealed" },
  { id: "FLEXIBLE", label: "Flexible" },
] as const;

type QuantityRangeId = (typeof QUANTITY_RANGE_DEFINITIONS)[number]["id"];
type PriceRangeId = (typeof PRICE_RANGE_DEFINITIONS)[number]["id"];

function parseQuantityValue(quantity?: string): number | null {
  if (!quantity) {
    return null;
  }

  const parsed = Number(quantity.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getQuantityRangeId(quantity?: string): QuantityRangeId | null {
  const normalizedQuantity = parseQuantityValue(quantity);

  if (normalizedQuantity === null) {
    return null;
  }

  if (normalizedQuantity < 100) {
    return "under-100";
  }

  if (normalizedQuantity < 500) {
    return "100-499";
  }

  if (normalizedQuantity < 1000) {
    return "500-999";
  }

  return "1000-plus";
}

function parseMinBidValue(minBid?: string): number | null {
  if (!minBid) {
    return null;
  }

  const parsed = Number(String(minBid).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getPriceRangeId(priceValue?: string): PriceRangeId | null {
  const value = parseMinBidValue(priceValue);

  if (value === null) {
    return null;
  }

  if (value < 100) {
    return "under-100";
  }

  if (value < 500) {
    return "100-500";
  }

  if (value < 1000) {
    return "500-1000";
  }

  return "1000-plus";
}

/** Price for filter: lowest tier when priceTiers exist, else minBid */
function getAuctionPriceForFilter(auction: Auction): string | undefined {
  const tierPrice = getLowestTierPrice(auction.priceTiers);
  return tierPrice ?? auction.minBid;
}

/** FLEXIBLE when explicitly set; otherwise treat as sealed (includes legacy listings without lotType). */
function getLotTypeFilterId(auction: Auction): "SEALED" | "FLEXIBLE" {
  return auction.lotType === "FLEXIBLE" ? "FLEXIBLE" : "SEALED";
}

function buildFilterOptions(
  entries: Array<{ id: string; label: string }>,
): FeedFilterOption[] {
  return entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    count: 0,
  }));
}

function sortAuctionsForBoard(left: Auction, right: Auction): number {
  const leftPriority =
    STATUS_SORT_PRIORITY[left.status as keyof typeof STATUS_SORT_PRIORITY] ?? 99;
  const rightPriority =
    STATUS_SORT_PRIORITY[right.status as keyof typeof STATUS_SORT_PRIORITY] ?? 99;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  return (
    new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  );
}

function toggleSelection(current: string[], nextValue: string): string[] {
  return current.includes(nextValue)
    ? current.filter((entry) => entry !== nextValue)
    : [...current, nextValue];
}

export default function FeedPage() {
  const router = useRouter();
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_PAGE_SIZE);
  const [isFilterSidebarVisible, setIsFilterSidebarVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedQuantityRanges, setSelectedQuantityRanges] = useState<string[]>(
    [],
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedLotTypes, setSelectedLotTypes] = useState<string[]>([]);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(
    null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<{
    imageUrl?: string | null;
    displayName: string;
    username?: string | null;
  } | null>(null);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q")?.trim() ?? "";

  // React Query hook for fetching auctions
  const { data: auctions = [], isLoading, error } = useAuctionsQuery();
  const { data: myProfile } = useMyProfileQuery();
  const { data: following = [] } = useMyFollowingQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();
  const followingIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    return following.map((user) => user.id);
  }, [following, userId]);
  const requestedIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    return sentFollowRequests
      .filter(
        (request) =>
          String(request.status || "").toUpperCase() === "PENDING",
      )
      .map((request) => {
        const requestedUserId =
          request.requester?.id === userId
            ? request.target?.id
            : request.target?.id || request.requester?.id;
        return requestedUserId;
      })
      .filter((requestUserId): requestUserId is string => !!requestUserId);
  }, [sentFollowRequests, userId]);

  const searchMatchingAuctions = useMemo(() => {
    if (!Array.isArray(auctions)) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...(auctions as Auction[])]
      .filter((auction) => {
        if (auction.status === "CLOSED") {
          const closedAt = auction.endAt || auction.createdAt || "";
          const closedTime = new Date(closedAt).getTime();
          const cutoffTime = Date.now() - CLOSED_HIDE_AFTER_DAYS * 24 * 60 * 60 * 1000;
          if (closedTime < cutoffTime) {
            return false;
          }
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          auction.title.toLowerCase().includes(normalizedSearch) ||
          auction.itemDescription.toLowerCase().includes(normalizedSearch) ||
          auction.auctionCategory.toLowerCase().includes(normalizedSearch) ||
          (auction.productName || "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (auction.quantity || "").toLowerCase().includes(normalizedSearch) ||
          (auction.quantityUnit || "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (auction.commodityType || "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (auction.region || "").toLowerCase().includes(normalizedSearch) ||
          (auction.status || "").toLowerCase().includes(normalizedSearch) ||
          (auction.creator?.fullName || "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (auction.creator?.username || "")
            .toLowerCase()
            .includes(normalizedSearch)
        );
      });
  }, [auctions, searchTerm]);
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const label = auction.auctionCategory?.trim() || "Uncategorized";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        id: label,
        label,
        count,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [searchMatchingAuctions]);
  const statusOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const status = auction.status || "UNKNOWN";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });

    return buildFilterOptions(
      STATUS_SORT_ORDER.map((status) => ({
        id: status,
        label: status.charAt(0) + status.slice(1).toLowerCase(),
      })),
    ).map((option) => ({
      ...option,
      count: counts.get(option.id) ?? 0,
    }));
  }, [searchMatchingAuctions]);
  const quantityRangeOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const quantityRange = getQuantityRangeId(auction.quantity);

      if (!quantityRange) {
        return;
      }

      counts.set(quantityRange, (counts.get(quantityRange) ?? 0) + 1);
    });

    return QUANTITY_RANGE_DEFINITIONS.map((range) => ({
      id: range.id,
      label: range.label,
      count: counts.get(range.id) ?? 0,
    }));
  }, [searchMatchingAuctions]);
  const priceRangeOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const priceRange = getPriceRangeId(getAuctionPriceForFilter(auction));

      if (!priceRange) {
        return;
      }

      counts.set(priceRange, (counts.get(priceRange) ?? 0) + 1);
    });

    return PRICE_RANGE_DEFINITIONS.map((range) => ({
      id: range.id,
      label: range.label,
      count: counts.get(range.id) ?? 0,
    }));
  }, [searchMatchingAuctions]);
  const originOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const label = (auction.region || "").trim() || "Unspecified";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        id: label,
        label,
        count,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [searchMatchingAuctions]);
  const lotTypeOptions = useMemo(() => {
    const counts = new Map<string, number>();

    searchMatchingAuctions.forEach((auction) => {
      const lotTypeId = getLotTypeFilterId(auction);
      counts.set(lotTypeId, (counts.get(lotTypeId) ?? 0) + 1);
    });

    return LOT_TYPE_DEFINITIONS.map((entry) => ({
      id: entry.id,
      label: entry.label,
      count: counts.get(entry.id) ?? 0,
    }));
  }, [searchMatchingAuctions]);
  const filteredAndSortedAuctions = useMemo(() => {
    return [...searchMatchingAuctions]
      .filter((auction) => {
        const categoryLabel = auction.auctionCategory?.trim() || "Uncategorized";
        const quantityRange = getQuantityRangeId(auction.quantity);
        const priceRange = getPriceRangeId(getAuctionPriceForFilter(auction));
        const originLabel = (auction.region || "").trim() || "Unspecified";

        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(categoryLabel)
        ) {
          return false;
        }

        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(auction.status)
        ) {
          return false;
        }

        if (
          selectedQuantityRanges.length > 0 &&
          (!quantityRange || !selectedQuantityRanges.includes(quantityRange))
        ) {
          return false;
        }

        if (
          selectedPriceRanges.length > 0 &&
          (!priceRange || !selectedPriceRanges.includes(priceRange))
        ) {
          return false;
        }

        if (
          selectedOrigins.length > 0 &&
          !selectedOrigins.includes(originLabel)
        ) {
          return false;
        }

        if (
          selectedLotTypes.length > 0 &&
          !selectedLotTypes.includes(getLotTypeFilterId(auction))
        ) {
          return false;
        }

        return true;
      })
      .sort(sortAuctionsForBoard);
  }, [
    searchMatchingAuctions,
    selectedCategories,
    selectedQuantityRanges,
    selectedStatuses,
    selectedPriceRanges,
    selectedOrigins,
    selectedLotTypes,
  ]);
  const filteredAuctions = filteredAndSortedAuctions.slice(0, displayLimit);
  const activeFilterCount =
    selectedCategories.length +
    selectedStatuses.length +
    selectedQuantityRanges.length +
    selectedPriceRanges.length +
    selectedOrigins.length +
    selectedLotTypes.length;

  // Check if there are more auctions to load
  const hasMore = filteredAndSortedAuctions.length > filteredAuctions.length;

  // Handle load more
  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + DISPLAY_PAGE_SIZE);
  };

  const handleOpenCreatorProfile = (creatorId: string) => {
    if (!creatorId) {
      return;
    }

    if (userId && creatorId === userId) {
      router.push("/profile");
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setSelectedProfileUserId(creatorId);
    setIsProfileModalOpen(true);
  };

  const handleOpenCreatorProfileImage = (payload: {
    imageUrl?: string | null;
    displayName: string;
    username?: string | null;
  }) => {
    setSelectedProfileImage(payload);
    setIsProfileImageModalOpen(true);
  };

  return (
    <PageShell>
      <Header />
      <PageContainer className="max-w-[1480px]">
        <PageSection className={`gap-4 xl:grid xl:items-start xl:gap-6 ${isFilterSidebarVisible ? "xl:grid-cols-[minmax(0,1fr)_minmax(280px,30%)]" : "xl:grid-cols-[minmax(0,1fr)_auto]"}`}>
          <div className="min-w-0 space-y-4">
            <FeedComposerBar
              searchTerm={searchTerm}
              displayName={myProfile?.fullName}
              username={myProfile?.username}
              avatarUrl={myProfile?.avatar || myProfile?.profileImageUrl}
              isAuthenticated={isAuthenticated}
              resultCount={filteredAndSortedAuctions.length}
              isLoading={isLoading}
              onToggleFilters={() =>
                setIsFilterSidebarVisible((open) => !open)
              }
              filtersOpen={isFilterSidebarVisible}
              activeFilterCount={activeFilterCount}
            />

            <FeedAuctionGrid
              auctions={filteredAuctions}
              isLoading={isLoading}
              error={
                error
                  ? typeof error === "string"
                    ? error
                    : "Failed to load auctions"
                  : null
              }
              followingIds={followingIds}
              requestedIds={requestedIds}
              onOpenCreatorProfile={handleOpenCreatorProfile}
              onOpenCreatorProfileImage={handleOpenCreatorProfileImage}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              totalMatchingCount={filteredAndSortedAuctions.length}
            />
          </div>

          {isFilterSidebarVisible ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] xl:hidden"
                aria-label="Close filters"
                onClick={() => setIsFilterSidebarVisible(false)}
              />
              <aside
                className={cn(
                  "z-50 flex w-full max-w-[min(100vw,400px)] flex-col",
                  "max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:h-[100dvh] max-xl:min-h-0 max-xl:overflow-hidden max-xl:shadow-2xl",
                  "xl:sticky xl:top-24 xl:z-auto xl:max-h-[calc(100vh-6rem)] xl:w-full xl:max-w-none xl:min-h-0 xl:self-start xl:overflow-hidden xl:shadow-none",
                )}
              >
                <FeedFilterSidebar
                  totalCount={searchMatchingAuctions.length}
                  resultCount={filteredAndSortedAuctions.length}
                  activeFilterCount={activeFilterCount}
                  onCollapse={() => setIsFilterSidebarVisible(false)}
                  categories={categoryOptions}
                  statuses={statusOptions}
                  quantityRanges={quantityRangeOptions}
                  priceRanges={priceRangeOptions}
                  origins={originOptions}
                  lotTypes={lotTypeOptions}
                  selectedCategories={selectedCategories}
                  selectedStatuses={selectedStatuses}
                  selectedQuantityRanges={selectedQuantityRanges}
                  selectedPriceRanges={selectedPriceRanges}
                  selectedOrigins={selectedOrigins}
                  selectedLotTypes={selectedLotTypes}
                  onToggleCategory={(categoryId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedCategories((current) =>
                      toggleSelection(current, categoryId),
                    );
                  }}
                  onToggleStatus={(statusId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedStatuses((current) =>
                      toggleSelection(current, statusId),
                    );
                  }}
                  onToggleQuantityRange={(quantityRangeId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedQuantityRanges((current) =>
                      toggleSelection(current, quantityRangeId),
                    );
                  }}
                  onTogglePriceRange={(priceRangeId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedPriceRanges((current) =>
                      toggleSelection(current, priceRangeId),
                    );
                  }}
                  onToggleOrigin={(originId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedOrigins((current) =>
                      toggleSelection(current, originId),
                    );
                  }}
                  onToggleLotType={(lotTypeId) => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedLotTypes((current) =>
                      toggleSelection(current, lotTypeId),
                    );
                  }}
                  onClearAll={() => {
                    setDisplayLimit(DISPLAY_PAGE_SIZE);
                    setSelectedCategories([]);
                    setSelectedStatuses([]);
                    setSelectedQuantityRanges([]);
                    setSelectedPriceRanges([]);
                    setSelectedOrigins([]);
                    setSelectedLotTypes([]);
                  }}
                />
              </aside>
            </>
          ) : (
            <aside className="hidden shrink-0 xl:sticky xl:top-24 xl:block xl:self-start">
              <button
                type="button"
                onClick={() => setIsFilterSidebarVisible(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Show filters"
              >
                <Image
                  src="/filter.png"
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] object-contain"
                  aria-hidden
                />
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-slate-950">
                    {activeFilterCount > 99 ? "99+" : activeFilterCount}
                  </span>
                ) : null}
              </button>
            </aside>
          )}
        </PageSection>
      </PageContainer>
      <PublicUserProfileModal
        userId={selectedProfileUserId}
        open={isProfileModalOpen}
        onOpenChange={(open) => {
          setIsProfileModalOpen(open);
          if (!open) {
            setSelectedProfileUserId(null);
          }
        }}
      />
      <ProfileImageModal
        open={isProfileImageModalOpen}
        onOpenChange={(open) => {
          setIsProfileImageModalOpen(open);
          if (!open) {
            setSelectedProfileImage(null);
          }
        }}
        imageUrl={selectedProfileImage?.imageUrl}
        displayName={selectedProfileImage?.displayName}
        username={selectedProfileImage?.username}
      />
      <Footer />
    </PageShell>
  );
}
