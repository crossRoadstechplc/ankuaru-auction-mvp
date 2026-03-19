"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/layout/page-section";
import Link from "next/link";

interface TrackHeroSectionProps {
  activeCount: number;
  scheduledCount: number;
  closedCount: number;
  totalTracked: number;
  isRefreshing: boolean;
  onRefresh: () => void | Promise<unknown>;
}

export function TrackHeroSection({
  activeCount,
  scheduledCount,
  closedCount,
  totalTracked,
  isRefreshing,
  onRefresh,
}: TrackHeroSectionProps) {
  return (
    <PageSection>
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,rgba(61,127,93,0.12),rgba(255,255,255,0.94),rgba(75,147,108,0.08))] p-6 md:p-8 dark:border-primary/20 dark:bg-[linear-gradient(135deg,rgba(17,33,20,0.96),rgba(28,46,31,0.9),rgba(9,17,10,0.96))]">
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-warning/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="space-y-5">
            <Badge
              variant="coffee"
              className="w-fit gap-2 px-3 py-1 text-xs uppercase tracking-[0.14em]"
            >
              <span className="material-symbols-outlined text-xs">
                track_changes
              </span>
              Auction watchtower
            </Badge>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Stay on top of live lots, future openings, and final winners.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Use the tracker to scan every auction at a glance, narrow the
                board by phase, and jump straight into a lot when you already
                have the ID.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="success" className="px-3 py-1">
                {activeCount} live right now
              </Badge>
              <Badge variant="warning" className="px-3 py-1">
                {scheduledCount} scheduled
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {closedCount} closed
              </Badge>
              <Badge variant="coffee" className="px-3 py-1">
                {totalTracked} total tracked
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2">
                <Link href="/feed">
                  <span className="material-symbols-outlined text-sm">
                    storefront
                  </span>
                  Browse feed
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => void onRefresh()}
                disabled={isRefreshing}
                className="gap-2"
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  refresh
                </span>
                Refresh board
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/95 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Quick workflow
                </p>
                <h3 className="mt-1 text-lg font-bold text-foreground">
                  How to use the board
                </h3>
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-[11px]">
                {totalTracked} items
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  title: "Scan the board",
                  description:
                    "Search by title, category, description, or creator to shrink the list fast.",
                },
                {
                  title: "Filter the phase",
                  description:
                    "Use the phase chips to isolate live, reveal, scheduled, or closed lots.",
                },
                {
                  title: "Lookup by ID",
                  description:
                    "Paste a UUID into the tracker panel below to jump straight into one auction.",
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
