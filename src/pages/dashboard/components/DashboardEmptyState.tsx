import { CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardEmptyStateProps {
  onClearFilters: () => void
}

export function DashboardEmptyState({
  onClearFilters,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-3">
        <CheckCircle2 className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-base font-bold text-slate-900">
        Nenhuma medição encontrada
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
        Não há medições correspondentes aos critérios de período, colaborador ou status selecionados.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar Filtros Ativos
        </Button>
      </div>
    </div>
  )
}
