import {
  LayoutDashboard,
  Layers,
  File,
  TrendingUp,
  Briefcase,
  Building2,
  CreditCard,
  ReceiptText,
  Users,
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
    title: "Clientes",
    href: "/clientes",
    icon: Building2,
    description: "Obras, construtoras e clientes",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "SOLO"],
  },
  {
    title: "Serviços",
    href: "/servicos",
    icon: Layers,
    description: "Catálogo e tabelas de preços",
    allowedRoles: ["MASTER", "MEMBER", "SOLO"],
  },
  {
    title: "Orçamentos",
    href: "/orcamentos",
    icon: ReceiptText,
    description: "Propostas timbradas e aditivos de obra",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "SOLO"],
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: Briefcase,
    description: "Obras, medições e equipes alocadas",
    allowedRoles: ["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "MEMBER", "SOLO"],
  },
  {
    title: "Medições",
    href: "/medicoes",
    icon: File,
    description: "Lançamento de áreas e volumes",
    allowedRoles: ["MASTER", "MEMBER", "SOLO"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: TrendingUp,
    description: "Indicadores financeiros e aprovação",
    allowedRoles: ["MASTER", "MANAGER"],
  },
  {
    title: "Minha Equipe",
    href: "/equipe",
    icon: Users,
    description: "Gestão de acessos, convites e limites do plano",
    allowedRoles: ["MASTER", "MANAGER"],
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
