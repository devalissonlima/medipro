import React from "react"
import {
  UserPlus,
  Users,
  Shield,
  Wrench,
  Power,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ProjectMember } from "@/types/project"

interface ProjectTeamTabProps {
  members: ProjectMember[]
  activeCount: number
  maxMembers: number
  canManage: boolean
  onOpenAddModal: () => void
  onToggleStatus: (memberId: string) => void
  onRemoveMember: (memberId: string) => void
}

export const ProjectTeamTab: React.FC<ProjectTeamTabProps> = ({
  members,
  activeCount,
  maxMembers,
  canManage,
  onOpenAddModal,
  onToggleStatus,
  onRemoveMember,
}) => {
  const usagePercent = Math.min(
    100,
    Math.round((activeCount / Math.max(1, maxMembers)) * 100)
  )
  const isLimitReached = activeCount >= maxMembers

  const progressColor =
    usagePercent >= 100
      ? "bg-rose-500"
      : usagePercent >= 80
      ? "bg-amber-500"
      : "bg-emerald-500"

  return (
    <div className="space-y-6">
      {/* Banner Informativo do Plano */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-slate-900">
                Membros alocados: {activeCount} de {maxMembers} permitidos neste projeto
              </span>
              {isLimitReached && (
                <Badge
                  variant="outline"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Limite atingido
                </Badge>
              )}
            </div>

            <div className="w-full max-w-md h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500">
              {canManage
                ? "Capacidade de colaboradores ativos herdada do plano da empresa. Inative ou remova um colaborador para liberar vaga nesta obra."
                : "Colaboradores e encarregados alocados nesta obra pelo gestor da empresa."}
            </p>
          </div>

          {canManage && (
            <Button
              onClick={onOpenAddModal}
              disabled={isLimitReached}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0"
            >
              <UserPlus className="h-4 w-4 text-amber-400" />
              + Adicionar Membro na Obra
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Colaboradores Vinculados */}
      <Card className="border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {members.length === 0 ? (
          <CardContent className="py-12 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Nenhum membro alocado nesta obra
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Adicione encarregados ou instaladores para permitir que enviem medições diretamente para este projeto.
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-600">
                    Colaborador
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">
                    Papel (Role)
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">
                    Tag de Cargo
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">
                    Status
                  </TableHead>
                  {canManage && (
                    <TableHead className="text-right text-xs font-bold text-slate-600">
                      Ações
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const initials = member.userName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                  const isSupervisor =
                    member.projectRole === "PROJECT_SUPERVISOR"
                  const isActive = member.status === "active"

                  return (
                    <TableRow
                      key={member.id}
                      className={!isActive ? "opacity-60 bg-slate-50/50" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 bg-slate-100 text-slate-700 font-bold">
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={member.userName}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {member.userName}
                            </p>
                            {member.userEmail && (
                              <p className="text-[11px] text-slate-400">
                                {member.userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 text-[11px] font-semibold ${
                            isSupervisor
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isSupervisor ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <Wrench className="h-3 w-3" />
                          )}
                          {member.projectRole}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-medium"
                        >
                          {member.specialtyTag}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isActive ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          {isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>

                      {canManage && (
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleStatus(member.id)}
                              disabled={!isActive && isLimitReached}
                              title={
                                isActive
                                  ? "Pausar acesso nesta obra"
                                  : "Reativar acesso nesta obra"
                              }
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                              <Power className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveMember(member.id)}
                              title="Remover da obra"
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
