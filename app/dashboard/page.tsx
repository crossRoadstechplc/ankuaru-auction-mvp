"use client";

import AuctionCard from "@/components/auction/AuctionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "../../lib/api";
import { RatingSummaryResponse } from "../../lib/types";

const LIVE_AUCTIONS = [
  {
    id: "1",
    title: "Sidama Bensa G1 Natural",
    region: "Sidama Region",
    type: "Micro-lot",
    currentBid: "$48.50 / kg",
    timeLeft: "02h 45m 12s",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD5V6sDurw44zKJe-MtKQQpTJ6P-g6verGYFHSD6gv-fcz6JZEO2x4A9nyC1MA249IX8RcdZhJFSfofOfWtmAe4AhLuJC35u_wUNRsr5dYMG3ynRfud19Fpb0SUaz3JZ1hDTSOsFqoEtcywNLXIBJ1jj1h5zyXvNH_pU9ZoHlcN92vocd-mqIpjq2uBTDQUDvW2TIqqlQqMc8f0BEzdgjcDQjQqH-2hodEqYJLAZdZJZJzg0ckh5GOBbkYIKihuYAP8-amLHtOm78",
  },
  {
    id: "2",
    title: "Guji Hambela G1 Washed",
    region: "Guji Highlands",
    type: "Specialty",
    currentBid: "$41.20 / kg",
    timeLeft: "05h 45m 02s",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrrPCTAybBTlf8srZZFVU8dpp9eoe6AxvPLJeRd6DUHlUy7CJyU2CcK1Fqw6-k0cuonPbbWbiWWtqfpGiW2RGlrHfFgTAQlBL0Pxvd6lsP6eaKjd0K5zysfj3ajzLaev55i2Y3jyg3MTIB3-uOcAZGYDiiZ4PzC9avly0FXSE-vyYwfrnJC4spwPchgCu1VA5ILUjkQBD0_jpaZ8tW0cxRNjAdcnhOFfTN1hx3AQUc2ap-erwfS--6HXBHMN-1vd3SJafvuwj1S4w",
    endingSoon: true,
  },
  {
    id: "3",
    title: "Yirgacheffe Kochere G1",
    region: "Gedeo Zone",
    type: "Choice Lot",
    currentBid: "$52.00 / kg",
    timeLeft: "01h 12m 45s",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC4Qd7Ev65ZXqIUWKF6A-hoaoxnNWeIBQf7WEV2qNkX3Zh8_WETsHNI_YiJdQGwt6NzK8MkEewSObvIS9HJxV_FcZ9CRgpPeE0kGIO5VSqQfsIKMiDOYb1JQ2EBV8VPmEtOt3aIQcD5pb8p-U5oMr8YfysTr9rZK-_aJ3qTzynhofM0mBwnKb5ZgV4POMccwvKlMv3D-sSMUzIOb5Z9zTGpTHkSZTnPSw9k0KGnIYCrPx7t51WMxxHM2XPbMKwhKn2BdBvi3m3rv8",
  },
];

const MY_AUCTIONS = [
  {
    id: "101",
    title: "Jimma Djimmah G5 Natural",
    price: "$28.50",
    bids: "6 Bids",
    views: "210 Views",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs-nRt3Tl5Nll04BELyXURnTk1xHTwKKakxpyslDWPMs4wdqrYha-AqX-qYDEcg58IeY2lKtsULECm2mHz0AYv2_ZTuP9PoCQgHW3Uip5U1tDv_CIahywguMNO4SMPxfwdhQkIvSZrPqY9HnhvXD2sMCeNYr4ymQvobU47mW8bt-rStcAWPINnTT5-WArFIrKXPxq2E0HyV6rcylszg6FX9CortDisUAd5a-jeGqCQV5S8j6zZoeAt3xNTBx6HZ67J98oPZ9E9BCw",
  },
  {
    id: "102",
    title: "Bebeka Geisha G3 Green",
    price: "$34.00",
    bids: "2 Bids",
    views: "85 Views",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCeeIR2t3UCjZvsBYbS2bw5OBYMNth821FiJZcdYMYrdPYn1R4JCQhh3w39_0xBQEOQqGrXIa_m66bh99AdNuFBWBpbmwHU88uB1GG6P6YUP8FcTagRQ37HY5VuDen4FiwDuR-eRXEXo_NTBxsT0E3aNqbxndp73pjdfcClaJTGbkewErq-9AmflJVNoZwrsd9NfyOxIcMmeMdHpC7RMV88B3aWEQH5KSv0wvvyTjRn8IC4n65PChc1qiw_DwW-hh9xGQ7JlB9cJc",
  },
];

