import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const StatCard = React.forwardRef(({ className, title, value, icon, color = "blue", trend, ...props }, ref) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "p-6 rounded-lg border bg-white",
        colorStyles[color],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <span className={cn(
                "font-medium",
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
})
StatCard.displayName = "StatCard"

export { StatCard }
