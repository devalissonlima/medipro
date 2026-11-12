import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Layers,
  Ruler,
  TrendingUp,
  Users,
  Building2,
  CreditCard,
  HardHat,
  ChevronRight,
} from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"

const navigationItems: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral e atalhos rápidos",
  },
  {
    title: "Serviços",
    href: "/servicos",
    icon: Layers,
    description: "Catálogo e tabelas de preços",
  },
  {
    title: "Medições",
    href: "/medicoes",
    icon: Ruler,
    description: "Lançamento de áreas e volumes",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: TrendingUp,
    description: "Indicadores e relatórios",
  },
  {
    title: "Minha equipe",
    href: "/equipe",
    icon: Users,
    description: "Gestão de colaboradores",
  },
  {
    title: "Meus Clientes",
    href: "/clientes",
    icon: Building2,
    description: "Obras, construtoras e clientes",
  },
  {
    title: "Meu plano",
    href: "/plano",
    icon: CreditCard,
    description: "Assinatura e faturamento",
  },
]

interface SidebarProps {
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const userInitials = user?.nome
    ? user.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "MP"

  const handleProfileClick = () => {
    navigate("/perfil")
    onNavigate?.()
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-72 shrink-0 select-none",
        className
      )}
    >
      {/* Topo: Logotipo e Identidade Visual (Com respiro generoso, sem badge e sem descrição) */}
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
          <HardHat className="h-5 w-5" />
        </div>
        <div className="flex items-center">
          <span className="text-xl font-black tracking-tight text-white">
            Medi<span className="text-amber-500">Pro</span>
          </span>
        </div>
      </div>

      {/* Meio: Menu de Navegação (Itens estáveis com borda fixa evitando layout shifts ao clicar) */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Principal
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border border-transparent transition-colors duration-150 select-none",
                    isActive
                      ? "bg-amber-500/10 text-amber-400 font-semibold border-amber-500/25"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-amber-400"
                          : "text-slate-400 group-hover:text-slate-300"
                      )}
                    />
                    <span className="flex-1 truncate">{item.title}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Perfil Limpo (Foto e Login, clicável para página do usuário) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <button
          type="button"
          onClick={handleProfileClick}
          className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-transparent transition-colors duration-150 hover:bg-slate-800/70 hover:border-slate-800/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/30"
          title="Ver perfil e opções da conta"
        >
          <Avatar className="h-10 w-10 shrink-0 border border-slate-700 bg-slate-800 text-amber-400 font-bold transition-transform group-hover:scale-105">
            <AvatarImage src={user?.avatarUrl} alt={user?.nome} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
              {user?.nome || "Usuário Medipro"}
            </span>
            <span className="text-[11px] text-slate-400 truncate group-hover:text-slate-300">
              {user?.email || "usuario@medipro.com.br"}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-200" />
        </button>
      </div>
    </aside>
  )
}
