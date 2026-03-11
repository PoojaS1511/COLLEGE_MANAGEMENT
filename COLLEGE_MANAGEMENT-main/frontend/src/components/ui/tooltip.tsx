import * as React from "react"
import { cn } from "../../utils/payrollUtils"

interface TooltipProps {
  className?: string;
  children: React.ReactNode;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative inline-block",
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute bottom-full left-1/2 mb-2 px-2 py-1 text-xs text-gray-600 bg-gray-800 rounded shadow-lg whitespace-nowrap z-10">
        Tooltip content
      </div>
    </div>
  )
})
Tooltip.displayName = "Tooltip"

export { Tooltip }
