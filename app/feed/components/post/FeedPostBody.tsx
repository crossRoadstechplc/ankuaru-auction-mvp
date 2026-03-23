"use client";

interface FeedPostBodyProps {
  title: string;
  productName?: string;
  region?: string;
  grade?: string;
}

export function FeedPostBody({
  title,
  productName,
  region,
  grade,
}: FeedPostBodyProps) {
  const subtitle: string[] = [];
  if (region) subtitle.push(region);
  if (grade) subtitle.push(`Grade ${grade}`);
  const displayTitle = productName
    ? subtitle.length > 0
      ? `${productName} (${subtitle.join(", ")})`
      : productName
    : title;

  return (
    <h4 className="line-clamp-2 text-card-title font-bold leading-snug text-slate-900 dark:text-white">
      {displayTitle}
    </h4>
  );
}
