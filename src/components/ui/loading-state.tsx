import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  type?: "card" | "list" | "detail" | "spinner"
  count?: number
  className?: string
}

export function LoadingState({ type = "spinner", count = 3, className }: LoadingStateProps) {
  // Simple Spinner
  if (type === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 w-full", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    )
  }

  // List Loading (Rows)
  if (type === "list") {
    return (
      <div className={cn("flex flex-col gap-5 w-full", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5"
          >
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex justify-between gap-2">
                <Skeleton className="h-4 w-2/5 max-w-[200px]" />
                <Skeleton className="h-3 w-14 shrink-0" />
              </div>
              <Skeleton className="h-3.5 w-full max-w-xl" />
              <Skeleton className="h-3.5 w-4/5 max-w-lg" />
              <Skeleton className="mt-1 h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Detail Page Loading
  if (type === "detail") {
    return (
      <div className={cn("flex flex-col gap-6 w-full", className)}>
        <Skeleton className="h-12 w-3/4 max-w-lg" />
        <Skeleton className="h-4 w-1/4" />
        
        <div className="flex gap-6 mt-4">
          <Skeleton className="h-[400px] flex-[2] rounded-xl" />
          <Skeleton className="h-[400px] flex-1 rounded-xl" />
        </div>
      </div>
    )
  }

  // Card Loading (Default)
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
