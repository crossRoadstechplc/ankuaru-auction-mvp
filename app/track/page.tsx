"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { Auction } from "@/lib/types";
import { useAuctionQuery, useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth.store";

interface TrackedAuction extends Auction {
  creator?: {
    id: string;
    username: string;
    email: string;
  };
  creatorAuctions?: Auction[];
  winnerId?: string;
  winningBid?: string;
}

type TrackStatusFilter = "ALL" | "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED";

function toTrackedAuction(auction: Auction): TrackedAuction {
  return {
    ...auction,
    creator: auction.createdBy
      ? {
          id: auction.createdBy,
          username: `User_${auction.createdBy.slice(0, 8)}`,
          email: `user_${auction.createdBy.slice(0, 8)}@example.com`,
        }
      : undefined,
    creatorAuctions: [],
    winnerId: (auction as TrackedAuction).winnerId ?? auction.winnerId,
    winningBid: (auction as TrackedAuction).winningBid ?? auction.winningBid,
  };
}

function formatMoney(value?: string | null) {
  if (!value) {
    return "ETB --";
  }

  return `ETB ${value}`;
}

function formatCompactCount(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return value.toLocaleString();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusPillClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "SCHEDULED":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
    case "REVEAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "CLOSED":
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusLabel(status: TrackStatusFilter) {
  switch (status) {
    case "ALL":
      return "All";
    case "OPEN":
      return "Open";
    case "SCHEDULED":
      return "Scheduled";
    case "REVEAL":
      return "Reveal";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

function getAuctionModeLabel(type: "SELL" | "BUY") {
  return type === "SELL" ? "Sell auction" : "Buy request";
}

function getArrivalValue(auction: TrackedAuction) {
  if (auction.status === "SCHEDULED") {
    return formatDate(auction.startAt);
  }

  return formatDate(auction.endAt);
}

function getRouteValue(auction: TrackedAuction) {
  const left = auction.region || auction.auctionCategory || "Origin";
  const right = auction.productName || auction.commodityType || "Destination";
  return `${left} -> ${right}`;
}

function TrackRow({
  auction,
  onOpen,
}: {
  auction: TrackedAuction;
  onOpen: (id: string) => void;
}) {
  return (
    <tr className="border-b border-border/70 transition-colors hover:bg-muted/20">
      <td className="px-4 py-3 align-middle md:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            #{auction.id.slice(0, 10)}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {auction.title}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-foreground md:px-5">
        {auction.auctionCategory}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-foreground md:px-5">
        {auction.quantity
          ? `${auction.quantity}${auction.quantityUnit ? ` ${auction.quantityUnit}` : ""}`
          : "Unspecified"}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-foreground md:px-5">
        {auction.creator?.username || "Marketplace"}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-foreground md:px-5">
        {getArrivalValue(auction)}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-foreground md:px-5">
        <span className="truncate">{getRouteValue(auction)}</span>
      </td>
      <td className="px-4 py-3 align-middle md:px-5">
        <div className="flex items-center justify-end gap-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusPillClass(
              auction.status,
            )}`}
          >
            {getStatusLabel(auction.status as TrackStatusFilter)}
          </span>
          <Button size="sm" variant="outline" onClick={() => onOpen(auction.id)}>
            View
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function TrackAuctionPage() {
  const [activeTab, setActiveTab] = useState<"all" | "single">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrackStatusFilter>("ALL");
  const [auctionIdInput, setAuctionIdInput] = useState("");
  const [trackedAuctionId, setTrackedAuctionId] = useState("");
  const [singleInputError, setSingleInputError] = useState<string | null>(null);
  const lastSuccessIdRef = useRef<string | null>(null);
  const singleQueryEnabled = activeTab === "single" && !!trackedAuctionId;

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    data: auctions = [],
    isLoading: isAuctionsLoading,
    error: auctionsError,
    refetch: refetchAuctions,
  } = useAuctionsQuery();

  const {
    data: singleAuctionData,
    isLoading: singleLoading,
    error: singleAuctionError,
    refetch: refetchSingleAuction,
  } = useAuctionQuery(trackedAuctionId, {
    enabled: singleQueryEnabled,
    refetchOnWindowFocus: false,
  });

  const trackedAuctions = useMemo(
    () => auctions.map((auction) => toTrackedAuction(auction)),
    [auctions],
  );

  const singleAuction = useMemo(
    () => (singleAuctionData ? toTrackedAuction(singleAuctionData) : null),
    [singleAuctionData],
  );

  const singleError = useMemo(() => {
    if (singleInputError) {
      return singleInputError;
    }

    if (singleQueryEnabled && singleAuctionError instanceof Error) {
      return singleAuctionError.message;
    }

    return null;
  }, [singleInputError, singleQueryEnabled, singleAuctionError]);

  const filteredAuctions = useMemo(() => {
    return trackedAuctions.filter((auction) => {
      const matchesSearch =
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.auctionCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auction.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auction.creator?.username || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "ALL" || auction.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [trackedAuctions, searchTerm, filterStatus]);

  const statusTabs = useMemo(
    () =>
      (["ALL", "OPEN", "SCHEDULED", "REVEAL", "CLOSED"] as TrackStatusFilter[]).map(
        (status) => ({
          id: status,
          label: getStatusLabel(status),
          count:
            status === "ALL"
              ? trackedAuctions.length
              : trackedAuctions.filter((auction) => auction.status === status).length,
        }),
      ),
    [trackedAuctions],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (singleAuction && singleAuction.id !== lastSuccessIdRef.current) {
      lastSuccessIdRef.current = singleAuction.id;
      toast.success("Auction found successfully!");
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
      setSingleInputError("Please enter an auction ID");
      return;
    }

    setSingleInputError(null);

    if (trimmed === trackedAuctionId && singleQueryEnabled) {
      await refetchSingleAuction();
      return;
    }

    setTrackedAuctionId(trimmed);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Authentication Required</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Please login to track auctions
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <Header />

      <PageContainer className="space-y-8 py-6 md:py-8">
        <PageSection>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-[24px] border border-border/70 bg-card p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Auction desk
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "single"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Track by ID
              </button>
            </div>

            {activeTab === "all" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void refetchAuctions()}
                disabled={isAuctionsLoading}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </Button>
            ) : null}
          </div>
        </PageSection>

        {activeTab === "all" ? (
          <>
            <PageSection>
              {auctionsError instanceof Error ? (
                <div className="rounded-[28px] border border-destructive/30 bg-destructive/5 px-5 py-4 text-destructive">
                  {auctionsError.message}
                </div>
              ) : isAuctionsLoading ? (
                <div className="rounded-[28px] border border-border/70 bg-card p-4">
                  <LoadingState type="list" count={6} />
                </div>
              ) : filteredAuctions.length === 0 ? (
                <EmptyState
                  iconName="travel_explore"
                  title="No auctions found"
                  description={
                    searchTerm || filterStatus !== "ALL"
                      ? "Try adjusting your tracking filters."
                      : "Tracked auctions will appear here once listings are available."
                  }
                  className="min-h-[320px] rounded-[28px] border border-border/70 bg-card"
                />
              ) : (
                <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card">
                  <div className="border-b border-border/70 px-4 py-3 md:px-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {statusTabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterStatus(tab.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                              filterStatus === tab.id
                                ? "bg-background text-foreground shadow-sm ring-1 ring-border/70"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="text-xs opacity-70">
                              {formatCompactCount(tab.count)}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                          placeholder="Search by title, category, company, or product..."
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          className="h-10 min-w-[240px] rounded-xl"
                        />
                        <div className="rounded-xl border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
                          {formatCompactCount(filteredAuctions.length)} rows
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border/70 bg-muted/20 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          <th className="px-4 py-3 md:px-5">Auction ID</th>
                          <th className="px-4 py-3 md:px-5">Category</th>
                          <th className="px-4 py-3 md:px-5">Quantity</th>
                          <th className="px-4 py-3 md:px-5">Company</th>
                          <th className="px-4 py-3 md:px-5">Arrival time</th>
                          <th className="px-4 py-3 md:px-5">Route</th>
                          <th className="px-4 py-3 text-right md:px-5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAuctions.map((auction) => (
                          <TrackRow
                            key={auction.id}
                            auction={auction}
                            onOpen={(id) => router.push(`/auction/${id}`)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </PageSection>
          </>
        ) : (
          <PageSection>
            <div className="mx-auto max-w-3xl rounded-[30px] border border-border/70 bg-card p-4 md:p-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Track by auction ID
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use a direct auction ID when you want one precise result instead of the full tracking table.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Enter auction ID"
                  value={auctionIdInput}
                  onChange={(event) => setAuctionIdInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleTrackSingleAuction();
                    }
                  }}
                  className="h-11 flex-1 rounded-xl"
                />
                <Button
                  onClick={() => void handleTrackSingleAuction()}
                  disabled={singleLoading}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    {singleLoading ? "sync" : "search"}
                  </span>
                  {singleLoading ? "Searching..." : "Track"}
                </Button>
              </div>

              {singleError ? (
                <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {singleError}
                </div>
              ) : null}

              {singleLoading ? (
                <div className="mt-6">
                  <LoadingState type="list" count={3} />
                </div>
              ) : null}

              {singleAuction ? (
                <div className="mt-5 overflow-hidden rounded-[24px] border border-border/70 bg-background/60">
                  <div className="border-b border-border/70 px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {singleAuction.title}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusPillClass(
                          singleAuction.status,
                        )}`}
                      >
                        {getStatusLabel(singleAuction.status as TrackStatusFilter)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-px bg-border/60 md:grid-cols-2">
                    {[
                      { label: "Auction ID", value: `#${singleAuction.id.slice(0, 12)}` },
                      { label: "Category", value: singleAuction.auctionCategory },
                      { label: "Auction mode", value: getAuctionModeLabel(singleAuction.auctionType) },
                      { label: "Current bid", value: formatMoney(singleAuction.currentBid || singleAuction.winningBid || singleAuction.minBid) },
                      { label: "Arrival time", value: getArrivalValue(singleAuction) },
                      { label: "Route", value: getRouteValue(singleAuction) },
                    ].map((item) => (
                      <div key={item.label} className="bg-card px-4 py-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end px-4 py-3.5">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/auction/${singleAuction.id}`)}
                    >
                      Open Full Auction
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </PageSection>
        )}
      </PageContainer>

      <Footer />
    </PageShell>
  );
}
