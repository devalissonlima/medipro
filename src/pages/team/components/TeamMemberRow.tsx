import { useState } from "react"
import {
  Trash2,
  Send,
  Check,
  ShieldCheck,
  HardHat,
  Mail,
  CheckCircle2,
} from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TEAM_ACCOUNT_TYPE_CONFIG,
  TEAM_MEMBER_STATUS_CONFIG,
  type TeamMember,
} from "@/types/team"
import { formatShortDatePtBr } from "@/utils/dateGrouping"

interface TeamMemberRowProps {
  member: TeamMember
  onResendInvite: (id: string) => void
  onDelete: (id: string) => void
}

export function TeamMemberRow({
  member,
  onResendInvite,
  onDelete,
}: TeamMemberRowProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [resentRecently, setResentRecently] = useState(false)

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const accountConfig =
    TEAM_ACCOUNT_TYPE_CONFIG[member.accountType] ||
    TEAM_ACCOUNT_TYPE_CONFIG.MEMBER
  const statusConfig =
    TEAM_MEMBER_STATUS_CONFIG[member.status] ||
    TEAM_MEMBER_STATUS_CONFIG.invite_sent

  const isSupervisor = member.accountType === "PROJECT_SUPERVISOR"
  const isInviteSent = member.status === "invite_sent"

  const handleResend = () => {
    onResendInvite(member.id)
    setResentRecently(true)
    setTimeout(() => setResentRecently(false), 2500)
  }

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">
      {/* Usuário (Avatar + Nome + E-mail) */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            size="md"
            className="border border-slate-200 bg-slate-100 font-bold text-slate-700"
          >
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-sm block truncate">
              {member.name}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{member.email}</span>
            </span>
          </div>
        </div>
      </TableCell>

      {/* Tipo de Conta */}
      <TableCell className="py-3.5">
        <Badge
          variant="outline"
          className={`text-xs font-semibold gap-1.5 px-2.5 py-0.5 ${accountConfig.badgeClass}`}
        >
          {isSupervisor ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <HardHat className="h-3.5 w-3.5" />
          )}
          <span>{accountConfig.label}</span>
        </Badge>
      </TableCell>

      {/* Status do Acesso */}
      <TableCell className="py-3.5 text-center">
        <Badge
          variant="outline"
          className={`text-xs font-semibold gap-1 px-2.5 py-0.5 rounded-full ${statusConfig.badgeClass}`}
        >
          {isInviteSent ? (
            <Mail className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          <span>{statusConfig.label}</span>
        </Badge>
      </TableCell>

      {/* Data de Convite / Ativação */}
      <TableCell className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
        {isInviteSent
          ? `Enviado em ${formatShortDatePtBr(member.invitedAt)}`
          : member.activatedAt
          ? `Ativo desde ${formatShortDatePtBr(member.activatedAt)}`
          : formatShortDatePtBr(member.createdAt)}
      </TableCell>

      {/* Ações (Reenviar Convite + Excluir) */}
      <TableCell className="py-3.5 text-right">
        {showConfirmDelete ? (
          <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2.5"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 text-xs px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              onClick={() => {
                onDelete(member.id)
                setShowConfirmDelete(false)
              }}
            >
              Confirmar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1.5">
            {isInviteSent && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResend}
                className={`h-8 text-xs gap-1.5 transition-colors ${
                  resentRecently
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                title="Reenviar e-mail com senha temporária e código MFA"
              >
                {resentRecently ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Reenviado</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Reenviar</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 px-2.5"
              title="Excluir membro e liberar vaga no plano"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
