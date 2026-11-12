import { Layers, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServicesEmptyStateProps {
  isFiltered: boolean
  onResetFilters: () => void
  onOpenCreate: () => void
}

export function ServicesEmptyState({
  isFiltered,
  onResetFilters,
  onOpenCreate,
}: ServicesEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
        <Layers className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {isFiltered
          ? "Nenhum serviço encontrado para este filtro"
          : "Nenhum serviço cadastrado ainda"}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">
        {isFiltered
          ? "Tente ajustar os termos de busca ou selecione outra categoria para visualizar os serviços."
          : "Cadastre os serviços que sua equipe executa (cortes, assentamento, polimento) para utilizá-los no lançamento de medições."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {isFiltered ? (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="gap-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar Filtros de Busca
          </Button>
        ) : null}

        <Button
          onClick={onOpenCreate}
          className="gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Cadastrar Primeiro Serviço
        </Button>
      </div>
    </div>
  )
}
