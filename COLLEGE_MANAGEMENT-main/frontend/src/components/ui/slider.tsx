import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue)
    const isControlled = valueProp !== undefined
    const currentValue = isControlled ? valueProp : value

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (!isControlled) {
        setValue(newValue)
      }
      onValueChange?.(newValue)
    }

    const percentage = ((currentValue - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "relative h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1d395e]",
            "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
            "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200",
            "[&::-webkit-slider-thumb]:focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-2",
            "[&::-webkit-slider-thumb]:focus-visible:ring-[#1d395e] [&::-webkit-slider-thumb]:focus-visible:ring-offset-2",
            "dark:bg-gray-700"
          )}
          style={{
            backgroundImage: `linear-gradient(to right, #1d395e 0%, #1d395e ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }