"use client";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";

interface FeedSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultCount?: number;
  isLoading?: boolean;
}

export function FeedSearchBar({
  searchTerm,
  onSearchChange,
  resultCount,
  isLoading,
}: FeedSearchBarProps) {
  // We keep a stable layout to avoid "jumping" when users interact with the search
  // This provides the "consistency" requested.
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Stable Search Input with integrated Search Action button */}
        <div className="flex-1 transition-all duration-300">
          <SearchInput
            placeholder="Search auctions, brands, categories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange("")}
            isLoading={isLoading}
            showSearchButton={true} // Always show the search action button for "clik" consistency
            onSearch={(val) => console.log("Searching for:", val)}
            className="h-11 shadow-sm"
          />
        </div>

        {/* Stable "Post New" Action - Always visible to ensure layout consistency */}
        <div className="shrink-0">
          <Link href="/auction/new">
            <Button 
              className="h-11 gap-2 rounded-full font-bold bg-primary px-6 shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined fill-1 text-[20px]">add_circle</span>
              <span className="whitespace-nowrap text-sm">Post New Auction</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Results HUD - Stable positioning */}
      <div className="h-6 mt-3">
        {searchTerm && resultCount !== undefined && !isLoading && (
          <div className="px-1 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-500">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground/60">
              <div className="h-[2px] w-6 bg-primary/30 rounded-full" />
              {resultCount} {resultCount === 1 ? "match" : "matches"} found
            </div>
            
            {resultCount === 0 && (
              <span className="text-[10px] font-bold text-destructive/70 flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">info</span>
                 Try a different keyword
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
