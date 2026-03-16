"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MarketMetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  accentClassName?: string;
}

export default function MarketMetricCard({
  label,
  value,
  description,
  icon,
  accentClassName = "bg-primary/10 text-primary",
}: MarketMetricCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            accentClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
