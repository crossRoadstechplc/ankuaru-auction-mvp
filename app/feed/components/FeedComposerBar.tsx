"use client";

import { Button } from "@/components/ui/button";
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
    <section className="mb-6 overflow-hidden rounded-[18px] border border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <UserAvatar
              src={avatarUrl}
              name={personaName}
              size="md"
              className="ring-2 ring-background"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {personaName}
              </p>
              {username ? (
                <p className="truncate text-xs text-muted-foreground">
                  @{username}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                Your auctions, bids, and requests live in the dashboard list.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 rounded-full border-border/70 bg-background/80"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <span className="material-symbols-outlined text-sm">
                dashboard
              </span>
              Open dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <Link href={isAuthenticated ? "/auction/new?tab=sell" : "/login"}>
              <span className="material-symbols-outlined text-[18px]">sell</span>
              Sell
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="justify-center rounded-2xl border border-sky-500/15 bg-sky-500/5 px-3 py-2 text-sm font-semibold text-sky-700 transition-all hover:-translate-y-0.5 hover:border-sky-500/25 hover:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-950/20"
          >
            <Link href={isAuthenticated ? "/auction/new?tab=buy" : "/login"}>
              <span className="material-symbols-outlined text-[18px]">
                shopping_cart
              </span>
              Buy
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              toast("RFQ/IOI is coming soon.");
            }}
            className="justify-center rounded-2xl border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300"
          >
            <span className="material-symbols-outlined text-[18px]">
              request_quote
            </span>
            RFQ / IOI
            <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
              Soon
            </span>
          </Button>
        </div>
      </div>

      <div className="h-5 px-4 pb-4 md:px-5">
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
