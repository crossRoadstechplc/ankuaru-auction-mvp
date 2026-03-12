"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import {
  useAuctionQuery,
  useAuctionsQuery,
} from "@/src/features/auctions/queries/hooks";
import { Auction } from "../../lib/types";
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

export default function TrackAuctionPage() {
  const [activeTab, setActiveTab] = useState<"all" | "single">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED"
  >("ALL");

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

  const loading = isAuctionsLoading;
  const error = auctionsError instanceof Error ? auctionsError.message : null;

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

  const getTimeRemaining = (startAt: string, endAt: string, status: string) => {
    const now = new Date().getTime();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();

    if (status === "SCHEDULED") {
      const diff = start - now;
      if (diff <= 0) return "Starting soon";
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      return `Starts in ${days}d ${hours}h`;
    }

    if (status === "OPEN") {
      const diff = end - now;
      if (diff <= 0) return "Ended";
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      return `${days}d ${hours}h left`;
    }

    return "Completed";
  };

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

  const filteredAuctions = useMemo(() => {
    return trackedAuctions.filter((auction) => {
      const matchesSearch =
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.auctionCategory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "ALL" || auction.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trackedAuctions, searchTerm, filterStatus]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return {
          color: "blue",
          icon: "schedule",
          label: "Scheduled",
          variant: "secondary" as const,
        };
      case "OPEN":
        return {
          color: "green",
          icon: "auction",
          label: "Active",
          variant: "default" as const,
        };
      case "REVEAL":
        return {
          color: "orange",
          icon: "visibility",
          label: "Reveal Phase",
          variant: "secondary" as const,
        };
      case "CLOSED":
        return {
          color: "slate",
          icon: "check_circle",
          label: "Closed",
          variant: "secondary" as const,
        };
      default:
        return {
          color: "slate",
          icon: "help",
          label: "Unknown",
          variant: "secondary" as const,
        };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please login to track auctions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Track Auctions
          </h1>
          <p className="text-muted-foreground">
            Monitor auction progress, view winners, and discover more from
            creators
          </p>
        </div>

        <div className="mb-8">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Auctions
            </button>
            <button
              onClick={() => setActiveTab("single")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "single"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Track by ID
            </button>
          </div>
        </div>

        {activeTab === "all" ? (
          <>
            <Card className="mb-6">
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search auctions by title or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(
                          e.target.value as
                            | "ALL"
                            | "SCHEDULED"
                            | "OPEN"
                            | "REVEAL"
                            | "CLOSED",
                        )
                      }
                      className="h-10 rounded-md border-input bg-background px-3"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="OPEN">Active</option>
                      <option value="REVEAL">Reveal Phase</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <Button
                      onClick={() => void refetchAuctions()}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      {loading ? "Loading..." : "Refresh"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="material-symbols-outlined text-destructive">
                    error
                  </span>
                  <p className="text-destructive font-medium">{error}</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredAuctions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">
                        visibility_off
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No auctions found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filterStatus !== "ALL"
                          ? "Try adjusting your search or filters"
                          : "Start tracking auctions to see them here"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredAuctions.map((auction) => {
                      const statusInfo = getStatusInfo(auction.status);
                      const timeRemaining = getTimeRemaining(
                        auction.startAt,
                        auction.endAt,
                        auction.status,
                      );

                      return (
                        <Card
                          key={auction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-0">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                <Badge
                                  variant={statusInfo.variant}
                                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    {statusInfo.icon}
                                  </span>
                                </Badge>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground line-clamp-1">
                                      {auction.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {auction.auctionCategory}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {auction.auctionType}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      • {auction.bidCount || 0} bids
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Current Bid
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      ETB {auction.minBid}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Reserve Price
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      ETB {auction.reservePrice || "---"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Time Left
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {timeRemaining}
                                    </p>
                                  </div>
                                </div>

                                {auction.status === "CLOSED" &&
                                  auction.winnerId && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                                        emoji_events
                                      </span>
                                      <div>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                          Winner
                                        </p>
                                        <p className="font-semibold text-green-900 dark:text-green-100">
                                          {auction.winnerId?.slice(0, 8)}...
                                        </p>
                                        {auction.winningBid && (
                                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            Winning bid: {auction.winningBid}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {auction.creator && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>by</span>
                                    <span className="font-medium text-foreground">
                                      {auction.creator.username}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    router.push(`/auction/${auction.id}`)
                                  }
                                >
                                  View Auction
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Track Auction by ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter auction ID (e.g., 15c0c64c-3941-494e-935a-821a2d0b5540)"
                  value={auctionIdInput}
                  onChange={(e) => setAuctionIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleTrackSingleAuction();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => void handleTrackSingleAuction()}
                  disabled={singleLoading}
                >
                  {singleLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        refresh
                      </span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      Track
                    </>
                  )}
                </Button>
              </div>

              {singleError && (
                <div className="rounded-lg border-destructive bg-destructive/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-destructive">
                      error
                    </span>
                    <p className="text-destructive font-medium">{singleError}</p>
                  </div>
                </div>
              )}

              {singleAuction && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{singleAuction.title}</CardTitle>
                      <Badge variant={getStatusInfo(singleAuction.status).variant}>
                        {getStatusInfo(singleAuction.status).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-semibold">
                          {singleAuction.auctionCategory}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold">{singleAuction.auctionType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Min Bid</p>
                        <p className="font-semibold">ETB {singleAuction.minBid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reserve Price
                        </p>
                        <p className="font-semibold">
                          ETB {singleAuction.reservePrice}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {singleAuction.itemDescription}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time remaining:{" "}
                        {getTimeRemaining(
                          singleAuction.startAt,
                          singleAuction.endAt,
                          singleAuction.status,
                        )}
                      </p>
                    </div>

                    {singleAuction.status === "CLOSED" && singleAuction.winnerId && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                            emoji_events
                          </span>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Winner
                            </p>
                            <p className="font-semibold text-green-900 dark:text-green-100">
                              {singleAuction.winnerId?.slice(0, 8)}...
                            </p>
                            {singleAuction.winningBid && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Winning bid: {singleAuction.winningBid}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/auction/${singleAuction.id}`)}
                      >
                        View Full Auction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
