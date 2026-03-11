import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Row = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap -mx-4", className)}
    {...props}
  />
))
Row.displayName = "Row"

const Col = React.forwardRef(({ className, md, sm, lg, xl, ...props }, ref) => {
  const getColClasses = () => {
    const classes = ['px-4']
    
    // Handle responsive props
    if (sm) classes.push(`sm:w-${sm}`)
    if (md) classes.push(`md:w-${md}`)
    if (lg) classes.push(`lg:w-${lg}`)
    if (xl) classes.push(`xl:w-${xl}`)
    
    // Default to full width if no responsive props
    if (!sm && !md && !lg && !xl) {
      classes.push('w-full')
    }
    
    return classes.join(' ')
  }

  return (
    <div
      ref={ref}
      className={cn(getColClasses(), className)}
      {...props}
    />
  )
})
Col.displayName = "Col"

export { Row, Col }
