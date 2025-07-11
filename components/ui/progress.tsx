import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { value?: number; max?: number }
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    data-slot="progress"
    className={cn(
      "bg-secondary relative h-2 w-full overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    <div
      data-slot="progress-bar"
      className="bg-primary h-full transition-all"
      style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }