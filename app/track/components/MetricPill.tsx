"use client";

/**
 * Metric pill for auction cards. Uses consistent label typography per FeedPostMeta.
 */
export function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
