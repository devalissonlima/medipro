import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const baseClass =
      type === "checkbox"
        ? "h-4 w-4 shrink-0 rounded border border-slate-300 bg-white text-amber-600 accent-amber-600 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        : type === "color"
        ? "h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        : "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50"

    return (
      <input
        type={type}
        className={cn(baseClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
