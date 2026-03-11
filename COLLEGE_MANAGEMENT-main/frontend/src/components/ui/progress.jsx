import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Progress = React.forwardRef(({ className, value, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "w-full bg-gray-200 rounded-full h-2",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-2 rounded-full transition-all duration-300",
          variantStyles[variant]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
