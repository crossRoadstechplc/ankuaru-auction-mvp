"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useState } from "react";

const AUCTION_DATA = {
  all: [
    {
      id: "1",
      title: "Sidama Bensa G1 Natural",
      tag: "Top Quality",
      tagColor: "bg-primary/90",
      bid: "$48.50",
      timeLeft: "03h 15m",
      bids: "15 Bids",
      type: "SELL",
      visibility: "Public",
      details: "Bensa District • Heirloom Variety",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQKmgkx0SFK6tKM8vtpCys-ZM4Qt3xCdbC0WmsJMNauDFINGlNGtscIHz9HeEbDmxayTen-d2MOPUgYYSuLyydvt-8c1YzK0Jk_1zzBU9swz_9kSF2oXyiVrq_Lc7DEUZIoJICP5tiB1BIF7NatksENCsyOHx4lhaVGBWaejO1qV6nUNFSsl5i58dXFr_IbrUGW4tWhxnPy0UR1_mrFMO7QVOXmzDtyjnG2MriVeJIISNt96dGz86R2NM_UWBftRHMTVw5WXdXQtw",
    },
    {
      id: "4",
      title: "Harrar Golden Horse G4",
      tag: "Bulk Purchase",
      tagColor: "bg-blue-600",
      bid: "$295.00",
      timeLeft: "2d 04h",
      bids: "12 Bids",
      type: "BUY",
      visibility: "Public",
      details: "Eastern Highlands • Sourcing 25MT",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCeeIR2t3UCjZvsBYbS2bw5OBYMNth821FiJZcdYMYrdPYn1R4JCQhh3w39_0xBQEOQqGrXIa_m66bh99AdNuFBWBpbmwHU88uB1GG6P6YUP8FcTagRQ37HY5VuDen4FiwDuR-eRXEXo_NTBxsT0E3aNqbxndp73pjdfcClaJTGbkewErq-9AmflJVNoZwrsd9NfyOxIcMmeMdHpC7RMV88B3aWEQH5KSv0wvvyTjRn8IC4n65PChc1qiw_DwW-hh9xGQ7JlB9cJc",
    },
    {
      id: "2",
      title: "Guji Hambela G1 Washed",
      tag: "Best Processed",
      tagColor: "bg-amber-500/90",
      bid: "$41.20",
      timeLeft: "05h 45m",
      bids: "8 Bids",
      type: "SELL",
      visibility: "Public",
      details: "Hambela Wamena • High Altitude",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD5V6sDurw44zKJe-MtKQQpTJ6P-g6verGYFHSD6gv-fcz6JZEO2x4A9nyC1MA249IX8RcdZhJFSfofOfWtmAe4AhLuJC35u_wUNRsr5dYMG3ynRfud19Fpb0SUaz3JZ1hDTSOsFqoEtcywNLXIBJ1jj1h5zyXvNH_pU9ZoHlcN92vocd-mqIpjq2uBTDQUDvW2TIqqlQqMc8f0BEzdgjcDQjQqH-2hodEqYJLAZdZJZJzg0ckh5GOBbkYIKihuYAP8-amLHtOm78",
    }
  ],
  coffee: [
    {
      id: "1",
      title: "Sidama Bensa G1 Natural",
      tag: "Top Quality",
      tagColor: "bg-primary/90",
      bid: "$48.50",
      timeLeft: "03h 15m",
      bids: "15 Bids",
      type: "SELL",
      visibility: "Public",
      details: "Bensa District • Heirloom Variety",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQKmgkx0SFK6tKM8vtpCys-ZM4Qt3xCdbC0WmsJMNauDFINGlNGtscIHz9HeEbDmxayTen-d2MOPUgYYSuLyydvt-8c1YzK0Jk_1zzBU9swz_9kSF2oXyiVrq_Lc7DEUZIoJICP5tiB1BIF7NatksENCsyOHx4lhaVGBWaejO1qV6nUNFSsl5i58dXFr_IbrUGW4tWhxnPy0UR1_mrFMO7QVOXmzDtyjnG2MriVeJIISNt96dGz86R2NM_UWBftRHMTVw5WXdXQtw",
    },
    {
      id: "3",
      title: "Yirgacheffe Kochere G1",
      tag: "Micro-lot",
      tagColor: "bg-purple-600",
      bid: "$52.00",
      timeLeft: "01h 10m",
      bids: "22 Bids",
      type: "SELL",
      visibility: "Public",
      details: "Kochere Station • Pure Floral",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC4Qd7Ev65ZXqIUWKF6A-hoaoxnNWeIBQf7WEV2qNkX3Zh8_WETsHNI_YiJdQGwt6NzK8MkEewSObvIS9HJxV_FcZ9CRgpPeE0kGIO5VSqQfsIKMiDOYb1JQ2EBV8VPmEtOt3aIQcD5pb8p-U5oMr8YfysTr9rZK-_aJ3qTzynhofM0mBwnKb5ZgV4POMccwvKlMv3D-sSMUzIOb5Z9zTGpTHkSZTnPSw9k0KGnIYCrPx7t51WMxxHM2XPbMKwhKn2BdBvi3m3rv8",
    }
  ],
  equipment: [],
  green: [
    {
      id: "5",
      title: "Jimma Djimmah G5 Natural",
      tag: "Bulk Export",
      tagColor: "bg-green-600",
      bid: "$28.50",
      timeLeft: "2d 08h",
      bids: "6 Bids",
      type: "SELL",
      visibility: "Public",
      details: "Kaffa Zone • Traditional Grade",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1GeVTMpGnhu_1VMQF86BvUPAEKXaF-cUh3-3FxASGoL9DsuR5UqVSzlJxbMr9inWgauaiSkYxQDQgPqFlCIkjrRFKE4ubizNMep7WeataPZNuvdRfPUbkOga7NiKnlB-lfVdf1bf4MInUmsqIukN6x3QcN2I82qwbIB-RyfY9jPvuQtkvqqmtGJXR8vwuKO8Pv-gyH08PufDrmTIRvHnsVE4-PMc37MLWEurbpoiIXG_dWmgZp6F0h3LPs9_emJSjfgB_GxHtldY",
    }
  ]
};

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('all');

  const currentAuctions = AUCTION_DATA[activeTab as keyof typeof AUCTION_DATA] || [];

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Feed Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">For You</h2>
            <p className="text-slate-500 dark:text-slate-400">Personalized auction feed based on your sourcing preferences.</p>
          </div>
          <Link
            href="/auction/new"
            className="group flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Post Auction</span>
          </Link>
        </div>

        {/* Filters/Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { id: 'all', label: 'All Auctions' },
            { id: 'coffee', label: 'Coffee Specific' },
            { id: 'equipment', label: 'Equipment' },
            { id: 'green', label: 'Green Beans' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === tab.id
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
          {currentAuctions.map((auction) => {
            const isSell = auction.type === "SELL";
            return (
              <div key={auction.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
                <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                    style={{ backgroundImage: `url("${auction.image}")` }}
                  ></div>
                  {auction.tag && (
                    <div className="absolute top-3 left-3">
                      <span className={`${auction.tagColor} backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                        {auction.tag}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/auction/${auction.id}`} className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer leading-tight">
                        {auction.title}
                      </Link>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-widest uppercase shadow-sm ${isSell ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}>
                        {isSell ? "SELL" : "BUY"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Current Bid</p>
                        <p className="text-lg font-bold text-primary">{auction.bid}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Time Left</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {auction.timeLeft}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Participation</p>
                        <p className="text-sm font-semibold">{auction.bids}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">
                          {auction.visibility === "Public" ? "public" : "lock"}
                        </span>
                        {auction.visibility}
                      </div>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{auction.details}</span>
                    </div>
                    <Link
                      href={`/auction/${auction.id}`}
                      className={`px-6 py-2 font-bold text-sm rounded-lg transition-all shadow-sm ${isSell ? "bg-primary hover:bg-primary-dark text-white shadow-primary/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                        }`}
                    >
                      {isSell ? "View Bid" : "View Request"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-12 flex flex-col items-center">
          <button
            className="group flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-semibold hover:border-primary/50 hover:text-primary transition-all shadow-sm"
          >
            <span>Load More Auctions</span>
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">keyboard_double_arrow_down</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
