import { Search, X, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ClientType } from "@/types/client"

interface ClientFiltersProps {
  searchQuery: string
  typeFilter: ClientType | "all"
  typeCounts: Record<string, number>
  viewMode: "grid" | "table"
  onSearchChange: (q: string) => void
  onTypeChange: (t: ClientType | "all") => void
  onViewModeChange: (mode: "grid" | "table") => void
  onOpenCreate?: () => void
  onClearFilters: () => void
}

export function ClientFilters({
  searchQuery,
  typeFilter,
  typeCounts,
  viewMode,
  onSearchChange,
  onTypeChange,
  onViewModeChange,
  onClearFilters,
}: ClientFiltersProps) {
  const typeOptions: { label: string; value: ClientType | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Residencial", value: "residential" },
    { label: "Construtora / Obra", value: "commercial" },
    { label: "Arquiteto / Parceiro", value: "architect_partner" },
  ]

  const hasActiveFilters = searchQuery !== "" || typeFilter !== "all"

  return (
    <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Linha Superior: Busca Textual com Input Expandido */}
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Buscar por cliente, empresa, WhatsApp ou endereço..."
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

      {/* Linha Inferior: Abas de Tipo com Contadores + Toggle Grid/Tabela */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {typeOptions.map((opt) => {
            const isSelected = typeFilter === opt.value
            const count = typeCounts[opt.value] || 0
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeChange(opt.value)}
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

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 h-7 px-2"
            >
              Limpar filtros
            </Button>
          )}

          {/* Alternador Grid / Tabela */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em Tabela"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
