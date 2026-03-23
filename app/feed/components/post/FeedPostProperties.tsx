"use client";

interface FeedPostPropertiesProps {
  category?: string;
  commodityType?: string;
  process?: string;
  transaction?: string;
  commodityBrand?: string;
  commodityClass?: string;
  commoditySize?: string;
}

export function FeedPostProperties({
  category,
  commodityType,
  process,
  transaction,
  commodityBrand,
  commodityClass,
  commoditySize,
}: FeedPostPropertiesProps) {
  const chips = [
    category || "Unspecified",
    commodityType,
    process,
    transaction,
    commodityBrand,
    commodityClass,
    commoditySize,
  ].filter((v): v is string => !!v);

  if (chips.length === 0) return null;

  return (
    <p className="text-card-body font-medium text-slate-700 dark:text-slate-300">
      {chips.slice(0, 4).join(" · ")}
      {chips.length > 4 ? ` · +${chips.length - 4}` : ""}
    </p>
  );
}
