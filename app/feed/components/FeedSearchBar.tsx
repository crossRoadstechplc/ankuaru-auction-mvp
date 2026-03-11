"use client";

import { Input } from "@/components/ui/input";

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
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110">
              search
            </span>
            <Input
              type="text"
              placeholder="Search auctions, products, or categories"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 h-11 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/10 border-border/50 focus:border-primary"
              // TODO: Add debounced search for better performance
            />
          </div>
        </div>

        {/* Results Summary */}
        {resultCount !== undefined && !isLoading && (
          <div className="text-sm text-muted-foreground animate-in fade-in duration-300">
            {resultCount === 0 ? (
              <span className="text-destructive/80">No auctions found</span>
            ) : (
              <span className="font-medium">
                {resultCount} auction{resultCount !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-sm text-muted-foreground animate-pulse">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
}
