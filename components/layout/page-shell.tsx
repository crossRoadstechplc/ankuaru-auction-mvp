import * as React from "react"
import { cn } from "@/lib/utils"

export type PageShellProps = React.HTMLAttributes<HTMLDivElement>

const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-background text-foreground flex flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageShell.displayName = "PageShell"

export { PageShell }
