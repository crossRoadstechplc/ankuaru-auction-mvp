import * as React from "react";
import { cn } from "@/lib/utils";

interface PanelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  bodyClassName?: string;
}

export function PanelCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
  ...props
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl bg-card/95 ring-1 ring-black/[0.03] backdrop-blur-[2px]",
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-4 px-5 py-5 md:px-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn("p-5 md:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
