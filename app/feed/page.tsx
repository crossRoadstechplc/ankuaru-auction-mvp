"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/api";
import { Auction } from "../../lib/types";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getAuctions();
        setAuctions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch auctions",
        );
        // Fallback to mock data if API fails
        setAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAuctions();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Filter auctions based on active tab
  const filteredAuctions = auctions.filter((auction) => {
    if (activeTab === "all") return true;

    // Map tab names to visibility levels
    const visibilityMap = {
      public: "PUBLIC",
      private: "FOLLOWERS",
      custom: "CUSTOM",
    };

    // Check if auction matches the selected category
    const targetVisibility =
      visibilityMap[activeTab as keyof typeof visibilityMap];
    return targetVisibility ? auction.visibility === targetVisibility : true;
  });

  const currentAuctions = auctions.filter((auction) => {
    if (activeTab === "all") return true;

    // Map tab names to visibility levels
    const visibilityMap = {
      public: "PUBLIC",
      private: "FOLLOWERS",
      custom: "CUSTOM",
    };

    // Check if auction matches the selected category
    const targetVisibility =
      visibilityMap[activeTab as keyof typeof visibilityMap];
    return targetVisibility ? auction.visibility === targetVisibility : true;
  });

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Feed Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              For You
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Personalized auction feed based on your sourcing preferences.
            </p>
          </div>
          <Link
            href="/auction/new"
            className="group flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span>Create Auction</span>
          </Link>
        </div>

        {/* Filters/Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { id: "all", label: "All Auctions" },
            { id: "public", label: "Public" },
            { id: "followers", label: "Followers" },
            { id: "custom", label: "Private" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold rounded-lg text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col md:flex-row animate-pulse"
              >
                <div className="md:w-64 h-48 md:h-auto bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 p-6 space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400 mb-4">
                error
              </span>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Failed to load auctions
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredAuctions.length === 0 ? (
            // Empty state
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">
                auction
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No auctions available
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isAuthenticated
                  ? "Check back later for new auctions."
                  : "Please login to view available auctions."}
              </p>
            </div>
          ) : (
            // Auction list
            filteredAuctions.map((auction) => {
              const isSell = auction.auctionType === "SELL";
              return (
                <div
                  key={auction.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
                >
                  <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                      style={{ backgroundImage: `url("${auction.image}")` }}
                    ></div>
                    {auction.tag && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`${auction.tagColor} backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}
                        >
                          {auction.tag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={`/auction/${auction.id}`}
                          className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer leading-tight"
                        >
                          {auction.title}
                        </Link>
                        <span
                          className={`text-[10px] font-black px-3 py-1.5 rounded-full border tracking-widest uppercase shadow-sm ${
                            isSell
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                        >
                          {isSell ? "SELL" : "BUY"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            Current Bid
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {auction.bid}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            Time Left
                          </p>
                          <p className="text-sm font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              schedule
                            </span>
                            {auction.timeLeft}
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            Participation
                          </p>
                          <p className="text-sm font-semibold">
                            {auction.bids}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                          <span className="material-symbols-outlined text-sm">
                            {auction.visibility === "PUBLIC"
                              ? "public"
                              : "lock"}
                          </span>
                          {auction.visibility}
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">
                          •
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {auction.details}
                        </span>
                      </div>
                      <Link
                        href={`/auction/${auction.id}`}
                        className={`px-6 py-2.5 font-bold text-sm rounded-lg transition-all shadow-sm ${
                          isSell
                            ? "bg-primary hover:bg-primary-dark text-white shadow-primary/20"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                        }`}
                      >
                        {isSell ? "View Bid" : "View Request"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-12 flex flex-col items-center">
          <button className="group flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-semibold hover:border-primary/50 hover:text-primary transition-all shadow-sm">
            <span>Load More Auctions</span>
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">
              keyboard_double_arrow_down
            </span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
