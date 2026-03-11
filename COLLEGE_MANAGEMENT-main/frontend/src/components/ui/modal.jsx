import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Modal = React.forwardRef(({ show, onClose, size = "md", className, children, ...props }, ref) => {
  if (!show) return null

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    full: "max-w-full"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={ref}
        className={cn(
          "relative bg-white rounded-lg shadow-lg w-full mx-4",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
Modal.displayName = "Modal"

const ModalHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b", className)}
    {...props}
  />
))
ModalHeader.displayName = "ModalHeader"

const ModalBody = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4", className)}
    {...props}
  />
))
ModalBody.displayName = "ModalBody"

const ModalFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-t bg-gray-50 flex items-center justify-end space-x-2", className)}
    {...props}
  />
))
ModalFooter.displayName = "ModalFooter"

export { Modal, ModalHeader, ModalBody, ModalFooter }
