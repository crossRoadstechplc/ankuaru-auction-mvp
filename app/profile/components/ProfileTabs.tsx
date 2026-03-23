"use client";

import { cn } from "@/lib/utils";

export type ProfileTab =
  | "auctions"
  | "followers"
  | "following"
  | "requests"
  | "blocked";

export type PublicProfileTab = "auctions" | "followers" | "following";

interface TabConfig<T extends string = ProfileTab> {
  id: T;
  label: string;
  count?: number;
}

interface ProfileTabsProps<T extends string = ProfileTab> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: TabConfig<T>[];
  className?: string;
}

export function ProfileTabs<T extends string = ProfileTab>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: ProfileTabsProps<T>) {
  return (
    <nav
      className={cn(
        "border-b border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
      aria-label="Profile sections"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex gap-6 overflow-x-auto" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary dark:border-primary dark:text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 ? (
                  <span className="ml-1.5 text-slate-500 dark:text-slate-400">
                    ({tab.count})
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
