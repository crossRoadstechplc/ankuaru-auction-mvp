"use client";

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function StatsCard({
  label,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  iconTextColor = "text-primary",
}: StatsCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm transition-colors hover:bg-muted/20">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor}`}
      >
        {typeof icon === "string" ? (
          <span className="material-symbols-outlined">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
