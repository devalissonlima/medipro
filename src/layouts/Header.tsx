import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  onToggleMobileMenu: () => void
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="lg:hidden text-slate-700 hover:bg-slate-100"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Ambiente de Trabalho
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
            Ambiente de Produção
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
        </Button>
      </div>
    </header>
  )
}
