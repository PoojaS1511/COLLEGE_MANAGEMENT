import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Spinner = React.forwardRef(({ className, size = "md", ...props }, ref) => {
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
})
Spinner.displayName = "Spinner"

export { Spinner }
export default Spinner
