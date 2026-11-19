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
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-3">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="text-base font-bold text-slate-900">
        {isFiltered
          ? "Nenhum usuário encontrado"
          : "Nenhum usuário cadastrado na equipe"}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
        {isFiltered
          ? "Tente ajustar os termos de busca ou selecione outro filtro de status."
          : "Cadastre seus Supervisores e Membros para enviar o convite de acesso com login e validação MFA por e-mail."}
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
            <span>Limpar Filtros</span>
          </Button>
        ) : null}

        <Button
          type="button"
          size="sm"
          onClick={onOpenInvite}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 shadow-xs"
        >
          <UserPlus className="h-4 w-4 text-amber-400" />
          <span>Novo Membro</span>
        </Button>
      </div>
    </div>
  )
}
