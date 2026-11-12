import { ArrowUpRight, Zap, ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTeamStore } from "@/stores/teamStore"

export function LimitReachedDialog() {
  const navigate = useNavigate()
  const { isLimitDialogOpen, closeModals, maxLicenses, planName } = useTeamStore()

  const handleUpgrade = () => {
    closeModals()
    navigate("/plano")
  }

  return (
    <Dialog open={isLimitDialogOpen} onOpenChange={closeModals}>
      <DialogContent onClose={closeModals} className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-rose-950">
            Limite de Licenças Atingido
          </DialogTitle>
          <DialogDescription className="text-slate-600 leading-relaxed">
            Seu <strong>{planName}</strong> inclui até <strong>{maxLicenses} colaboradores</strong> simultâneos. Todas as licenças estão atualmente ocupadas por membros ativos ou com convites pendentes.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Zap className="h-4 w-4 text-amber-600" />
            Precisa de mais instaladores em campo?
          </div>
          <p className="text-amber-800 leading-relaxed">
            Faça upgrade para o <strong>Plano Enterprise</strong> e desbloqueie até 25 colaboradores, controle avançado de frentes de obra e relatórios consolidados em tempo real.
          </p>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={closeModals}
            className="text-xs"
          >
            Voltar
          </Button>
          <Button
            type="button"
            onClick={handleUpgrade}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <span>Ver Planos & Upgrade</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
