"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/api";
import { Auction } from "../../lib/types";

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

export default function TrackAuctionPage() {
  const [activeTab, setActiveTab] = useState<"all" | "single">("all");
  const [trackedAuctions, setTrackedAuctions] = useState<TrackedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED"
  >("ALL");
  const [selectedAuction, setSelectedAuction] = useState<TrackedAuction | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);

  // Single auction tracking state
  const [auctionIdInput, setAuctionIdInput] = useState("");
  const [singleAuction, setSingleAuction] = useState<TrackedAuction | null>(
    null,
  );
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Debug: Log tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Helper function to calculate time remaining
  const getTimeRemaining = (startAt: string, endAt: string, status: string) => {
    const now = new Date().getTime();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();

    if (status === "SCHEDULED") {
      const diff = start - now;
      if (diff <= 0)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isClosed: false,
          timeUntilStart: null,
        };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isClosed: false,
        timeUntilStart: { days, hours, minutes, seconds },
      };
    } else if (status === "OPEN") {
      const diff = end - now;
      if (diff <= 0)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isClosed: true,
          timeUntilStart: null,
        };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isClosed: false,
        timeUntilStart: null,
      };
    }

    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: true,
      timeUntilStart: null,
    };
  };

  // Fetch single auction by ID
  const fetchSingleAuction = async (auctionId: string) => {
    if (!auctionId.trim()) {
      setSingleError("Please enter an auction ID");
      return;
    }

    try {
      setSingleLoading(true);
      setSingleError(null);

      const response = await apiClient.getAuction(auctionId.trim());

      // Handle API response structure: { auction: { ... } }
      const auction = (response as { auction?: any }).auction || response;

      // Enhance with creator information
      let enhancedAuction: TrackedAuction;
      try {
        const creatorAuctions = await apiClient.getUserAuctions(
          auction.createdBy,
        );
        const creator =
          creatorAuctions.length > 0
            ? {
                id: auction.createdBy,
                username: `User_${auction.createdBy.slice(0, 8)}`,
                email: `user_${auction.createdBy.slice(0, 8)}@example.com`,
              }
            : undefined;

        enhancedAuction = {
          ...auction,
          creator,
          creatorAuctions: creatorAuctions
            .filter((a) => a.id !== auction.id && a.visibility === "PUBLIC")
            .slice(0, 3),
          winnerId: auction.winnerId,
          winningBid: auction.winningBid,
        };
      } catch (err) {
        enhancedAuction = {
          ...auction,
          winnerId: auction.winnerId,
          winningBid: auction.winningBid,
        };
      }

      setSingleAuction(enhancedAuction);
      toast.success("Auction found successfully!");
    } catch (err) {
      console.error("Failed to fetch auction:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load auction";
      setSingleError(errorMsg);
      toast.error(errorMsg);
      setSingleAuction(null);
    } finally {
      setSingleLoading(false);
    }
  };

  // Fetch tracked auctions (for demo, we'll fetch all auctions and filter)
  const fetchTrackedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all auctions (in a real app, this would be tracked auctions)
      const auctions = await apiClient.getAuctions();

      // Enhance with creator information
      const enhancedAuctions: TrackedAuction[] = await Promise.all(
        auctions.map(async (auction) => {
          try {
            // Fetch creator info
            const creatorAuctions = await apiClient.getUserAuctions(
              auction.createdBy,
            );
            const creator =
              creatorAuctions.length > 0
                ? {
                    id: auction.createdBy,
                    username: `User_${auction.createdBy.slice(0, 8)}`,
                    email: `user_${auction.createdBy.slice(0, 8)}@example.com`,
                  }
                : undefined;

            return {
              ...auction,
              creator,
              creatorAuctions: creatorAuctions
                .filter((a) => a.id !== auction.id && a.visibility === "PUBLIC")
                .slice(0, 3),
              winnerId: (auction as TrackedAuction).winnerId,
              winningBid: (auction as TrackedAuction).winningBid,
            };
          } catch (err) {
            return {
              ...auction,
              winnerId: (auction as TrackedAuction).winnerId,
              winningBid: (auction as TrackedAuction).winningBid,
            };
          }
        }),
      );

      setTrackedAuctions(enhancedAuctions);
    } catch (err) {
      console.error("Failed to fetch tracked auctions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load tracked auctions",
      );
      toast.error("Failed to load tracked auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchTrackedAuctions();
  }, [isAuthenticated, router]);

  // Filter auctions based on search and status
  const filteredAuctions = trackedAuctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.auctionCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || auction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return { color: "blue", icon: "schedule", label: "Scheduled" };
      case "OPEN":
        return { color: "green", icon: "auction", label: "Active" };
      case "REVEAL":
        return { color: "orange", icon: "visibility", label: "Reveal Phase" };
      case "CLOSED":
        return { color: "slate", icon: "check_circle", label: "Closed" };
      default:
        return { color: "slate", icon: "help", label: "Unknown" };
    }
  };

  // Format winner ID (partial for privacy)
  const formatWinnerId = (winnerId?: string) => {
    if (!winnerId) return "No winner";
    return `${winnerId.slice(0, 8)}...${winnerId.slice(-4)}`;
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Track Auctions
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Monitor auction progress, view winners, and discover more from
            creators
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-8 flex w-full border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${
              activeTab === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined">list</span>
            All Auctions
          </button>
          <button
            onClick={() => setActiveTab("single")}
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${
              activeTab === "single"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined">search</span>
            Track by ID
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "all" ? (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search auctions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Status Filter */}
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
                  className="rounded-lg border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="OPEN">Active</option>
                  <option value="REVEAL">Reveal Phase</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <button
                onClick={fetchTrackedAuctions}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">refresh</span>
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">
                  refresh
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                    error
                  </span>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Auctions Grid */}
            {!loading && !error && (
              <>
                {filteredAuctions.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">
                      visibility_off
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No auctions found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {searchTerm || filterStatus !== "ALL"
                        ? "Try adjusting your search or filters"
                        : "Start tracking auctions to see them here"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAuctions.map((auction) => {
                      const statusInfo = getStatusInfo(auction.status);
                      const timeRemaining = getTimeRemaining(
                        auction.startAt,
                        auction.endAt,
                        auction.status,
                      );

                      return (
                        <div
                          key={auction.id}
                          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Status Badge */}
                          <div className="mb-4 flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-900/30 text-${statusInfo.color}-700 dark:text-${statusInfo.color}-300 rounded-full text-xs font-medium`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {statusInfo.icon}
                              </span>
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {auction.auctionCategory}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
                            {auction.title}
                          </h3>

                          {/* Description */}
                          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {auction.itemDescription}
                          </p>

                          {/* Time Remaining */}
                          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              {auction.status === "SCHEDULED"
                                ? "Starts in:"
                                : auction.status === "OPEN"
                                  ? "Ends in:"
                                  : auction.status === "CLOSED"
                                    ? "Ended:"
                                    : "Time:"}
                            </p>
                            {auction.status === "SCHEDULED" &&
                            timeRemaining.timeUntilStart ? (
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {timeRemaining.timeUntilStart.days}d{" "}
                                {timeRemaining.timeUntilStart.hours}h{" "}
                                {timeRemaining.timeUntilStart.minutes}m
                              </p>
                            ) : auction.status === "OPEN" &&
                              !timeRemaining.isClosed ? (
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {timeRemaining.days}d {timeRemaining.hours}h{" "}
                                {timeRemaining.minutes}m
                              </p>
                            ) : (
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {auction.status === "CLOSED"
                                  ? "Completed"
                                  : "N/A"}
                              </p>
                            )}
                          </div>

                          {/* Winner Info (for closed auctions) */}
                          {auction.status === "CLOSED" && auction.winnerId && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                Winner
                              </p>
                              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                {formatWinnerId(auction.winnerId)}
                              </p>
                              {auction.winningBid && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Winning bid: ${auction.winningBid}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Creator Info */}
                          {auction.creator && (
                            <div className="mb-4 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                {auction.creator.username[0]?.toUpperCase()}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                by {auction.creator.username}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedAuction(auction);
                                setShowDetails(true);
                              }}
                              className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/auction/${auction.id}`)
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">
                                open_in_new
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Details Modal */}
            {showDetails && selectedAuction && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Auction Details
                    </h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-500">
                        close
                      </span>
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Auction Info */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        {selectedAuction.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {selectedAuction.itemDescription}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Category
                          </p>
                          <p className="text-sm font-semibold">
                            {selectedAuction.auctionCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Type
                          </p>
                          <p className="text-sm font-semibold">
                            {selectedAuction.auctionType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Min Bid
                          </p>
                          <p className="text-sm font-semibold">
                            ${selectedAuction.minBid}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Reserve Price
                          </p>
                          <p className="text-sm font-semibold">
                            ${selectedAuction.reservePrice}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Creator's Other Auctions */}
                    {selectedAuction.creatorAuctions &&
                      selectedAuction.creatorAuctions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            More from {selectedAuction.creator?.username}
                          </h4>
                          <div className="space-y-2">
                            {selectedAuction.creatorAuctions.map((auction) => (
                              <div
                                key={auction.id}
                                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                                    {auction.title}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {auction.status} • ${auction.minBid} min bid
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    router.push(`/auction/${auction.id}`)
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Single Auction Tracking */}
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Track Auction by ID
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter an auction ID to track its progress and view details
                </p>
              </div>

              {/* Auction ID Input */}
              <div className="mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      tag
                    </span>
                    <input
                      type="text"
                      placeholder="Enter auction ID (e.g., 15c0c64c-3941-494e-935a-821a2d0b5540)"
                      value={auctionIdInput}
                      onChange={(e) => setAuctionIdInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && fetchSingleAuction(auctionIdInput)
                      }
                      className="w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={() => fetchSingleAuction(auctionIdInput)}
                    disabled={singleLoading}
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {singleLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          refresh
                        </span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          search
                        </span>
                        Track
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error State */}
              {singleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                      error
                    </span>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {singleError}
                    </p>
                  </div>
                </div>
              )}

              {/* Single Auction Result */}
              {singleAuction && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
                  {/* Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 bg-${getStatusInfo(singleAuction.status).color}-100 dark:bg-${getStatusInfo(singleAuction.status).color}-900/30 text-${getStatusInfo(singleAuction.status).color}-700 dark:text-${getStatusInfo(singleAuction.status).color}-300 rounded-full text-xs font-medium`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {getStatusInfo(singleAuction.status).icon}
                      </span>
                      {getStatusInfo(singleAuction.status).label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {singleAuction.auctionCategory}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {singleAuction.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 text-slate-600 dark:text-slate-400">
                    {singleAuction.itemDescription}
                  </p>

                  {/* Time Remaining */}
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {singleAuction.status === "SCHEDULED"
                        ? "Starts in:"
                        : singleAuction.status === "OPEN"
                          ? "Ends in:"
                          : singleAuction.status === "CLOSED"
                            ? "Ended:"
                            : "Time:"}
                    </p>
                    {(() => {
                      const timeRemaining = getTimeRemaining(
                        singleAuction.startAt,
                        singleAuction.endAt,
                        singleAuction.status,
                      );
                      return singleAuction.status === "SCHEDULED" &&
                        timeRemaining.timeUntilStart ? (
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {timeRemaining.timeUntilStart.days}d{" "}
                          {timeRemaining.timeUntilStart.hours}h{" "}
                          {timeRemaining.timeUntilStart.minutes}m
                        </p>
                      ) : singleAuction.status === "OPEN" &&
                        !timeRemaining.isClosed ? (
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {timeRemaining.days}d {timeRemaining.hours}h{" "}
                          {timeRemaining.minutes}m
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {singleAuction.status === "CLOSED"
                            ? "Completed"
                            : "N/A"}
                        </p>
                      );
                    })()}
                  </div>

                  {/* Winner Info (for closed auctions) */}
                  {singleAuction.status === "CLOSED" &&
                    singleAuction.winnerId && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                          Winner
                        </p>
                        <p className="text-sm font-bold text-green-900 dark:text-green-100">
                          {formatWinnerId(singleAuction.winnerId)}
                        </p>
                        {singleAuction.winningBid && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Winning bid: ${singleAuction.winningBid}
                          </p>
                        )}
                      </div>
                    )}

                  {/* Auction Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Min Bid
                      </p>
                      <p className="text-sm font-semibold">
                        ${singleAuction.minBid}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Reserve Price
                      </p>
                      <p className="text-sm font-semibold">
                        ${singleAuction.reservePrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Type
                      </p>
                      <p className="text-sm font-semibold">
                        {singleAuction.auctionType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Bid Count
                      </p>
                      <p className="text-sm font-semibold">
                        {singleAuction.bidCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedAuction(singleAuction);
                        setShowDetails(true);
                      }}
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/auction/${singleAuction.id}`)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        open_in_new
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
