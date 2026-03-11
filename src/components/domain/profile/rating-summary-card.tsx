import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface RatingSummaryCardProps {
  averageRating?: number | string | null
  reviewCount?: number
  className?: string
}

function StarBar({ filled }: { filled: boolean }) {
  return (
    <span className={cn("material-symbols-outlined text-xl", filled ? "text-yellow-500" : "text-muted")}>
      {filled ? "star" : "star_border"}
    </span>
  )
}

export function RatingSummaryCard({ averageRating, reviewCount = 0, className }: RatingSummaryCardProps) {
  const rating = parseFloat(String(averageRating || 0))
  const rounded = Math.round(rating)

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Seller Rating
        </h3>
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl font-black text-foreground">{rating > 0 ? rating.toFixed(1) : "—"}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarBar key={i} filled={i <= rounded} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
