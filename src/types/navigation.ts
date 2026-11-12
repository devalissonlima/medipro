import type { LucideIcon } from "lucide-react"
import type { UserRole } from "./auth"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  badge?: string
  allowedRoles: UserRole[]
}
