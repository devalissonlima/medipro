import {
  LayoutDashboard,
  Layers,
  Ruler,
  TrendingUp,
  FolderKanban,
  Building2,
  CreditCard,
} from "lucide-react"
import type { NavItem } from "@/types/navigation"
import type { UserRole } from "@/types/auth"

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral e atalhos rápidos",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "MEMBER", "SOLO"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: TrendingUp,
    description: "Indicadores financeiros e aprovação",
    allowedRoles: ["MASTER", "MANAGER"],
  },
  {
    title: "Serviços",
    href: "/servicos",
    icon: Layers,
    description: "Catálogo e tabelas de preços",
    allowedRoles: ["MASTER", "MEMBER", "SOLO"],
  },
  {
    title: "Medições",
    href: "/medicoes",
    icon: Ruler,
    description: "Lançamento de áreas e volumes",
    allowedRoles: ["MASTER", "MEMBER", "SOLO"],
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
    description: "Obras, medições e equipes alocadas",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "MEMBER", "SOLO"],
  },
  {
    title: "Meus Clientes",
    href: "/clientes",
    icon: Building2,
    description: "Obras, construtoras e clientes",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "SOLO"],
  },
  {
    title: "Meu plano",
    href: "/plano",
    icon: CreditCard,
    description: "Assinatura e faturamento",
    allowedRoles: ["MASTER", "MANAGER", "SOLO"],
  },
]

export function getAuthorizedNavItems(role?: UserRole): NavItem[] {
  if (!role) return []
  return NAVIGATION_ITEMS.filter((item) => item.allowedRoles.includes(role))
}
