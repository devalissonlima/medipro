import type { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}
