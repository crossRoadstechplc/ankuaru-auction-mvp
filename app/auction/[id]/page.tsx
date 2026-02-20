"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const AUCTION_DETAILS: Record<string, any> = {
  "1": {
    product_name: "Sidama Bensa G1 Natural",
    region: "Bensa, Sidama",
    type: "Arabica - Heirloom",
    auctionType: "SELL",
    grade: "Grade 1",
    process: "Natural/Dry",
    class: "Micro-lot Specialty",
    measurement: "Per KG",
    quantity: "600",
    initialBid: "$42.00",
    currentBid: "$48.50",
    totalBids: 15,
    timeLeft: "03h 15m",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQKmgkx0SFK6tKM8vtpCys-ZM4Qt3xCdbC0WmsJMNauDFINGlNGtscIHz9HeEbDmxayTen-d2MOPUgYYSuLyydvt-8c1YzK0Jk_1zzBU9swz_9kSF2oXyiVrq_Lc7DEUZIoJICP5tiB1BIF7NatksENCsyOHx4lhaVGBWaejO1qV6nUNFSsl5i58dXFr_IbrUGW4tWhxnPy0UR1_mrFMO7QVOXmzDtyjnG2MriVeJIISNt96dGz86R2NM_UWBftRHMTVw5WXdXQtw",
    mockBids: [
      { name: "Participant #15", amount: "$48.50", amountNum: 48.5, time: "1m ago" },
      { name: "Participant #4", amount: "$46.00", amountNum: 46, time: "12m ago" },
      { name: "Participant #9", amount: "$44.50", amountNum: 44.5, time: "45m ago" },
    ]
  },
  "2": {
    product_name: "Guji Hambela G1 Washed",
    region: "Hambela, Guji",
    type: "Arabica - 74110",
    auctionType: "SELL",
    grade: "Grade 1",
    process: "Washed",
    class: "Specialty Selection",
    measurement: "Per KG",
    quantity: "450",
    initialBid: "$39.00",
    currentBid: "$41.20",
    totalBids: 8,
    timeLeft: "05h 45m",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD5V6sDurw44zKJe-MtKQQpTJ6P-g6verGYFHSD6gv-fcz6JZEO2x4A9nyC1MA249IX8RcdZhJFSfofOfWtmAe4AhLuJC35u_wUNRsr5dYMG3ynRfud19Fpb0SUaz3JZ1hDTSOsFqoEtcywNLXIBJ1jj1h5zyXvNH_pU9ZoHlcN92vocd-mqIpjq2uBTDQUDvW2TIqqlQqMc8f0BEzdgjcDQjQqH-2hodEqYJLAZdZJZJzg0ckh5GOBbkYIKihuYAP8-amLHtOm78",
    mockBids: [
      { name: "Participant #8", amount: "$41.20", amountNum: 41.2, time: "3m ago" },
      { name: "Participant #2", amount: "$40.50", amountNum: 40.5, time: "20m ago" },
    ]
  },
  "3": {
    product_name: "Yirgacheffe Kochere G1",
    region: "Kochere, Yirgacheffe",
    type: "Arabica - Heirloom",
    auctionType: "SELL",
    grade: "Grade 1",
    process: "Washed",
    class: "Rare Micro-lot",
    measurement: "Per KG",
    quantity: "200",
    initialBid: "$45.00",
    currentBid: "$52.00",
    totalBids: 22,
    timeLeft: "01h 10m",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC4Qd7Ev65ZXqIUWKF6A-hoaoxnNWeIBQf7WEV2qNkX3Zh8_WETsHNI_YiJdQGwt6NzK8MkEewSObvIS9HJxV_FcZ9CRgpPeE0kGIO5VSqQfsIKMiDOYb1JQ2EBV8VPmEtOt3aIQcD5pb8p-U5oMr8YfysTr9rZK-_aJ3qTzynhofM0mBwnKb5ZgV4POMccwvKlMv3D-sSMUzIOb5Z9zTGpTHkSZTnPSw9k0KGnIYCrPx7t51WMxxHM2XPbMKwhKn2BdBvi3m3rv8",
    mockBids: [
      { name: "Participant #22", amount: "$52.00", amountNum: 52, time: "1m ago" },
      { name: "Participant #15", amount: "$50.50", amountNum: 50.5, time: "10m ago" },
    ]
  },
  "4": {
    product_name: "Harrar Golden Horse G4",
    region: "Harrar Highlands",
    type: "Arabica - Harrar",
    auctionType: "BUY",
    grade: "Grade 4",
    process: "Natural",
    class: "Commercial Bulk",
    measurement: "Per 100KG",
    quantity: "25000",
    initialBid: "$320.00",
    currentBid: "$295.00",
    totalBids: 12,
    timeLeft: "2d 04h",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCeeIR2t3UCjZvsBYbS2bw5OBYMNth821FiJZcdYMYrdPYn1R4JCQhh3w39_0xBQEOQqGrXIa_m66bh99AdNuFBWBpbmwHU88uB1GG6P6YUP8FcTagRQ37HY5VuDen4FiwDuR-eRXEXo_NTBxsT0E3aNqbxndp73pjdfcClaJTGbkewErq-9AmflJVNoZwrsd9NfyOxIcMmeMdHpC7RMV88B3aWEQH5KSv0wvvyTjRn8IC4n65PChc1qiw_DwW-hh9xGQ7JlB9cJc",
    mockBids: [
      { name: "Exporter X", amount: "$295.00", amountNum: 295, time: "5m ago" },
      { name: "Exporter Y", amount: "$305.00", amountNum: 305, time: "1h ago" },
    ]
  }
};

function AuctionDetailContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const isCreator = searchParams.get("view") === "creator";

  const data = AUCTION_DETAILS[id] || AUCTION_DETAILS["1"];
  const isSell = data.auctionType === "SELL";

  // Sort bids: High-to-Low for SELL, Low-to-High for BUY
  const sortedBids = [...(data.mockBids || [])].sort((a, b) =>
    isSell ? b.amountNum - a.amountNum : a.amountNum - b.amountNum
  );

  return (
    <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {isCreator && (
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs bg-primary/10 w-fit px-3 py-1.5 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span> Creator Control Panel
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${isSell ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}>
            <span className="material-symbols-outlined text-sm">{isSell ? "sell" : "shopping_cart"}</span>
            {isSell ? "Auction Sale" : "Purchase Request"}
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
          <Link className="text-slate-400 hover:text-primary" href="/feed">
            Auctions
          </Link>
          <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
          <span className="text-slate-900 dark:text-white">{data.product_name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Product Details Card */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="aspect-video relative overflow-hidden group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={data.image}
                  alt={data.product_name}
                />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Live Auction
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                      {data.product_name}
                    </h1>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6 font-display">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Initial Bid</span>
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{data.initialBid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Current Bid</span>
                        <span className="text-xl font-black text-primary">{data.currentBid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bids</span>
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{data.totalBids}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Remaining Time</span>
                        <span className="text-lg font-bold text-red-500">{data.timeLeft}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-400 text-sm">
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-primary">location_on</span> {data.region}</span>
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-primary">settings_input_component</span> {data.process}</span>
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-primary">weight</span> {data.quantity} {data.measurement} Available</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Auction ID</p>
                    <p className="text-slate-900 dark:text-white font-mono font-bold">ANK-{id}000</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                  <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Grade</p>
                    <p className="text-slate-900 dark:text-white font-bold">{data.grade}</p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Type</p>
                    <p className="text-slate-900 dark:text-white font-bold">{data.type}</p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Class</p>
                    <p className="text-slate-900 dark:text-white font-bold">{data.class}</p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Process</p>
                    <p className="text-slate-900 dark:text-white font-bold">{data.process}</p>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Product Description</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Detailed analysis shows this {data.product_name} meets all {data.class} standards from the {data.region} region.
                    The {data.process} process has been meticulously verified for quality consistency.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                      <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEL3JznzjN6iUX0D67XTtgzANPnkjqgOIK5BT5ziWBJLw1-sYbpqlyiM3pwrclsCupzntD39hXadkIvYCHwKmA9-0a9rSBf3BoPgAgYnkp_xwaHfulNXM5RY2Yy5BiQMdDQ9s_VEz4VAtX9_0MR1zWs5ZcIECOTdJ-_RTjp6t556DvwtQzjmjog3fu5vm_u5UkqZcTlsU0eAO2uY28QOeJU15YKDYVaqROz2oYXDzOYMHOXKhCfUKg6owVPvedV0Td0_2uGYNn1oE"
                        alt="Creator"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Verified Producer</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Ankuaru Partner <span className="text-yellow-500 ml-1">★ 4.9</span>
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all">
                    Contact Sourcing
                  </button>
                </div>
              </div>
            </section>

            {/* Bid Activity / Management */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {isCreator ? (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">analytics</span>
                      Participants Log <span className="text-sm font-normal text-slate-400">({data.totalBids} responses)</span>
                    </h3>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                      Sorted by: <span className="text-primary">{isSell ? "Highest Price" : "Lowest Price"}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Bidder ID</th>
                          <th className="px-6 py-4">Offer Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sortedBids.map((bid, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{bid.name}</span>
                                <span className="material-symbols-outlined text-xs text-blue-500">verified</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-bold ${idx === 0 ? "text-primary scale-110 origin-left inline-block" : "text-slate-600 dark:text-slate-300"}`}>
                                {bid.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${idx === 0 ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                {idx === 0 ? (isSell ? "TOP BID" : "BEST OFFER") : "QUEUED"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-xs font-black text-primary hover:underline uppercase tracking-tighter">Manage</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">shield_person</span>
                  </div>
                  <h4 className="text-lg font-bold mb-1">Bidder Confidentiality</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Personalized logs and bidder identities are encrypted. You can only see your own activity and the collective total of <span className="font-bold text-primary">{data.totalBids} bids</span>.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Bidding Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-primary dark:bg-primary/90 rounded-xl p-6 text-white shadow-lg shadow-primary/20">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Auction Ends In</p>
              <div className="flex justify-between items-center text-center">
                <div><p className="text-2xl font-black">00</p><p className="text-[10px] font-bold uppercase">Days</p></div>
                <div className="text-2xl opacity-50 font-light">:</div>
                <div><p className="text-2xl font-black">{data.timeLeft.split('h')[0]}</p><p className="text-[10px] font-bold uppercase">Hours</p></div>
                <div className="text-2xl opacity-50 font-light">:</div>
                <div><p className="text-2xl font-black">{data.timeLeft.split('h')[1]?.trim().split('m')[0] || "45"}</p><p className="text-[10px] font-bold uppercase">Mins</p></div>
              </div>
            </div>

            {!isCreator ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="mb-8">
                  <p className="text-sm text-slate-400 font-bold uppercase mb-1">Current Bid</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{data.currentBid}</p>
                    <span className="text-xs font-bold text-slate-400 uppercase">{data.measurement}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">
                      {isSell ? "Your New Bid" : "Your Lower Offer"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-0 text-xl font-bold transition-all"
                        type="number"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/30 transition-all uppercase tracking-widest active:scale-[0.98]">
                    {isSell ? "Submit Higher Bid" : "Submit Better Offer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Administrator Notice</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bidding is disabled for creators. Use the actions below to manage your listing.
                  </p>
                </div>
                <div className="space-y-3">
                  <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Modify Auction
                  </button>
                  <button className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">block</span>
                    Close Early
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-10 px-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">© 2024 Ankuaru Specialty Coffee Marketplace</p>
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
