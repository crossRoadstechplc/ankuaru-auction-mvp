"use client";

import { Card } from "@/components/ui/card";

export type FeedFilterOption = {
  id: string;
  label: string;
  count: number;
  disabled?: boolean;
};

interface FeedFilterSidebarProps {
  totalCount: number;
  resultCount: number;
  activeFilterCount: number;
  categories: FeedFilterOption[];
  statuses: FeedFilterOption[];
  quantityRanges: FeedFilterOption[];
  selectedCategories: string[];
  selectedStatuses: string[];
  selectedQuantityRanges: string[];
  onToggleCategory: (categoryId: string) => void;
  onToggleStatus: (statusId: string) => void;
  onToggleQuantityRange: (quantityRangeId: string) => void;
  onClearAll: () => void;
}

type FilterSectionProps = {
  title: string;
  subtitle: string;
  options: FeedFilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

function FilterSection({
  title,
  subtitle,
  options,
  selectedValues,
  onToggle,
}: FilterSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.id);
          const isDisabled = option.disabled || option.count === 0;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-all ${
                isDisabled
                  ? "cursor-not-allowed border-slate-200/70 bg-slate-100/70 opacity-60 dark:border-slate-800 dark:bg-slate-900/60"
                  : isChecked
                    ? "border-primary/40 bg-primary/5"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900/70"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => onToggle(option.id)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {option.label}
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {option.count}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export function FeedFilterSidebar({
  totalCount,
  resultCount,
  activeFilterCount,
  categories,
  statuses,
  quantityRanges,
  selectedCategories,
  selectedStatuses,
  selectedQuantityRanges,
  onToggleCategory,
  onToggleStatus,
  onToggleQuantityRange,
  onClearAll,
}: FeedFilterSidebarProps) {
  return (
    <Card className="overflow-hidden rounded-[16px] border border-slate-200/80 bg-white shadow-[0_28px_90px_-60px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950 xl:flex xl:max-h-[calc(100vh-7rem)] xl:flex-col">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(255,255,255,0)_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(148,163,184,0.12)_0%,rgba(15,23,42,0)_100%)]">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">tune</span>
              Market Filters
            </div>
            
          </div>

          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-6 p-5 xl:min-h-0 xl:overflow-y-auto">
        <FilterSection
          title="Category"
          subtitle=""
          options={categories}
          selectedValues={selectedCategories}
          onToggle={onToggleCategory}
        />

        <FilterSection
          title="Status"
          subtitle=""
          options={statuses}
          selectedValues={selectedStatuses}
          onToggle={onToggleStatus}
        />

        <FilterSection
          title="Quantity"
          subtitle=""
          options={quantityRanges}
          selectedValues={selectedQuantityRanges}
          onToggle={onToggleQuantityRange}
        />

        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-4 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          Search in the top bar already matches title, product name, creator,
          commodity details, and description. Use this sidebar to tighten the
          live result set.
        </div>
      </div>
    </Card>
  );
}
