import { useState } from "react"
import {
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Copy,
  Check,
  MessageCircle,
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
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useMemberForm } from "../hooks/useMemberForm"
import { useTeamStore } from "@/stores/teamStore"
import type { MemberRole } from "@/types/team"
import { MEMBER_ROLE_OPTIONS } from "@/types/team"

export function InviteMemberModal() {
  const isInviteModalOpen = useTeamStore((state) => state.isInviteModalOpen)
  const [copiedLink, setCopiedLink] = useState(false)

  const {
    isEditing,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    baseRate,
    setBaseRate,
    errors,
    createdInviteLink,
    handleSubmit,
    closeModals,
  } = useMemberForm()

  const handleCopy = async () => {
    if (!createdInviteLink) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(createdInviteLink)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = createdInviteLink
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      setCopiedLink(true)
    }
  }

  const handleOpenWhatsApp = () => {
    if (!createdInviteLink) return
    const text = encodeURIComponent(
      `Olá ${name}! Você foi convidado para a equipe no Medipro.\n\n` +
        `Acesse este link para ativar seu acesso de instalador e enviar medições:\n` +
        `${createdInviteLink}\n\n` +
        `_Medipro - Plataforma de Obras e Acabamentos_`
    )
    window.open(`https://api.whatsapp.com/send?phone=55${phone.replace(/\D/g, "")}&text=${text}`, "_blank")
  }

  return (
    <Dialog open={isInviteModalOpen} onOpenChange={closeModals}>
      <DialogContent onClose={closeModals} className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle>
            {isEditing ? "Editar Colaborador" : "Convidar Novo Colaborador"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados de contato, especialidade e parâmetro de remuneração."
              : "Cadastre seu liderado para que ele envie medições diretamente pelo aplicativo de campo."}
          </DialogDescription>
        </DialogHeader>

        {/* Se o convite acabou de ser criado, exibe a tela de link para compartilhamento */}
        {createdInviteLink ? (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1.5 text-xs text-emerald-900">
              <span className="font-bold block text-emerald-950">
                Convite gerado com sucesso para {name}!
              </span>
              <p className="text-emerald-800">
                O instalador poderá acessar a plataforma e enviar medições diretamente para a sua aprovação.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Link de Ativação do Acesso
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdInviteLink}
                  className="text-xs font-mono bg-slate-50 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 gap-2 shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar Link no WhatsApp do Colaborador
            </Button>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModals}
                className="w-full text-xs"
              >
                Concluir
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Formulário de Cadastro / Edição */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ex: Carlos Eduardo da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""}
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>
              )}
            </div>

            {/* E-mail de Acesso */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                E-mail de Acesso <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="colaborador@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Telefone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-rose-400 focus-visible:ring-rose-400" : ""}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Especialidade Principal & Parâmetro Remuneração (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  Especialidade
                </label>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="h-9 text-xs"
                >
                  {MEMBER_ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  Diária / Base (Opcional)
                </label>
                <Input
                  type="number"
                  placeholder="R$ 150,00"
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModals}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
              >
                {isEditing ? "Salvar Alterações" : "Gerar Acesso & Convite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