export default function DashboardPage() {
  const [ratingSummary, setRatingSummary] = useState<RatingSummaryResponse | null>(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        const summary = await apiClient.getMyRatingSummary();
        setRatingSummary(summary);
      } catch (error) {
        console.error("Failed to fetch rating summary:", error);
      } finally {
        setIsLoadingRating(false);
      }
    };
    fetchRatingSummary();
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
            <h2 className="text-3xl md:text-4xl font-black text-coffee-bean dark:text-slate-100">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Welcome back! Manage your trades and sourcing requests.</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatsCard label="Participating" value="3 Bids" icon="layers" iconBgColor="bg-primary/10" iconTextColor="text-primary" />
          <StatsCard label="Performance" value="W: 2 / L: 1" icon="trending_up" iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-500" />
          <StatsCard label="My Auctions" value="2 Items" icon="store" iconBgColor="bg-amber-500/10" iconTextColor="text-amber-500" />
          <StatsCard label="Reputation" value={ratingValue} icon="military_tech" iconBgColor="bg-blue-500/10" iconTextColor="text-blue-500" />
        </div>

        {/* Main Management Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mb-16">
          {/* My Auctions (Created) */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-coffee-bean dark:text-slate-100">My Auctions</h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">2 Items</span>
            </div>
            <div className="space-y-4">
              {MY_AUCTIONS.map((item) => (
                <Link
                  key={item.id}
                  href={`/auction/${item.id}?view=creator`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-coffee-cream">
                    <img alt="Item" className="h-full w-full object-cover" src={item.image} />
                  </div>
                  <div className="flex-grow">
                    <h5 className="text-sm font-bold">{item.title}</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-primary">{item.price}</span>
                      <span className="text-[10px] text-slate-400">• {item.bids}</span>
                      <span className="text-[10px] text-slate-400">• {item.views}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Participating Auctions (Bidding) */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-coffee-bean dark:text-slate-100">Participating</h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">3 Bids</span>
            </div>
            <div className="space-y-4">
              {/* Highest Bidder State */}
              <Link
                href="/auction/3"
                className="relative flex items-center gap-4 rounded-xl border-l-4 border-primary border-y border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-coffee-cream">
                  <img
                    alt="Item"
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrfEtnkghl_ZpYp2it0uW-zhZidd7HnCqnUq08q028_vBOnzuHyVjZ3O3zBgrAkKODovSbW7D_Buumf7jkPqAfQVTAd9ddhfqCsHs9eJyxOfZPvDApk9DVXICQoVbH29OLFafn0CIFJ2x8w4UYvFNALdFZgc9aAPtmf82YgFu351ZfF5vMiuuCLPR06cP5gVbbqG5U55UvpBS4X2BC672NYmtHmcqHg9Kj5eLaskg-yusd6a2ucCoT9-viSM4V0OXnLgPHUMeoNRw"
                  />
                </div>
                <div className="flex-grow">
                  <h5 className="text-sm font-bold">Hario V60 Copper Edition</h5>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Highest Bidder</p>
                  <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">Your Bid: $75.00</p>
                </div>
                <div className="text-right">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
              </Link>

              {/* Outbid State */}
              <Link
                href="/auction/1"
                className="relative flex items-center gap-4 rounded-xl border-l-4 border-orange-500 border-y border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-coffee-cream">
                  <img
                    alt="Item"
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDviE3qzMTzW28KPD6JRYMlRPG5pIWYelVzVj7i7bz3hYN6-iu8JaZdqT81vfMMkfzU8tkpeWbHpVZYRKmttxrnqkAQ499GvETpuKTFij9CdOktswGltvjOeQYEUD400iYdQTz-ilB8_lYXM2Jz4iI1QJzLbeWnBvxTNIZ6bRYmXv4CYo-vs2mpr2_xvM7RLmat7PjgXIRdlOW5w6xrHfaVLZhNfdYwa1UCCBIIcL4GZpSJ2ltfptPGNqitsBWl5lFDBweHYFbTVs"
                  />
                </div>
                <div className="flex-grow">
                  <h5 className="text-sm font-bold">Gesha Village Selection</h5>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Outbid</p>
                  <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">High: $110.00</p>
                </div>
                <div className="text-right">
                  <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-orange-600">
                    Increase Bid
                  </button>
                </div>
              </Link>
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
            <Link className="text-sm font-bold text-primary hover:underline" href="/feed">
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
