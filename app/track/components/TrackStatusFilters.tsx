"use client";

import { Auction } from "@/lib/types";
import { Button } from "@/components/ui/button";

export type TrackStatusFilter = "ALL" | Auction["status"];

const TRACK_STATUS_FILTERS: Array<{
  value: TrackStatusFilter;
  label: string;
  icon: string;
}> = [
  { value: "ALL", label: "All", icon: "layers" },
  { value: "OPEN", label: "Live", icon: "gavel" },
  { value: "REVEAL", label: "Reveal", icon: "visibility" },
  { value: "SCHEDULED", label: "Scheduled", icon: "schedule" },
  { value: "CLOSED", label: "Closed", icon: "check_circle" },
];

interface TrackStatusFiltersProps {
  filterStatus: TrackStatusFilter;
  onFilterChange: (status: TrackStatusFilter) => void;
  totalTracked: number;
  statusCounts: Record<Auction["status"], number>;
}

export function TrackStatusFilters({
  filterStatus,
  onFilterChange,
  totalTracked,
  statusCounts,
}: TrackStatusFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRACK_STATUS_FILTERS.map((filter) => {
        const isSelected = filterStatus === filter.value;
        const count =
          filter.value === "ALL" ? totalTracked : statusCounts[filter.value];

        return (
          <Button
            key={filter.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              {filter.icon}
            </span>
            {filter.label} {count}
          </Button>
        );
      })}
    </div>
  );
}
