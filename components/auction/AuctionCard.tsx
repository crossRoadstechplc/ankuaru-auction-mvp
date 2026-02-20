"use client";

import Link from "next/link";

interface AuctionCardProps {
  id: string;
  title: string;
  region: string;
  type: string;
  currentBid: string;
  timeLeft: string;
  image: string;
  endingSoon?: boolean;
}

export default function AuctionCard({
  id,
  title,
  region,
  type,
  currentBid,
  timeLeft,
  image,
  endingSoon = false,
}: AuctionCardProps) {
  return (
    <Link href={`/auction/${id}`} className="group flex min-w-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-lg">
      <div className="relative h-44 w-full overflow-hidden bg-coffee-cream/20">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        ></div>
        <div className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          {region} • {type}
        </div>
      </div>
      <div className="p-5">
        <h4 className="mb-1 text-lg font-bold">{title}</h4>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Current Bid</span>
          <span className="text-xl font-black text-primary">{currentBid}</span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${endingSoon ? "bg-orange-500/10 text-orange-600" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
        >
          <span className="material-symbols-outlined text-sm">{endingSoon ? "bolt" : "schedule"}</span>
          {endingSoon ? `Ending Soon: ${timeLeft}` : `${timeLeft} left`}
        </div>
      </div>
    </Link>
  );
}
