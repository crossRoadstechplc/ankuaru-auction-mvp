"use client";

import AuctionCard from "@/components/auction/AuctionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "../../lib/api";
import { Users } from "lucide-react";

import {
  Auction,
  BidWithAuction,
  RatingSummaryResponse,
} from "../../lib/types";

const LIVE_AUCTIONS = [
  {
    id: "1",
    title: "Sidama Bensa G1 Natural",
    region: "Sidama Region",
    type: "Micro-lot",
    currentBid: "ETB 48.50 / kg",
    timeLeft: "02h 45m 12s",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAD5V6sDurw44zKJe-MtKQQpTJ6P-g6verGYFHSD6gv-fcz6JZEO2x4A9nyC1MA249IX8RcdZhJFSfofOfWtmAe4AhLuJC35u_wUNRsr5dYMG3ynRfud19Fpb0SUaz3JZ1hDTSOsFqoEtcywNLXIBJ1jj1h5zyXvNH_pU9ZoHlcN92vocd-mqIpjq2uBTDQUDvW2TIqqlQqMc8f0BEzdgjcDQjQqH-2hodEqYJLAZdZJZJzg0ckh5GOBbkYIKihuYAP8-amLHtOm78",
  },
  {
    id: "2",
    title: "Guji Hambela G1 Washed",
    region: "Guji Highlands",
    type: "Specialty",
    currentBid: "ETB 41.20 / kg",
    timeLeft: "05h 45m 02s",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrrPCTAybBTlf8srZZFVU8dpp9eoe6AxvPLJeRd6DUHlUy7CJyU2CcK1Fqw6-k0cuonPbbWbiWWtqfpGiW2RGlrHfFgTAQlBL0Pxvd6lsP6eaKjd0K5zysfj3ajzLaev55i2Y3jyg3MTIB3-uOcAZGYDiiZ4PzC9avly0FXSE-vyYwfrnJC4spwPchgCu1VA5ILUjkQBD0_jpaZ8tW0cxRNjAdcnhOFfTN1hx3AQUc2ap-erwfS--6HXBHMN-1vd3SJafvuwj1S4w",
    endingSoon: true,
  },
  {
    id: "3",
    title: "Yirgacheffe Kochere G1",
    region: "Gedeo Zone",
    type: "Choice Lot",
    currentBid: "ETB 52.00 / kg",
    timeLeft: "01h 12m 45s",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC4Qd7Ev65ZXqIUWKF6A-hoaoxnNWeIBQf7WEV2qNkX3Zh8_WETsHNI_YiJdQGwt6NzK8MkEewSObvIS9HJxV_FcZ9CRgpPeE0kGIO5VSqQfsIKMiDOYb1JQ2EBV8VPmEtOt3aIQcD5pb8p-U5oMr8YfysTr9rZK-_aJ3qTzynhofM0mBwnKb5ZgV4POMccwvKlMv3D-sSMUzIOb5Z9zTGpTHkSZTnPSw9k0KGnIYCrPx7t51WMxxHM2XPbMKwhKn2BdBvi3m3rv8",
  },
];

