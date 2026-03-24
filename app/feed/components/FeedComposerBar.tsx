"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface FeedComposerBarProps {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  isAuthenticated: boolean;
  searchTerm: string;
  resultCount?: number;
  isLoading?: boolean;
}

type PostFlow = "sell" | "buy" | null;

export function FeedComposerBar({
  displayName,
  username,
  avatarUrl,
  isAuthenticated,
  searchTerm,
  resultCount,
  isLoading,
}: FeedComposerBarProps) {
  const personaName = displayName || username || "Marketplace user";
  const searchLabel = searchTerm.trim();
  const [postFlow, setPostFlow] = useState<PostFlow>(null);

  const toggleSell = () => {
    setPostFlow((p) => (p === "sell" ? null : "sell"));
  };
  const toggleBuy = () => {
    setPostFlow((p) => (p === "buy" ? null : "buy"));
  };

  const lotChoiceClass =
    "inline-flex items-center justify-center rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary/50";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="p-3 md:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserAvatar
              src={avatarUrl}
              name={personaName}
              size="sm"
              className="size-9 ring-1 ring-slate-200/80 dark:ring-slate-700"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {personaName}
              </p>
              {username ? (
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  @{username}
                </p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Auctions & bids in dashboard.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1.5 rounded-lg border-slate-200/80 px-2.5 text-xs dark:border-slate-700"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  <span className="material-symbols-outlined text-sm">
                    dashboard
                  </span>
                  Dashboard
                </Link>
              </Button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={toggleSell}
                  aria-expanded={postFlow === "sell"}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-700 transition-colors dark:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <span className="material-symbols-outlined text-sm">sell</span>
                  Sell
                  <span className="material-symbols-outlined text-[14px] opacity-70">
                    {postFlow === "sell" ? "expand_less" : "expand_more"}
                  </span>
                </button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <Link href="/login">
                    <span className="material-symbols-outlined text-sm">sell</span>
                    Sell
                  </Link>
                </Button>
              )}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={toggleBuy}
                  aria-expanded={postFlow === "buy"}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-sky-500/10 px-2.5 text-xs font-semibold text-sky-700 transition-colors dark:bg-sky-500/20 dark:text-sky-400"
                >
                  <span className="material-symbols-outlined text-sm">
                    shopping_cart
                  </span>
                  Buy
                  <span className="material-symbols-outlined text-[14px] opacity-70">
                    {postFlow === "buy" ? "expand_less" : "expand_more"}
                  </span>
                </button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-lg bg-sky-500/10 px-2.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-400"
                >
                  <Link href="/login">
                    <span className="material-symbols-outlined text-sm">
                      shopping_cart
                    </span>
                    Buy
                  </Link>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toast("RFQ/IOI is coming soon.")}
                className="h-7 gap-1 rounded-lg bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              >
                <span className="material-symbols-outlined text-sm">
                  request_quote
                </span>
                RFQ
                <span className="rounded bg-amber-200/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800 dark:bg-amber-900/50 dark:text-amber-100">
                  Soon
                </span>
              </Button>
            </div>

            {isAuthenticated && postFlow === "sell" ? (
              <div className="flex w-full flex-col gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50 sm:min-w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Sell · Lot type
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/auction/new?tab=sell&lotType=FLEXIBLE"
                    className={lotChoiceClass}
                    onClick={() => setPostFlow(null)}
                  >
                    Flexible lot
                  </Link>
                  <Link
                    href="/auction/new?tab=sell&lotType=SEALED"
                    className={lotChoiceClass}
                    onClick={() => setPostFlow(null)}
                  >
                    Sealed lot
                  </Link>
                </div>
              </div>
            ) : null}

            {isAuthenticated && postFlow === "buy" ? (
              <div className="flex w-full flex-col gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50 sm:min-w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Buy request · Lot type
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/auction/new?tab=buy&lotType=FLEXIBLE"
                    className={lotChoiceClass}
                    onClick={() => setPostFlow(null)}
                  >
                    Flexible lot
                  </Link>
                  <Link
                    href="/auction/new?tab=buy&lotType=SEALED"
                    className={lotChoiceClass}
                    onClick={() => setPostFlow(null)}
                  >
                    Sealed lot
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/50 px-3 pb-3 pt-2 md:px-4">
        {searchLabel && resultCount !== undefined && !isLoading ? (
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-7 rounded-full bg-primary/35" />
              {resultCount} {resultCount === 1 ? "match" : "matches"} for{" "}
              <span className="normal-case text-foreground">
                &ldquo;{searchLabel}&rdquo;
              </span>
            </div>
            {resultCount === 0 ? (
              <span className="text-destructive/80">Try another keyword</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
