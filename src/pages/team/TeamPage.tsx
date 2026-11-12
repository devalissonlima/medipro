import {
  CheckCircle2,
  AlertCircle,
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
    notification,
    openInviteModal,
    openEditModal,
    deleteMember,
    toggleMemberStatus,
    resendInvite,
    clearFilters,
    dismissNotification,
  } = useTeamMembers()

  return (
    <PageContainer className="space-y-6 pb-24">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs shadow-sm border transition-all animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : notification.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-slate-100 text-slate-800 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-xs font-semibold hover:underline px-2 py-0.5"
          >
            Fechar
          </button>
        </div>
      )}

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
