"use client";


interface BidActivityProps {
  data: any;
  isCreator: boolean;
}

export function BidActivity({ data, isCreator }: BidActivityProps) {
  const isSell = data.auctionType === "SELL";
  const sortedBids = [...(data.mockBids || [])].sort((a, b) =>
    isSell ? b.amountNum - a.amountNum : a.amountNum - b.amountNum
  );

  return (
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
  );
}
