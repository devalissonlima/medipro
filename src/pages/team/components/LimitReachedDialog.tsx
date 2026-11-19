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
import { useAuthStore } from "@/stores/authStore"
import { useTeamStore } from "@/stores/teamStore"
import { PLAN_LICENSE_LIMITS } from "@/types/team"

export function LimitReachedDialog() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { isLimitDialogOpen, closeModals } = useTeamStore()

  const planName = user?.plano || "Plano Pro"
  const maxLicenses = PLAN_LICENSE_LIMITS[planName] ?? 5

  const handleUpgrade = () => {
    closeModals()
    navigate("/plano")
  }

  return (
    <Dialog
      open={isLimitDialogOpen}
      onOpenChange={(open) => !open && closeModals()}
    >
      <DialogContent onClose={closeModals} className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-rose-950">
            Limite de Licenças Atingido
          </DialogTitle>
          <DialogDescription className="text-slate-600 leading-relaxed">
            O seu <strong>{planName}</strong> permite até{" "}
            <strong>{maxLicenses} usuários</strong> cadastrados ou com convite ativo na equipe. Para liberar espaço, remova um acesso existente ou amplie seu plano.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Zap className="h-4 w-4 text-amber-600" />
            Precisa cadastrar mais Supervisores ou Membros?
          </div>
          <p className="text-amber-800 leading-relaxed">
            Faça upgrade para o <strong>Plano Enterprise</strong> e libere até{" "}
            <strong>{PLAN_LICENSE_LIMITS["Plano Enterprise"]} usuários</strong>{" "}
            com criação instantânea de logins e autenticação MFA.
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
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <span>Ver Planos &amp; Upgrade</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
