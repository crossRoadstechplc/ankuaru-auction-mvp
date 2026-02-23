"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../lib/api";
import { Auction, User, UserRating } from "../../../lib/types";
import { AuctionDetailsCard } from "./_components/AuctionDetailsCard";
import { BidActivity } from "./_components/BidActivity";
import { BiddingSidebar } from "./_components/BiddingSidebar";

function AuctionDetailContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const isCreator = searchParams.get("view") === "creator";
  const { isAuthenticated } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [creatorRating, setCreatorRating] = useState<UserRating | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getAuction(id);
        setAuction(data);

        // Fetch creator info and rating
        if (data.createdBy) {
          try {
            const [ratingData] = await Promise.all([
              apiClient.getUserRating(data.createdBy),
            ]);
            setCreatorRating(ratingData);
          } catch (err) {
            console.warn("Failed to fetch creator info:", err);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch auction details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [id]);

  if (!isAuthenticated) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please login to view auction details
          </p>
          <Link
            href="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
              <div className="lg:col-span-4">
                <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
              error
            </span>
            <h2 className="text-2xl font-bold mb-4">Failed to load auction</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error || "Auction not found"}
            </p>
            <Link
              href="/feed"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Auctions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isSell = auction.auctionType === "SELL";

  return (
    <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {/* Status Layout Badges */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {isCreator && (
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs bg-primary/10 w-fit px-3 py-1.5 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-sm">
                admin_panel_settings
              </span>{" "}
              Creator Control Panel
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
              isSell
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isSell ? "sell" : "shopping_cart"}
            </span>
            {isSell ? "Auction Sale" : "Purchase Request"}
          </div>
          {auction.status === "CLOSED" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm bg-slate-100 text-slate-500 border-slate-200">
              <span className="material-symbols-outlined text-sm">lock</span>
              Closed
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
          <Link className="text-slate-400 hover:text-primary" href="/feed">
            Auctions
          </Link>
          <span className="material-symbols-outlined text-xs text-slate-300">
            chevron_right
          </span>
          <span className="text-slate-900 dark:text-white">
            {auction.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <AuctionDetailsCard data={auction} creatorRating={creatorRating} />
            <BidActivity data={auction} isCreator={isCreator} />
          </div>

          {/* Sidebar Column */}
          <BiddingSidebar data={auction} isCreator={isCreator} />
        </div>
      </main>

      <footer className="mt-auto py-10 px-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          © 2024 Ankuaru Specialty Coffee Marketplace
        </p>
      </footer>
    </div>
  );
}

export default function AuctionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AuctionDetailContent />
    </Suspense>
  );
}
