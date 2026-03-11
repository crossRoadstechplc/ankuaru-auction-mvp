"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface FeedFiltersSidebarProps {
  activeCategory: string;
  activeStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  auctionCounts?: {
    all: number;
    public: number;
    followers: number;
    custom: number;
  };
}

const categories = [
  { value: "all", label: "All Auctions", icon: "grid_view" },
  { value: "public", label: "Public", icon: "public" },
  { value: "followers", label: "Following", icon: "people" },
  { value: "custom", label: "Private", icon: "lock" },
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "REVEAL", label: "Reveal" },
  { value: "CLOSED", label: "Closed" },
];

export function FeedFiltersSidebar({
  activeCategory,
  activeStatus,
  onCategoryChange,
  onStatusChange,
  auctionCounts,
}: FeedFiltersSidebarProps) {
  return (
    <Card className="p-4 h-fit sticky top-6 border-border/50 transition-all duration-300 hover:shadow-lg">
      <h3 className="font-semibold text-foreground mb-4">Filters</h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Categories
        </h4>
        <div className="space-y-1">
          {categories.map((category) => (
            <label
              key={category.value}
              className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
            >
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={activeCategory === category.value}
                onChange={() => onCategoryChange(category.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary/20 transition-all duration-300"
              />
              <span className="material-symbols-outlined text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {category.icon}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground transition-colors duration-300">
                {category.label}
              </span>
              {auctionCounts && (
                <Badge
                  variant="secondary"
                  className="text-xs transition-all duration-300 hover:scale-110"
                >
                  {auctionCounts[
                    category.value as keyof typeof auctionCounts
                  ] || 0}
                </Badge>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Status
        </h4>
        <div className="space-y-1">
          {statuses.map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
            >
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={activeStatus === status.value}
                onChange={() => onStatusChange(status.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary/20 transition-all duration-300"
              />
              <span className="flex-1 text-sm font-medium text-foreground transition-colors duration-300">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}
