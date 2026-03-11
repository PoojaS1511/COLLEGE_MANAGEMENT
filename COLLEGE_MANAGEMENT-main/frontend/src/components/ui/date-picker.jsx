import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const DatePicker = React.forwardRef(({ className, value, onChange, format = "yyyy-MM-dd", picker = "date", ...props }, ref) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const getInputType = () => {
    switch (picker) {
      case 'month':
        return 'month'
      case 'date':
      default:
        return 'date'
    }
  }

  const formatValue = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
      if (picker === 'month') {
        return val.toISOString().slice(0, 7); // YYYY-MM
      } else {
        return val.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }
    return val;
  };

  return (
    <input
      ref={ref}
      type={getInputType()}
      value={formatValue(value)}
      onChange={handleChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
DatePicker.displayName = "DatePicker"

export { DatePicker }
export default DatePicker
