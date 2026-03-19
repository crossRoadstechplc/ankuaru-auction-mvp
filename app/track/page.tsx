"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Auction } from "@/lib/types";
import {
  useAuctionQuery,
  useAuctionsQuery,
} from "@/src/features/auctions/queries/hooks";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { sortTrackedAuctions } from "./utils/track-utils";
import { TrackedAuctionCard } from "./components/TrackedAuctionCard";
import { TrackLookupPanel } from "./components/TrackLookupPanel";
import { TrackHeroSection } from "./components/TrackHeroSection";
import {
  TrackStatusFilters,
  type TrackStatusFilter,
} from "./components/TrackStatusFilters";
import { TrackSearchBar } from "./components/TrackSearchBar";
import { InlineError } from "./components/InlineError";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";

const TRACK_DISPLAY_PAGE_SIZE = 6;

export default function TrackAuctionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrackStatusFilter>("ALL");
  const [displayLimit, setDisplayLimit] = useState(TRACK_DISPLAY_PAGE_SIZE);
  const [auctionIdInput, setAuctionIdInput] = useState("");
  const [trackedAuctionId, setTrackedAuctionId] = useState("");
  const [singleInputError, setSingleInputError] = useState<string | null>(null);
  const lastSuccessIdRef = useRef<string | null>(null);

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    data: auctions = [],
    isLoading: isAuctionsLoading,
    isFetching: isAuctionsRefreshing,
    error: auctionsError,
    refetch: refetchAuctions,
  } = useAuctionsQuery();

  const singleQueryEnabled = trackedAuctionId.length > 0;

  const {
    data: singleAuctionData,
    isLoading: isSingleLoading,
    isFetching: isSingleRefreshing,
    error: singleAuctionError,
    refetch: refetchSingleAuction,
  } = useAuctionQuery(trackedAuctionId, {
    enabled: singleQueryEnabled,
    refetchOnWindowFocus: false,
  });

  const trackedAuctions = useMemo(
    () => [...auctions].sort(sortTrackedAuctions),
    [auctions],
  );

  const statusCounts = useMemo(() => {
    return trackedAuctions.reduce(
      (accumulator, auction) => {
        accumulator[auction.status] += 1;
        return accumulator;
      },
      {
        OPEN: 0,
        REVEAL: 0,
        SCHEDULED: 0,
        CLOSED: 0,
      } satisfies Record<Auction["status"], number>,
    );
  }, [trackedAuctions]);

  const totalTracked = trackedAuctions.length;
  const activeCount = statusCounts.OPEN + statusCounts.REVEAL;
  const closedCount = statusCounts.CLOSED;
  const scheduledCount = statusCounts.SCHEDULED;

  const filteredAuctions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return trackedAuctions.filter((auction) => {
      if (filterStatus !== "ALL" && auction.status !== filterStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        auction.title,
        auction.auctionCategory,
        auction.itemDescription,
        auction.productName,
        auction.region,
        auction.commodityType,
        auction.creator?.fullName,
        auction.creator?.username,
        auction.createdBy,
      ].some((entry) => entry?.toLowerCase().includes(normalizedSearch));
    });
  }, [trackedAuctions, searchTerm, filterStatus]);

  const visibleAuctions = useMemo(
    () => filteredAuctions.slice(0, displayLimit),
    [displayLimit, filteredAuctions],
  );
  const hasMoreAuctions = filteredAuctions.length > visibleAuctions.length;

  const singleAuction = useMemo(() => {
    if (!singleAuctionData || singleAuctionData.id !== trackedAuctionId) {
      return null;
    }

    return singleAuctionData;
  }, [singleAuctionData, trackedAuctionId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (singleAuction && singleAuction.id !== lastSuccessIdRef.current) {
      lastSuccessIdRef.current = singleAuction.id;
      toast.success("Auction found successfully.");
    }
  }, [singleAuction]);

  useEffect(() => {
    if (singleQueryEnabled && singleAuctionError instanceof Error) {
      toast.error(singleAuctionError.message);
    }
  }, [singleQueryEnabled, singleAuctionError]);

  const handleTrackSingleAuction = async () => {
    const trimmed = auctionIdInput.trim();

    if (!trimmed) {
      setSingleInputError("Please enter an auction ID.");
      return;
    }

    setSingleInputError(null);

    if (trimmed === trackedAuctionId && singleQueryEnabled) {
      await refetchSingleAuction();
      return;
    }

    setTrackedAuctionId(trimmed);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setDisplayLimit(TRACK_DISPLAY_PAGE_SIZE);
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setDisplayLimit(TRACK_DISPLAY_PAGE_SIZE);
  };

  const handleFilterStatusChange = (status: TrackStatusFilter) => {
    setFilterStatus(status);
    setDisplayLimit(TRACK_DISPLAY_PAGE_SIZE);
  };

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-md border-border/70 shadow-sm">
            <CardContent className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Authentication required
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please log in to track auctions.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 || filterStatus !== "ALL";
  const singleAuctionLoading = isSingleLoading && !singleAuction;
  const lookupQueryError =
    singleQueryEnabled && singleAuctionError instanceof Error
      ? singleAuctionError.message
      : null;

  const sectionTitle =
    totalTracked > 0
      ? `All auctions (${totalTracked} items)`
      : "All auctions";

  return (
    <PageShell>
      <Header />
      <PageContainer className="max-w-[1480px] space-y-6 py-8 md:py-10">
        <PageHeader
          title="Track Auctions"
          description="Search live, scheduled, reveal, and closed auctions from one place."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="coffee" className="px-3 py-1 text-xs">
                {totalTracked} tracked
              </Badge>
              <Badge
                variant={activeCount > 0 ? "success" : "secondary"}
                className="px-3 py-1 text-xs"
              >
                {activeCount} active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetchAuctions()}
                disabled={isAuctionsRefreshing}
                className="gap-2"
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    isAuctionsRefreshing ? "animate-spin" : ""
                  }`}
                >
                  refresh
                </span>
                Refresh
              </Button>
            </div>
          }
        />

        <TrackHeroSection
          activeCount={activeCount}
          scheduledCount={scheduledCount}
          closedCount={closedCount}
          totalTracked={totalTracked}
          isRefreshing={isAuctionsRefreshing}
          onRefresh={refetchAuctions}
        />

        <PageSection>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <PanelCard
              title={sectionTitle}
              description="Search by title, category, description, or creator, then narrow the board by phase."
              action={
                hasActiveFilters ? (
                  <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                    {filteredAuctions.length} shown
                  </Badge>
                ) : null
              }
              bodyClassName="space-y-5"
            >
              <TrackSearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchTermChange}
                onClearSearch={() => setSearchTerm("")}
                isRefreshing={isAuctionsRefreshing}
                onRefresh={refetchAuctions}
              />

              <TrackStatusFilters
                filterStatus={filterStatus}
                onFilterChange={handleFilterStatusChange}
                totalTracked={totalTracked}
                statusCounts={statusCounts}
              />

              {auctionsError instanceof Error ? (
                <InlineError message={auctionsError.message} />
              ) : null}

              {isAuctionsLoading && trackedAuctions.length === 0 ? (
                <LoadingState type="list" count={4} />
              ) : visibleAuctions.length > 0 ? (
                <div className="space-y-5">
                  {visibleAuctions.map((auction) => (
                    <TrackedAuctionCard key={auction.id} auction={auction} />
                  ))}

                  {hasMoreAuctions ? (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDisplayLimit(
                            (current) => current + TRACK_DISPLAY_PAGE_SIZE,
                          )
                        }
                        className="h-12 rounded-full border-border/60 px-8"
                      >
                        <span className="font-semibold">Load more auctions</span>
                        <span className="material-symbols-outlined ml-2">
                          expand_more
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center pt-4">
                      <div className="rounded-full border border-border/40 bg-muted/30 px-6 py-2 text-sm font-medium text-muted-foreground">
                        You&apos;ve reached the end of the tracked auctions.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  iconName="visibility_off"
                  title={
                    hasActiveFilters
                      ? "No matching auctions"
                      : "No tracked auctions yet"
                  }
                  description={
                    hasActiveFilters
                      ? "Try broadening the search or clearing the phase filter."
                      : "When auctions are created they will appear here automatically."
                  }
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">
                            restart_alt
                          </span>
                          Clear filters
                        </Button>
                      ) : null}
                      <Button asChild variant="secondary" size="sm">
                        <Link href="/feed">Browse feed</Link>
                      </Button>
                    </div>
                  }
                />
              )}
            </PanelCard>

            <TrackLookupPanel
              auctionIdInput={auctionIdInput}
              onAuctionIdInputChange={(value) => {
                setAuctionIdInput(value);
                setSingleInputError(null);
              }}
              onTrackSingleAuction={handleTrackSingleAuction}
              onRefreshSingleAuction={async () => {
                if (!trackedAuctionId) {
                  return;
                }

                await refetchSingleAuction();
              }}
              onRefreshBoard={() => void refetchAuctions()}
              trackedAuction={singleAuction}
              isLoading={singleAuctionLoading}
              isRefreshing={isSingleRefreshing && !singleAuctionLoading}
              inputError={singleInputError}
              queryError={lookupQueryError}
            />
          </div>
        </PageSection>
      </PageContainer>

      <Footer />
    </PageShell>
  );
}
