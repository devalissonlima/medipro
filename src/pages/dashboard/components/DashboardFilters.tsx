import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { DashboardPeriod } from "@/types/dashboard"
import type { MeasurementStatus } from "@/types/measurement"
import { MOCK_TEAM_COLLABORATORS } from "@/types/dashboard"

interface DashboardFiltersProps {
  period: DashboardPeriod
  memberId: string | "all"
  searchQuery: string
  statusFilter: MeasurementStatus | "all"
  statusCounts: Record<string, number>
  onPeriodChange: (p: DashboardPeriod) => void
  onMemberChange: (id: string | "all") => void
  onSearchChange: (q: string) => void
  onStatusChange: (status: MeasurementStatus | "all") => void
  onClearFilters: () => void
}

export function DashboardFilters({
  period,
  memberId,
  searchQuery,
  statusFilter,
  statusCounts,
  onPeriodChange,
  onMemberChange,
  onSearchChange,
  onStatusChange,
  onClearFilters,
}: DashboardFiltersProps) {
  const periodOptions: { label: string; value: DashboardPeriod }[] = [
    { label: "Todos os Períodos", value: "all" },
    { label: "Este Mês", value: "month" },
    { label: "Esta Semana", value: "week" },
    { label: "Hoje", value: "today" },
  ]

  const statusOptions: { label: string; value: MeasurementStatus | "all" }[] = [
    { label: "Todas", value: "all" },
    { label: "Pendentes", value: "pending" },
    { label: "Aprovadas", value: "approved" },
    { label: "Para Ajustar", value: "rework" },
  ]

  const hasActiveFilters =
    period !== "all" || memberId !== "all" || searchQuery !== "" || statusFilter !== "all"

  return (
    <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Linha Superior: Busca + Filtro Temporal + Filtro de Colaborador */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Campo de Busca Rápida (5 cols) */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por medição, obra ou profissional..."
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

        {/* Filtro Temporal (4 cols) */}
        <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg">
          {periodOptions.map((opt) => {
            const isSelected = period === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPeriodChange(opt.value)}
                className={`flex-1 text-[11px] font-semibold py-1 px-1.5 rounded-md transition-colors text-center whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Filtro de Colaborador (3 cols) */}
        <div className="md:col-span-3">
          <Select
            value={memberId}
            onChange={(e) => onMemberChange(e.target.value)}
            className="h-9 text-xs bg-slate-50/50"
          >
            <option value="all">Todos os Colaboradores</option>
            {MOCK_TEAM_COLLABORATORS.map((colab) => (
              <option key={colab.id} value={colab.id}>
                {colab.name} ({colab.role.split(" ")[0]})
              </option>
            ))}
          </Select>
        </div>
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
