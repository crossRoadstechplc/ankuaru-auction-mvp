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
    <div className="flex items-center gap-4 rounded-xl bg-card/95 p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor} ${iconTextColor}`}
      >
        {typeof icon === "string" ? (
          <span className="material-symbols-outlined">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
