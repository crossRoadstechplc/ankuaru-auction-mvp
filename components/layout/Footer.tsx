"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-8">
      <div className="mx-auto max-w-[1200px] px-4 md:px-40 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-slate-500">© 2026 Ankuaru Coffee Auctions. All rights reserved.</p>
        <div className="flex gap-6">
          <Link className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest" href="#">
            Marketplace
          </Link>
          <Link className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest" href="#">
            Support
          </Link>
          <Link className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest" href="#">
            Settings
          </Link>
        </div>
      </div>
    </footer>
  );
}
