"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Auction } from "@/lib/types";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import {
  useMyFollowingQuery,
  useMyProfileQuery,
  useMySentFollowRequestsQuery,
} from "@/src/features/profile/queries/hooks";
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
const STATUS_SORT_ORDER = ["SCHEDULED", "OPEN", "REVEAL", "CLOSED"] as const;
const STATUS_SORT_PRIORITY: Record<(typeof STATUS_SORT_ORDER)[number], number> = {
  SCHEDULED: 0,
  OPEN: 1,
  REVEAL: 2,
  CLOSED: 3,
};
const QUANTITY_RANGE_DEFINITIONS = [
  { id: "under-100", label: "Under 100" },
  { id: "100-499", label: "100 - 499" },
  { id: "500-999", label: "500 - 999" },
  { id: "1000-plus", label: "1000+" },
] as const;

type QuantityRangeId = (typeof QUANTITY_RANGE_DEFINITIONS)[number]["id"];

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

  const leftTime =
    left.status === "CLOSED"
      ? new Date(left.endAt || left.createdAt || 0).getTime()
      : new Date(left.endAt || left.createdAt || 0).getTime();
  const rightTime =
    right.status === "CLOSED"
      ? new Date(right.endAt || right.createdAt || 0).getTime()
      : new Date(right.endAt || right.createdAt || 0).getTime();

  if (left.status === "CLOSED" && right.status === "CLOSED") {
    return rightTime - leftTime;
  }

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
}

function toggleSelection(current: string[], nextValue: string): string[] {
  return current.includes(nextValue)
    ? current.filter((entry) => entry !== nextValue)
    : [...current, nextValue];
}

export default function FeedPage() {
  const router = useRouter();
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_PAGE_SIZE);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedQuantityRanges, setSelectedQuantityRanges] = useState<string[]>(
    [],
  );
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
      .filter((request) => request.status === "PENDING")
      .map((request) => request.target.id)
      .filter((requestUserId) => !!requestUserId);
  }, [sentFollowRequests, userId]);

  const searchMatchingAuctions = useMemo(() => {
    if (!Array.isArray(auctions)) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...(auctions as Auction[])]
      .filter((auction) => {
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
  const filteredAndSortedAuctions = useMemo(() => {
    return [...searchMatchingAuctions]
      .filter((auction) => {
        const categoryLabel = auction.auctionCategory?.trim() || "Uncategorized";
        const quantityRange = getQuantityRangeId(auction.quantity);

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

        return true;
      })
      .sort(sortAuctionsForBoard);
  }, [
    searchMatchingAuctions,
    selectedCategories,
    selectedQuantityRanges,
    selectedStatuses,
  ]);
  const filteredAuctions = filteredAndSortedAuctions.slice(0, displayLimit);
  const activeFilterCount =
    selectedCategories.length +
    selectedStatuses.length +
    selectedQuantityRanges.length;

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
        <PageSection className="gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <div className="space-y-6">
            <FeedComposerBar
              searchTerm={searchTerm}
              displayName={myProfile?.fullName}
              username={myProfile?.username}
              avatarUrl={myProfile?.avatar || myProfile?.profileImageUrl}
              isAuthenticated={isAuthenticated}
              resultCount={filteredAndSortedAuctions.length}
              isLoading={isLoading}
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
            />
          </div>

          <aside className="xl:sticky xl:top-24">
            <FeedFilterSidebar
              totalCount={searchMatchingAuctions.length}
              resultCount={filteredAndSortedAuctions.length}
              activeFilterCount={activeFilterCount}
              categories={categoryOptions}
              statuses={statusOptions}
              quantityRanges={quantityRangeOptions}
              selectedCategories={selectedCategories}
              selectedStatuses={selectedStatuses}
              selectedQuantityRanges={selectedQuantityRanges}
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
              onClearAll={() => {
                setDisplayLimit(DISPLAY_PAGE_SIZE);
                setSelectedCategories([]);
                setSelectedStatuses([]);
                setSelectedQuantityRanges([]);
              }}
            />
          </aside>
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
