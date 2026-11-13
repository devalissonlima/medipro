import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppBreadcrumb } from "@/components/shared/AppBreadcrumb"

interface HeaderProps {
  onToggleMobileMenu: () => void
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="lg:hidden text-slate-700 hover:bg-slate-100 shrink-0 h-9 w-9"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb de navegação dinâmico */}
        <AppBreadcrumb />
      </div>
    </header>
  )
}
