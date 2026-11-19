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
  onResendInvite: (id: string) => void
  onDelete: (id: string) => void
}

export function TeamTable({
  members,
  onResendInvite,
  onDelete,
}: TeamTableProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-x-auto shadow-2xs">
      <Table className="min-w-[680px]">
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 text-xs">
              Usuário
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-40">
              Tipo de Conta
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-44 text-center">
              Status do Acesso
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-40">
              Data
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-48 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onResendInvite={onResendInvite}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
