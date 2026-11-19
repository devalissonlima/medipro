import {
  UserPlus,
  Mail,
  ShieldCheck,
  HardHat,
  KeyRound,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMemberForm } from "../hooks/useMemberForm"
import { useTeamStore } from "@/stores/teamStore"
import {
  TEAM_ACCOUNT_TYPE_CONFIG,
  TEAM_ACCOUNT_TYPE_OPTIONS,
} from "@/types/team"

export function InviteMemberModal() {
  const isInviteModalOpen = useTeamStore((state) => state.isInviteModalOpen)

  const {
    name,
    setName,
    email,
    setEmail,
    accountType,
    setAccountType,
    errors,
    setErrors,
    handleSubmit,
    closeModals,
  } = useMemberForm()

  return (
    <Dialog
      open={isInviteModalOpen}
      onOpenChange={(open) => !open && closeModals()}
    >
      <DialogContent onClose={closeModals} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Cadastrar Novo Membro</DialogTitle>
              <DialogDescription>
                Crie o acesso de um Supervisor ou Membro vinculado ao seu plano.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label
              htmlFor="member-name"
              className="text-xs font-semibold text-slate-700"
            >
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <Input
              id="member-name"
              placeholder="Ex: Carlos Eduardo da Silva"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }))
                }
              }}
              className={`h-10 text-xs ${
                errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Tipo de Conta (Supervisor / Membro) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Tipo de Conta <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEAM_ACCOUNT_TYPE_OPTIONS.map((option) => {
                const config = TEAM_ACCOUNT_TYPE_CONFIG[option]
                const isSelected = accountType === option
                const isSupervisor = option === "PROJECT_SUPERVISOR"
                return (
                  <Button
                    key={option}
                    type="button"
                    variant="unstyled"
                    size="auto"
                    onClick={() => setAccountType(option)}
                    className={`flex flex-col items-start text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-slate-900 bg-slate-900/5 ring-2 ring-amber-400/50 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            isSupervisor
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {isSupervisor ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <HardHat className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {config.label}
                        </span>
                      </div>

                      <span
                        className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-amber-600 bg-amber-500"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal whitespace-normal">
                      {config.shortDescription}
                    </p>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* E-mail de Acesso */}
          <div className="space-y-1.5">
            <label
              htmlFor="member-email"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>E-mail de Acesso</span>
              <span className="text-rose-500">*</span>
            </label>
            <Input
              id="member-email"
              type="email"
              placeholder="colaborador@empresa.com.br"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }))
                }
              }}
              className={`h-10 text-xs ${
                errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Aviso sobre envio automático de senha temporária + MFA */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
            <KeyRound className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                Ativação Segura com Senha Temporária &amp; MFA
              </span>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                O usuário entrará na listagem com o status{" "}
                <strong>Convite Enviado</strong>. Ele receberá por e-mail o link da plataforma, uma senha temporária e um código de confirmação MFA para liberar o acesso.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeModals}
              className="text-xs h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-10 px-5 gap-1.5"
            >
              <UserPlus className="h-4 w-4 text-amber-400" />
              <span>Cadastrar Membro</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
