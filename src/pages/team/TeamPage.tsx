import {
  HardHat,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { TeamUsageBanner } from "./components/TeamUsageBanner"
import { TeamFilters } from "./components/TeamFilters"
import { TeamTable } from "./components/TeamTable"
import { TeamEmptyState } from "./components/TeamEmptyState"
import { InviteMemberModal } from "./components/InviteMemberModal"
import { LimitReachedDialog } from "./components/LimitReachedDialog"
import { useTeamMembers } from "./hooks/useTeamMembers"

export function TeamPage() {
  const {
    members,
    allMembers,
    planUsage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusCounts,
    openInviteModal,
    openEditModal,
    deleteMember,
    toggleMemberStatus,
    resendInvite,
    clearFilters,
  } = useTeamMembers()

  return (
    <PageContainer className="space-y-6 pb-24">
      {/* Cabeçalho da Equipe */}
      <PageHeader
        title="Minha Equipe"
        description="Gestão de instaladores, revestidores e ajudantes de campo. Controle de acessos e monitoramento de capacidade de licenças."
        badge={
          <Badge variant="outline" className="text-blue-800 bg-blue-50 border-blue-300 gap-1.5 font-semibold text-xs">
            <HardHat className="h-3.5 w-3.5 text-blue-600" />
            Recursos Humanos & Obra
          </Badge>
        }
      />

      {/* 1. Barra de Capacidade e Licenças do Plano */}
      <TeamUsageBanner usage={planUsage} />

      {/* 2. Filtros e Ações de Busca */}
      <TeamFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        isAtLimit={planUsage.isAtLimit}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onOpenInvite={openInviteModal}
        onClearFilters={clearFilters}
      />

      {/* 3. Tabela de Membros ou Estado Vazio */}
      {members.length === 0 ? (
        <TeamEmptyState
          onClearFilters={clearFilters}
          onOpenInvite={openInviteModal}
          isFiltered={searchQuery !== "" || statusFilter !== "all"}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              Profissionais Cadastrados ({members.length})
            </span>
            <span className="text-xs text-slate-400">
              Total de membros: {allMembers.length}
            </span>
          </div>

          <TeamTable
            members={members}
            onEdit={openEditModal}
            onToggleStatus={toggleMemberStatus}
            onResendInvite={resendInvite}
            onDelete={deleteMember}
          />
        </div>
      )}

      {/* Modal de Convidar / Editar Colaborador */}
      <InviteMemberModal />

      {/* Modal de Limite Atingido (Upsell para /plano) */}
      <LimitReachedDialog />
    </PageContainer>
  )
}
