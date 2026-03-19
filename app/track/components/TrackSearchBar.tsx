"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TrackSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isRefreshing: boolean;
  onRefresh: () => void | Promise<unknown>;
}

export function TrackSearchBar({
  searchTerm,
  onSearchChange,
  onClearSearch,
  isRefreshing,
  onRefresh,
}: TrackSearchBarProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
          search
        </span>
        <Input
          placeholder="Search auctions by title, category, creator, or description"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 pl-9 pr-10"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[18px]">
              close
            </span>
          </button>
        ) : null}
      </div>

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
  );
}
