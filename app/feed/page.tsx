"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { getImageWithFallback } from "@/lib/imageUtils";
import { Auction } from "@/lib/types";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { FeedAuctionGrid } from "./components/FeedAuctionGrid";
import { FeedFiltersSidebar } from "./components/FeedFiltersSidebar";
import { FeedSearchBar } from "./components/FeedSearchBar";

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayLimit, setDisplayLimit] = useState(6);
  const user = useAuthStore((state) => state.user);

  // React Query hook for fetching auctions
  const { data: auctions = [], isLoading, error } = useAuctionsQuery();

  // Filter auctions based on category, status, search, and user ownership
  const filteredAuctions = Array.isArray(auctions)
    ? (auctions as Auction[])
        .filter((auction: Auction) => {
          // Filter out user's own auctions
          if (user?.id && auction.createdBy === user.id) {
            return false;
          }

          // Status filtering
          if (activeStatus !== "all" && auction.status !== activeStatus) {
            return false;
          }

          // Category filtering (map to visibility levels)
          const visibilityMap: Record<string, string> = {
            public: "PUBLIC",
            followers: "FOLLOWERS",
            custom: "SELECTED",
          };

          if (activeCategory !== "all") {
            const requiredVisibility = visibilityMap[activeCategory];
            if (
              requiredVisibility &&
              auction.visibility !== requiredVisibility
            ) {
              return false;
            }
          }

          // Search filtering (basic client-side search)
          if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            return (
              auction.title.toLowerCase().includes(searchLower) ||
              auction.itemDescription.toLowerCase().includes(searchLower) ||
              auction.auctionCategory.toLowerCase().includes(searchLower)
            );
          }

          return true;
        })
        .slice(0, displayLimit)
    : [];

  // Calculate auction counts for badges
  const auctionCounts = Array.isArray(auctions)
    ? {
        all: auctions.filter(
          (a: Auction) => !user?.id || a.createdBy !== user.id,
        ).length,
        public: auctions.filter(
          (a: Auction) =>
            (!user?.id || a.createdBy !== user.id) && a.visibility === "PUBLIC",
        ).length,
        followers: auctions.filter(
          (a: Auction) =>
            (!user?.id || a.createdBy !== user.id) &&
            a.visibility === "FOLLOWERS",
        ).length,
        custom: auctions.filter(
          (a: Auction) =>
            (!user?.id || a.createdBy !== user.id) &&
            a.visibility === "SELECTED",
        ).length,
      }
    : { all: 0, public: 0, followers: 0, custom: 0 };

  // Check if there are more auctions to load
  const hasMore =
    filteredAuctions.length < displayLimit ||
    (Array.isArray(auctions) && auctions.length > displayLimit);

  // Handle load more
  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 6);
  };

  return (
    <PageShell>
      <Header />
      <PageContainer>
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-64 shrink-0">
            <FeedFiltersSidebar
              activeCategory={activeCategory}
              activeStatus={activeStatus}
              onCategoryChange={setActiveCategory}
              onStatusChange={setActiveStatus}
              auctionCounts={auctionCounts}
            />
          </div>

          {/* Right Main Content */}
          <div className="flex-1 min-w-0">
            <PageSection>
              {/* Search Bar */}
              <FeedSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredAuctions.length}
                isLoading={isLoading}
              />

              {/* Auction Grid */}
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
                getImageWithFallback={getImageWithFallback}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </PageSection>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </PageShell>
  );
}
