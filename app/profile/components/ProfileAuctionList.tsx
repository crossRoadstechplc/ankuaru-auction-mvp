"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedPostCard } from "@/app/feed/components/post/FeedPostCard";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import type { Auction } from "@/lib/types";
import { getImageWithFallback } from "@/lib/imageUtils";
import { ProfilePagination } from "./ProfilePagination";

type AuctionStatusFilter = "ALL" | Auction["status"];

const AUCTION_PAGE_SIZE = 4;

const AUCTION_STATUS_FILTERS: Array<{
  value: AuctionStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "REVEAL", label: "Reveal" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "CLOSED", label: "Closed" },
];

interface ProfileAuctionListProps {
  auctions: Auction[];
  isLoadingAuctions: boolean;
  emptyTitle: string;
  emptyDescription: string;
  getImageWithFallback?: (image?: string) => string;
}

export function ProfileAuctionList({
  auctions,
  isLoadingAuctions,
  emptyTitle,
  emptyDescription,
  getImageWithFallback: getImageFn,
}: ProfileAuctionListProps) {
  const getImage = getImageFn ?? getImageWithFallback;
  const [selectedStatus, setSelectedStatus] =
    useState<AuctionStatusFilter>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () =>
      [...new Set(auctions.map((auction) => auction.auctionCategory?.trim()).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right)),
    [auctions],
  );

  const filteredAuctions = useMemo(
    () =>
      auctions.filter((auction) => {
        const matchesStatus =
          selectedStatus === "ALL" || auction.status === selectedStatus;
        const matchesCategory =
          selectedCategory === "ALL" ||
          auction.auctionCategory === selectedCategory;

        return matchesStatus && matchesCategory;
      }),
    [auctions, selectedCategory, selectedStatus],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAuctions.length / AUCTION_PAGE_SIZE),
  );
  const activePage = Math.min(currentPage, totalPages);

  const paginatedAuctions = useMemo(() => {
    const startIndex = (activePage - 1) * AUCTION_PAGE_SIZE;
    return filteredAuctions.slice(startIndex, startIndex + AUCTION_PAGE_SIZE);
  }, [activePage, filteredAuctions]);

  const hasActiveFilters =
    selectedStatus !== "ALL" || selectedCategory !== "ALL";

  const clearFilters = () => {
    setSelectedStatus("ALL");
    setSelectedCategory("ALL");
    setCurrentPage(1);
  };

  if (isLoadingAuctions) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingState type="card" count={6} />
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="p-8 sm:p-12">
        <EmptyState
          iconName="photo_library"
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Posted Auctions ({auctions.length})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredAuctions.length === auctions.length
                  ? "Browse posted auctions."
                  : `Showing ${filteredAuctions.length} of ${auctions.length} auctions.`}
              </p>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 w-fit rounded-lg px-2 text-xs"
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {AUCTION_STATUS_FILTERS.map((filter) => {
                const isActive = selectedStatus === filter.value;

                return (
                  <Button
                    key={filter.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="xs"
                    onClick={() => {
                      setSelectedStatus(filter.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-full px-3"
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Category</span>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 min-w-[170px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-500"
                >
                  <option value="ALL">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-base text-slate-400">
                  expand_more
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="rounded-xl border border-slate-200/70 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
          <EmptyState
            iconName="filter_alt_off"
            title="No matching auctions"
            description="Try a different status or category filter."
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedAuctions.map((auction) => (
              <FeedPostCard
                key={auction.id}
                auction={auction}
                getImageWithFallback={getImage}
                followStateInline={true}
              />
            ))}
          </div>

          <ProfilePagination
            currentPage={activePage}
            pageSize={AUCTION_PAGE_SIZE}
            totalItems={filteredAuctions.length}
            itemLabel="auctions"
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
