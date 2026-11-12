import React from "react"
import { useNavigate } from "react-router-dom"
import {
  PlusCircle,
  Layers,
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  Ruler,
  CreditCard,
  User as UserIcon,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/authStore"

interface QuickShortcutsProps {
  pendingCount?: number
}

interface ShortcutConfig {
  id: string
  title: string
  description: string
  icon: LucideIcon
  route: string
  isPrimary: boolean
  badge: string | null
}

export const QuickShortcuts: React.FC<QuickShortcutsProps> = ({
  pendingCount = 0,
}) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const getShortcutsByRole = (): ShortcutConfig[] => {
    switch (user?.role) {
      case "MANAGER":
      case "MASTER":
        return [
          {
            id: "dashboard",
            title: "Dashboard Geral",
            description: "Audite medições, filtre por projeto e aprove pagamentos",
            icon: LayoutDashboard,
            route: "/dashboard",
            isPrimary: true,
            badge: pendingCount > 0 ? `${pendingCount} aguardando` : null,
          },
          {
            id: "projetos",
            title: "Projetos & Obras",
            description: "Gerencie obras, equipes alocadas e medições isoladas",
            icon: FolderKanban,
            route: "/projetos",
            isPrimary: false,
            badge: null,
          },
          {
            id: "clientes",
            title: "Meus Clientes",
            description: "Acesse o mini CRM de construtoras e arquitetos",
            icon: UserCheck,
            route: "/clientes",
            isPrimary: false,
            badge: null,
          },
          {
            id: "plano",
            title: "Meu Plano",
            description: "Acompanhe licenças por obra e faturamento da empresa",
            icon: CreditCard,
            route: "/plano",
            isPrimary: false,
            badge: null,
          },
        ]

      case "PROJECT_SUPERVISOR":
        return [
          {
            id: "projetos",
            title: "Projetos & Obras",
            description: "Gerencie medições, aprovações e membros das suas obras",
            icon: FolderKanban,
            route: "/projetos",
            isPrimary: true,
            badge: pendingCount > 0 ? `${pendingCount} pendentes` : null,
          },
          {
            id: "nova-medicao",
            title: "Nova Medição",
            description: "Lance uma medição vinculada diretamente a um projeto",
            icon: PlusCircle,
            route: "/medicoes/nova",
            isPrimary: false,
            badge: null,
          },
          {
            id: "clientes",
            title: "Meus Clientes",
            description: "Consulte contatos e histórico de clientes das obras",
            icon: UserCheck,
            route: "/clientes",
            isPrimary: false,
            badge: null,
          },
          {
            id: "perfil",
            title: "Minha Conta",
            description: "Visualize seus dados de acesso e encerre a sessão",
            icon: UserIcon,
            route: "/perfil",
            isPrimary: false,
            badge: null,
          },
        ]

      case "MEMBER":
        return [
          {
            id: "nova-medicao",
            title: "Nova Medição",
            description: "Envie os serviços executados vinculados ao projeto",
            icon: PlusCircle,
            route: "/medicoes/nova",
            isPrimary: true,
            badge: null,
          },
          {
            id: "projetos",
            title: "Meus Projetos",
            description: "Consulte as obras onde você está alocado trabalhando",
            icon: FolderKanban,
            route: "/projetos",
            isPrimary: false,
            badge: null,
          },
          {
            id: "medicoes",
            title: "Minhas Medições",
            description: "Acompanhe aprovações e ajustes solicitados em campo",
            icon: Ruler,
            route: "/medicoes",
            isPrimary: false,
            badge: null,
          },
          {
            id: "servicos",
            title: "Tabela de Serviços",
            description: "Consulte os valores unitários vigentes por serviço",
            icon: Layers,
            route: "/servicos",
            isPrimary: false,
            badge: null,
          },
          {
            id: "perfil",
            title: "Minha Conta",
            description: "Gerencie suas informações e sessão na plataforma",
            icon: UserIcon,
            route: "/perfil",
            isPrimary: false,
            badge: null,
          },
        ]

      case "SOLO":
      default:
        return [
          {
            id: "nova-medicao",
            title: "Nova Medição",
            description: "Crie uma nova medição ou orçamento para seus clientes",
            icon: PlusCircle,
            route: "/medicoes/nova",
            isPrimary: true,
            badge: null,
          },
          {
            id: "projetos",
            title: "Projetos & Obras",
            description: "Organize suas obras e medições por projeto",
            icon: FolderKanban,
            route: "/projetos",
            isPrimary: false,
            badge: null,
          },
          {
            id: "servicos",
            title: "Tabela de Serviços",
            description: "Gerencie seus preços por m², metro linear e unidade",
            icon: Layers,
            route: "/servicos",
            isPrimary: false,
            badge: null,
          },
          {
            id: "clientes",
            title: "Meus Clientes",
            description: "Acesse o mini CRM e histórico completo de orçamentos",
            icon: UserCheck,
            route: "/clientes",
            isPrimary: false,
            badge: null,
          },
        ]
    }
  }

  const shortcuts = getShortcutsByRole()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ações Rápidas
        </h2>
        <span className="text-xs text-muted-foreground">
          Acesso direto com 1 clique
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <button
              key={shortcut.id}
              type="button"
              onClick={() => navigate(shortcut.route)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 text-left transition-all hover:scale-[1.01] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                shortcut.isPrimary
                  ? "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:border-primary"
                  : "border-border/70 bg-card hover:border-border hover:bg-accent/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      shortcut.isPrimary
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {shortcut.badge && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
                    >
                      {shortcut.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {shortcut.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {shortcut.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                <span>Acessar</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
