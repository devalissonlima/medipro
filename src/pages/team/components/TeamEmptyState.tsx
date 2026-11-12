import { Users, RotateCcw, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamEmptyStateProps {
  onClearFilters: () => void
  onOpenInvite: () => void
  isFiltered: boolean
}

export function TeamEmptyState({
  onClearFilters,
  onOpenInvite,
  isFiltered,
}: TeamEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-3">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="text-base font-bold text-slate-900">
        {isFiltered
          ? "Nenhum colaborador encontrado"
          : "Nenhum colaborador na equipe ainda"}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
        {isFiltered
          ? "Tente ajustar os termos de busca ou selecione outro status de acesso."
          : "Convide seus instaladores e montadores de campo para que eles enviem medições diretamente pelo Medipro."}
      </p>

      <div className="mt-5 flex items-center justify-center gap-2.5">
        {isFiltered ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar Filtros
          </Button>
        ) : null}

        <Button
          type="button"
          size="sm"
          onClick={onOpenInvite}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Convidar Colaborador
        </Button>
      </div>
    </div>
  )
}
