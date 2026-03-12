import * as React from "react"
import { cn } from "@/lib/utils"

export type PageSectionProps = React.HTMLAttributes<HTMLElement>

const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("flex flex-col gap-4 w-full", className)}
        {...props}
      >
        {children}
      </section>
    )
  }
)
PageSection.displayName = "PageSection"

export { PageSection }
