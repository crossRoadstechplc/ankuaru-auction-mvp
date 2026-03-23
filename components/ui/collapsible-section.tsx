"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
  className,
  headerClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn("rounded-[14px] border border-slate-200/80 dark:border-slate-800", className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-4 py-3 text-left",
          "rounded-[14px] border-0 bg-slate-50/80 dark:bg-slate-800/50",
          headerClassName,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon ? (
            <span className="material-symbols-outlined text-primary text-base">
              {icon}
            </span>
          ) : null}
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </span>
          {badge}
        </div>
        <span
          className={cn(
            "material-symbols-outlined shrink-0 text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        >
          expand_more
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-slate-200/70 px-4 py-3 dark:border-slate-800">
          {children}
        </div>
      ) : null}
    </div>
  );
}
