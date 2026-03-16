"use client";

import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import Link from "next/link";
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

  return (
    <section className="mb-6 rounded-[16px] border border-border/70 bg-card/95 p-3 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.3)] backdrop-blur supports-[backdrop-filter]:bg-card/90 md:p-1">
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar
          src={avatarUrl}
          name={personaName}
          size="md"
          className="ring-2 ring-background"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {personaName}
          </p>
          {username ? (
            <p className="truncate text-xs text-muted-foreground">
              @{username}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-around gap-x-1 gap-y-2 border-t border-border/70 pt-3">
        <Link
          href={isAuthenticated ? "/auction/new?tab=sell" : "/login"}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
        >
          <span className="material-symbols-outlined text-[18px]">sell</span>
          <span>Sell Auction</span>
        </Link>

        <Link
          href={isAuthenticated ? "/auction/new?tab=buy" : "/login"}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/20"
        >
          <span className="material-symbols-outlined text-[18px]">
            shopping_cart
          </span>
          <span>Buy Auction</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            toast("RFQ/IOI is coming soon.");
          }}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/20"
        >
          <span className="material-symbols-outlined text-[18px]">
            request_quote
          </span>
          <span>RFQ / IOI</span>
          <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
            Soon
          </span>
        </button>
      </div>

      <div className="mt-3 h-5 px-1">
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