export default function DashboardPage() {
  const [ratingSummary, setRatingSummary] =
    useState<RatingSummaryResponse | null>(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);

  const [myBids, setMyBids] = useState<BidWithAuction[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingsCount, setFollowingsCount] = useState(0);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Rating Summary
      try {
        const summary = await apiClient.getMyRatingSummary();
        setRatingSummary(summary);
      } catch (error) {
        console.error("Failed to fetch rating summary:", error);
      } finally {
        setIsLoadingRating(false);
      }

      // My Auctions
      try {
        const user = localStorage.getItem("auth_user") || "";
        const userId = JSON.parse(user).id;
        if (userId) {
          const auctions = await apiClient.getUserAuctions(userId);
          setMyAuctions(auctions);
        } else {
          console.log("No user ID found in local storage");
        }
      } catch (error) {
        console.error("Failed to fetch my auctions:", error);
      } finally {
        setIsLoadingAuctions(false);
      }

      // My Bids (Participating)
      try {
        const bids = await apiClient.getMyBids();
        setMyBids(bids);
      } catch (error) {
        console.error("Failed to fetch my bids:", error);
      } finally {
        setIsLoadingBids(false);
      }

      //My Followers and followisngs
      try {
        const followers = await apiClient.getMyFollowers();
        const f = await apiClient.getMyFollowing();
        setFollowersCount(followers.length);
        setFollowingsCount(f.length);
      } catch (error) {
        console.error("Failed to fetch my followers:", error);
      } finally {
        setIsLoadingFollowers(false);
      }
    };
    fetchDashboardData();
  }, []);

  const ratingValue = isLoadingRating
    ? "..."
    : ratingSummary?.user?.averageRating
      ? `${parseFloat(ratingSummary.user.averageRating).toFixed(1)} / 5.0`
      : "N/A";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] px-4 md:px-10 lg:px-40 py-8">
        {/* Welcome & Quick Action */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-coffee-bean dark:text-slate-100">
              Dashboard
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">
              Welcome back! Manage your auction here.
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

        {/* Stats Overview */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatsCard
            label="Participating"
            value={`${isLoadingBids ? "..." : myBids.length} Bids`}
            icon="layers"
            iconBgColor="bg-primary/10"
            iconTextColor="text-primary"
          />
          <StatsCard
            label="My Auctions"
            value={`${isLoadingAuctions ? "..." : myAuctions.length} Items`}
            icon="store"
            iconBgColor="bg-amber-500/10"
            iconTextColor="text-amber-500"
          />
          <StatsCard
            label="Reputation"
            value={ratingValue}
            icon="military_tech"
            iconBgColor="bg-blue-500/10"
            iconTextColor="text-blue-500"
          />
          <StatsCard
            label="Followers / Following"
            value={followersCount.toString() + " / " + followingsCount.toString()}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="bg-emerald-500/10"
            iconTextColor="text-emerald-600"
          />
        </div>

        {/* Main Management Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mb-16">
          {/* My Auctions (Created) */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-coffee-bean dark:text-slate-100">
                My Auctions
              </h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                {myAuctions.length} Items
              </span>
            </div>
            <div className="space-y-4">
              {isLoadingAuctions ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading your auctions...
                </div>
              ) : myAuctions.length === 0 ? (
                <div className="p-4 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                    storefront
                  </span>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    You haven't created any auctions yet.
                  </p>
                  <Link
                    href="/auction/create"
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create New Auction
                  </Link>
                </div>
              ) : (
                myAuctions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/auction/${item.id}?view=creator`}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-coffee-cream flex items-center justify-center text-slate-300">
                      {item.image ? (
                        <img
                          alt={item.title}
                          className="h-full w-full object-cover"
                          src={item.image}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">
                          image
                        </span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h5
                        className="text-sm font-bold truncate max-w-[200px]"
                        title={item.title}
                      >
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-primary">
                          ${item.reservePrice}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {item.bidCount ?? 0} Bids
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.status === "OPEN" ? "bg-primary/10 text-primary" : item.status === "CLOSED" ? "bg-slate-100 dark:bg-slate-800 text-slate-500" : "bg-amber-500/10 text-amber-500"}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300">
                      chevron_right
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Participating Auctions (Bidding) */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-coffee-bean dark:text-slate-100">
                Participating
              </h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                {isLoadingBids ? "..." : `${myBids.length} Bids`}
              </span>
            </div>
            <div className="space-y-4">
              {isLoadingBids ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading your bids...
                </div>
              ) : myBids.length === 0 ? (
                <div className="p-4 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                    gavel
                  </span>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    You haven't placed any bids yet.
                  </p>
                  <Link
                    href="/feed"
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                myBids.map((bid) => {
                  const auc = bid.auction;
                  const isRevealed = bid.revealedAmount !== null;
                  const isOpen = auc.status === "OPEN";
                  const isRevealPhase = auc.status === "REVEAL";
                  const isClosed = auc.status === "CLOSED";

                  let statusColor = "border-primary";
                  let statusLabel = "Bid Placed";
                  let statusTextColor = "text-primary";
                  if (isRevealPhase) {
                    statusColor = "border-amber-500";
                    statusLabel = "Reveal Phase";
                    statusTextColor = "text-amber-500";
                  } else if (isClosed) {
                    statusColor = "border-slate-400";
                    statusLabel = "Closed";
                    statusTextColor = "text-slate-500";
                  }

                  return (
                    <Link
                      key={bid.id}
                      href={`/auction/${auc.id}`}
                      className={`relative flex items-center gap-4 rounded-xl border-l-4 ${statusColor} border-y border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-coffee-cream flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-3xl">
                          gavel
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5
                          className="text-sm font-bold truncate max-w-[180px]"
                          title={auc.title}
                        >
                          {auc.title}
                        </h5>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${statusTextColor}`}
                        >
                          {statusLabel}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isRevealed && (
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Revealed: {bid.revealedAmount}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isOpen
                              ? "bg-primary/10 text-primary"
                              : isRevealPhase
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                          >
                            {auc.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="material-symbols-outlined text-slate-300">
                          chevron_right
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Live Auctions Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-coffee-bean dark:text-slate-100">
              <span className="h-3 w-3 rounded-full bg-primary animate-pulse"></span>
              Live Auctions
            </h3>
            <Link
              className="text-sm font-bold text-primary hover:underline"
              href="/feed"
            >
              View All Market
            </Link>
          </div>
          <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-4">
            {LIVE_AUCTIONS.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
