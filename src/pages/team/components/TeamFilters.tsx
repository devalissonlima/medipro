import { Search, X, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { MemberStatus } from "@/types/team"

interface TeamFiltersProps {
  searchQuery: string
  statusFilter: MemberStatus | "all"
  statusCounts: Record<string, number>
  isAtLimit: boolean
  onSearchChange: (q: string) => void
  onStatusChange: (s: MemberStatus | "all") => void
  onOpenInvite: () => void
  onClearFilters: () => void
}

export function TeamFilters({
  searchQuery,
  statusFilter,
  statusCounts,
  isAtLimit,
  onSearchChange,
  onStatusChange,
  onOpenInvite,
  onClearFilters,
}: TeamFiltersProps) {
  const statusOptions: { label: string; value: MemberStatus | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Ativos", value: "active" },
    { label: "Pendentes (Convite)", value: "pending_invite" },
    { label: "Inativos / Pausados", value: "inactive" },
  ]

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all"

  return (
    <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Linha Superior: Busca + Botão Convidar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nome, cargo, e-mail ou WhatsApp..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50/50 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={onOpenInvite}
          className={`gap-2 text-xs font-semibold h-9 px-4 shadow-sm ${
            isAtLimit
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Convidar Colaborador</span>
        </Button>
      </div>

      {/* Linha Inferior: Abas de Status com Contadores + Botão Limpar Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value
            const count = statusCounts[opt.value] || 0
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected
                      ? "bg-slate-800 text-amber-400"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 h-7 px-2"
          >
            Limpar filtros ativos
          </Button>
        )}
      </div>
    </div>
  )
}
