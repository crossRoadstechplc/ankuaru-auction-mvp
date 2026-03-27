"use client";

import { Button } from "@/components/ui/button";

interface ProfilePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function ProfilePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "items",
}: ProfilePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {startItem}-{endItem} of {totalItems} {itemLabel}
      </p>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 rounded-lg"
        >
          Previous
        </Button>

        <span className="min-w-[5.5rem] text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
          Page {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
