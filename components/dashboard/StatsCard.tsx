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
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor}`}>
        {typeof icon === "string" ? (
          <span className="material-symbols-outlined">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
