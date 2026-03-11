import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Dropdown = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} className="relative" {...props}>
    {children}
  </div>
))
Dropdown.displayName = "Dropdown"

const DropdownMenu = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownMenu.displayName = "DropdownMenu"

const DropdownToggle = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
DropdownToggle.displayName = "DropdownToggle"

const DropdownItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownItem.displayName = "DropdownItem"

export { Dropdown, DropdownMenu, DropdownToggle, DropdownItem }
