import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, as: Component = "main", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "mx-auto w-full max-w-[1280px] px-4 md:px-6 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
PageContainer.displayName = "PageContainer"

export { PageContainer }
