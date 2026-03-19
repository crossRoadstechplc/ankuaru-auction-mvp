"use client";

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
      <span className="material-symbols-outlined mt-0.5 text-base">error</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
