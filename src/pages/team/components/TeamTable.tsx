import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TeamMemberRow } from "./TeamMemberRow"
import type { TeamMember } from "@/types/team"

interface TeamTableProps {
  members: TeamMember[]
  onEdit: (member: TeamMember) => void
  onToggleStatus: (id: string) => void
  onResendInvite: (id: string) => void
  onDelete: (id: string) => void
}

export function TeamTable({
  members,
  onEdit,
  onToggleStatus,
  onResendInvite,
  onDelete,
}: TeamTableProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 text-xs">
              Colaborador
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-44">
              Função / Cargo
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-40">
              Contato WhatsApp
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-36 text-right">
              Produção (Mês)
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-36 text-center">
              Status Acesso
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-32 text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onResendInvite={onResendInvite}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
