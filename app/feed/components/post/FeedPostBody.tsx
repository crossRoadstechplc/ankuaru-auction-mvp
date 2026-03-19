"use client";

import { useState } from "react";

const PROPERTIES_TRUNCATE_LENGTH = 50;

interface FeedPostBodyProps {
  title: string;
  category?: string;
  productName?: string;
  region?: string;
  commodityType?: string;
  grade?: string;
  process?: string;
  transaction?: string;
  commodityBrand?: string;
  commodityClass?: string;
  commoditySize?: string;
}

export function FeedPostBody({
  title,
  category,
  productName,
  region,
  commodityType,
  grade,
  process,
  transaction,
  commodityBrand,
  commodityClass,
  commoditySize,
}: FeedPostBodyProps) {
  const [propertiesExpanded, setPropertiesExpanded] = useState(false);

  const propertySummary = [
    commodityType,
    grade ? `Grade ${grade}` : null,
    process,
    transaction,
    commodityBrand,
    commodityClass,
    commoditySize,
  ].filter((value): value is string => !!value);

  const propertiesValue = propertySummary.join(" / ");
  const propertiesTruncatable =
    propertiesValue.length > PROPERTIES_TRUNCATE_LENGTH;

  const detailBlocks = [
    {
      label: "Product",
      value: productName || "Unspecified",
      isProperties: false,
    },
    {
      label: "Category",
      value: category || "Unspecified",
      isProperties: false,
    },
    {
      label: "Origin",
      value: region || "Unspecified",
      isProperties: false,
    },
    propertySummary.length > 0
      ? {
          label: "Properties",
          value: propertiesValue,
          isProperties: true,
        }
      : null,
  ].filter(
    (
      detail,
    ): detail is {
      label: string;
      value: string;
      isProperties: boolean;
    } => detail !== null,
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h4 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
          {title}
        </h4>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        {detailBlocks.map((detail) => {
          const showTruncated =
            detail.isProperties &&
            propertiesTruncatable &&
            !propertiesExpanded;
          const displayValue = showTruncated
            ? `${detail.value.slice(0, PROPERTIES_TRUNCATE_LENGTH).trim()}…`
            : detail.value;

          return (
            <div
              key={detail.label}
              className={`rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3.5 transition-colors duration-200 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 ${
                detail.isProperties ? "sm:col-span-2 xl:col-span-2" : ""
              }`}
            >
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {detail.label}
              </div>
              <div className="mt-2 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
                {displayValue}
                {propertiesTruncatable && (
                  <button
                    type="button"
                    onClick={() =>
                      setPropertiesExpanded((prev) => !prev)
                    }
                    className="ml-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded transition-opacity duration-150 hover:opacity-80 active:opacity-70"
                  >
                    {propertiesExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
