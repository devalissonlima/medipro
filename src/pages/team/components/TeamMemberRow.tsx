import { useState } from "react"
import {
  MessageCircle,
  Pencil,
  Trash2,
  Send,
  Power,
  Check,
} from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TeamMember } from "@/types/team"
import { MEMBER_STATUS_CONFIG } from "@/types/team"
import { formatCurrency } from "@/utils/calculations"

interface TeamMemberRowProps {
  member: TeamMember
  onEdit: (member: TeamMember) => void
  onToggleStatus: (id: string) => void
  onResendInvite: (id: string) => void
  onDelete: (id: string) => void
}

export function TeamMemberRow({
  member,
  onEdit,
  onToggleStatus,
  onResendInvite,
  onDelete,
}: TeamMemberRowProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  const statusConfig =
    MEMBER_STATUS_CONFIG[member.status] || MEMBER_STATUS_CONFIG.active

  // Limpa caracteres especiais do telefone para o link do WhatsApp
  const cleanPhone = member.phone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/55${cleanPhone}`

  const handleResend = () => {
    onResendInvite(member.id)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">
      {/* Colaborador (Avatar + Nome + E-mail) */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-3">
          <Avatar size="md" className="border border-slate-200 bg-slate-100 font-bold text-slate-700">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm truncate">
                {member.name}
              </span>
            </div>
            <span className="text-xs text-slate-500 block truncate">
              {member.email}
            </span>
            {member.lastActive && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Visto: {member.lastActive}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Cargo / Especialidade */}
      <TableCell className="py-3.5">
        <Badge
          variant="outline"
          className="text-xs font-medium bg-slate-50 text-slate-700 border-slate-200"
        >
          {member.role}
        </Badge>
      </TableCell>

      {/* Contato (WhatsApp) */}
      <TableCell className="py-3.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
          title="Abrir conversa no WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>{member.phone}</span>
        </a>
      </TableCell>

      {/* Produção no Mês */}
      <TableCell className="py-3.5 text-right font-mono">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 text-sm block">
            {formatCurrency(member.monthlyTotalBilled)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {member.monthlyMeasurementsCount}{" "}
            {member.monthlyMeasurementsCount === 1 ? "medição" : "medições"}
          </span>
        </div>
      </TableCell>

      {/* Status do Acesso */}
      <TableCell className="py-3.5 text-center">
        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusConfig.badgeClass}`}
        >
          {statusConfig.label}
        </Badge>
      </TableCell>

      {/* Menu de Ações */}
      <TableCell className="py-3.5 text-center">
        {showConfirmDelete ? (
          <div className="flex items-center justify-center gap-1 animate-in fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setShowConfirmDelete(false)}
            >
              Não
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                onDelete(member.id)
                setShowConfirmDelete(false)
              }}
            >
              Excluir
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            {/* Editar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(member)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Editar colaborador"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {/* Reenviar Convite */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              className={`h-8 w-8 p-0 transition-colors ${
                copiedLink
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Reenviar dados de acesso por WhatsApp"
            >
              {copiedLink ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Pausar / Ativar Acesso */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(member.id)}
              className={`h-8 w-8 p-0 ${
                member.status === "inactive"
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
              }`}
              title={
                member.status === "inactive"
                  ? "Reativar acesso (ocupará licença)"
                  : "Pausar acesso (libera licença no plano)"
              }
            >
              <Power className="h-3.5 w-3.5" />
            </Button>

            {/* Excluir da Equipe */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Remover colaborador da equipe"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
