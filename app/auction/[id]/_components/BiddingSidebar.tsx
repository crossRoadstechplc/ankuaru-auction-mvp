"use client";


interface BiddingSidebarProps {
  data: any;
  isCreator: boolean;
}

export function BiddingSidebar({ data, isCreator }: BiddingSidebarProps) {
  const isSell = data.auctionType === "SELL";
  const isClosed = data.status === "CLOSED";

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* Countdown Card */}
      <div className={`${isClosed ? "bg-slate-700" : "bg-primary dark:bg-primary/90"} rounded-xl p-6 text-white shadow-lg shadow-primary/20`}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
          {isClosed ? "Auction Ended" : "Auction Ends In"}
        </p>
        <div className="flex justify-between items-center text-center">
          <div><p className="text-2xl font-black">00</p><p className="text-[10px] font-bold uppercase">Days</p></div>
          <div className="text-2xl opacity-50 font-light">:</div>
          <div><p className="text-2xl font-black">{isClosed ? "00" : data.timeLeft.split('h')[0]}</p><p className="text-[10px] font-bold uppercase">Hours</p></div>
          <div className="text-2xl opacity-50 font-light">:</div>
          <div><p className="text-2xl font-black">{isClosed ? "00" : (data.timeLeft.split('h')[1]?.trim().split('m')[0] || "45")}</p><p className="text-[10px] font-bold uppercase">Mins</p></div>
        </div>
      </div>

      {!isCreator ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          {isClosed ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">event_busy</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bidding Closed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium"> This auction has officially concluded. No further bids are being accepted. </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Winning Bid</p>
                <p className="text-2xl font-black text-primary">{data.currentBid}</p>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Administrator Notice</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isClosed ? "This auction is closed. You can view the final reports or relist the item." : "Bidding is disabled for creators. Use the actions below to manage your listing."}
            </p>
          </div>
          <div className="space-y-3">
            {!isClosed ? (
              <>
                <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Modify Auction
                </button>
                <button className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">block</span>
                  Close Early
                </button>
              </>
            ) : (
              <>
                <button className="w-full py-4 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">description</span>
                  View Final Report
                </button>
                <button className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Relist Item
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
