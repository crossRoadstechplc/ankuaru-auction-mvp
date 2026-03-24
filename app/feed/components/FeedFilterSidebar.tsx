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
  onCollapse?: () => void;
  categories: FeedFilterOption[];
  statuses: FeedFilterOption[];
  quantityRanges: FeedFilterOption[];
  priceRanges: FeedFilterOption[];
  origins: FeedFilterOption[];
  lotTypes: FeedFilterOption[];
  selectedCategories: string[];
  selectedStatuses: string[];
  selectedQuantityRanges: string[];
  selectedPriceRanges: string[];
  selectedOrigins: string[];
  selectedLotTypes: string[];
  onToggleCategory: (categoryId: string) => void;
  onToggleStatus: (statusId: string) => void;
  onToggleQuantityRange: (quantityRangeId: string) => void;
  onTogglePriceRange: (priceRangeId: string) => void;
  onToggleOrigin: (originId: string) => void;
  onToggleLotType: (lotTypeId: string) => void;
  onClearAll: () => void;
}

type FilterSectionProps = {
  title: string;
  options: FeedFilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

function FilterSection({
  title,
  options,
  selectedValues,
  onToggle,
}: FilterSectionProps) {
  return (
    <section className="space-y-1.5">
      <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>

      <div className="space-y-0.5">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.id);
          const isDisabled = option.disabled || option.count === 0;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-[13px] transition-colors ${
                isDisabled
                  ? "cursor-not-allowed text-slate-400 opacity-50 dark:text-slate-500"
                  : isChecked
                    ? "bg-slate-900 font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => onToggle(option.id)}
                  className="h-3.5 w-3.5 rounded border-slate-400 text-slate-900 focus:ring-slate-400"
                />
                <span className="truncate">{option.label}</span>
              </div>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  isChecked
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
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
  onCollapse,
  categories,
  statuses,
  quantityRanges,
  priceRanges,
  origins,
  lotTypes,
  selectedCategories,
  selectedStatuses,
  selectedQuantityRanges,
  selectedPriceRanges,
  selectedOrigins,
  selectedLotTypes,
  onToggleCategory,
  onToggleStatus,
  onToggleQuantityRange,
  onTogglePriceRange,
  onToggleOrigin,
  onToggleLotType,
  onClearAll,
}: FeedFilterSidebarProps) {
  return (
    <Card className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-none border-0 bg-white shadow-none dark:bg-slate-950 max-xl:h-full max-xl:max-h-full max-xl:rounded-l-2xl max-xl:border-l max-xl:border-slate-200/80 xl:h-auto xl:max-h-none xl:rounded-xl xl:border xl:border-slate-200/60 xl:shadow-sm xl:overflow-visible dark:max-xl:border-slate-800 dark:xl:border-slate-800">
      <div className="border-b border-slate-200/60 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Filters
          </span>
          <div className="flex items-center gap-1">
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Hide filters"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          ) : null}
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded px-2 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              Clear
            </button>
          ) : null}
          </div>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-3 max-xl:min-h-0 max-xl:flex-1 max-xl:overflow-y-auto max-xl:overscroll-y-contain xl:p-4">
        <FilterSection
          title="Category"
          options={categories}
          selectedValues={selectedCategories}
          onToggle={onToggleCategory}
        />

        <FilterSection
          title="Status"
          options={statuses}
          selectedValues={selectedStatuses}
          onToggle={onToggleStatus}
        />

        <FilterSection
          title="Lot type"
          options={lotTypes}
          selectedValues={selectedLotTypes}
          onToggle={onToggleLotType}
        />

        <FilterSection
          title="Quantity"
          options={quantityRanges}
          selectedValues={selectedQuantityRanges}
          onToggle={onToggleQuantityRange}
        />

        <FilterSection
          title="Price"
          options={priceRanges}
          selectedValues={selectedPriceRanges}
          onToggle={onTogglePriceRange}
        />

        <FilterSection
          title="Origin"
          options={origins}
          selectedValues={selectedOrigins}
          onToggle={onToggleOrigin}
        />
      </div>
    </Card>
  );
}
