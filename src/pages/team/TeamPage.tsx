import { Users } from "lucide-react"
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
    deleteMember,
    resendInvite,
    clearFilters,
  } = useTeamMembers()

  return (
    <PageContainer className="space-y-6 pb-24">
      <PageHeader
        title="Minha Equipe"
        description="Crie acessos para Supervisores e Membros da sua empresa conforme a capacidade de licenças do plano."
        badge={
          <Badge
            variant="outline"
            className="text-blue-800 bg-blue-50 border-blue-300 gap-1.5 font-semibold text-xs"
          >
            <Users className="h-3.5 w-3.5 text-blue-600" />
            Gestão de Acessos &amp; Plano
          </Badge>
        }
      />

      {/* Barra de Capacidade e Licenças do Plano */}
      <TeamUsageBanner usage={planUsage} />

      {/* Busca, Filtros e Botão Novo Membro */}
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

      {/* Tabela de Listagem ou Estado Vazio */}
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
              Usuários Listados ({members.length})
            </span>
            <span className="text-xs text-slate-400">
              Total vinculado ao plano: {allMembers.length}
            </span>
          </div>

          <TeamTable
            members={members}
            onResendInvite={resendInvite}
            onDelete={deleteMember}
          />
        </div>
      )}

      {/* Modal de Cadastro de Novo Membro */}
      <InviteMemberModal />

      {/* Diálogo de Limite Atingido */}
      <LimitReachedDialog />
    </PageContainer>
  )
}
