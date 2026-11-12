import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
  Calendar,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { RequestReworkModal } from "@/pages/dashboard/components/RequestReworkModal"
import { PROJECT_STATUS_CONFIG, type ProjectStatus } from "@/types/project"
import { useProjectDetail } from "./hooks/useProjectDetail"
import { ProjectMeasurementsTab } from "./components/ProjectMeasurementsTab"
import { ProjectTeamTab } from "./components/ProjectTeamTab"
import { AddProjectMemberModal } from "./components/AddProjectMemberModal"

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    project,
    resolvedClientName,
    activeTab,
    setActiveTab,
    projectMeasurements,
    metrics,
    projectMembers,
    activeMembersCount,
    canViewTeamTab,
    canApproveMeasurements,
    canManageMembers,
    isMember,
    reworkMeasurementId,
    isAddMemberModalOpen,
    notification,
    dismissNotification,
    approveMeasurement,
    rejectMeasurement,
    reworkMeasurement,
    deleteMeasurement,
    closeReworkModal,
    confirmRework,
    openAddMemberModal,
    closeAddMemberModal,
    handleAddMember,
    toggleMemberStatus,
    removeProjectMember,
    updateProjectStatus,
  } = useProjectDetail(id || "")

  if (!project) {
    return (
      <PageContainer className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Projeto não encontrado
        </h2>
        <p className="text-sm text-slate-500">
          O projeto solicitado não existe ou você não possui permissão para acessá-lo.
        </p>
        <Button onClick={() => navigate("/projetos")} variant="outline">
          Voltar para Projetos
        </Button>
      </PageContainer>
    )
  }

  const statusInfo = PROJECT_STATUS_CONFIG[project.status]

  return (
    <PageContainer className="space-y-6 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs shadow-sm border ${
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
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
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

      {/* Cabeçalho do Projeto */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/projetos")}
              className="h-9 w-9 shrink-0 border-slate-300 text-slate-600 hover:text-slate-900 mt-0.5"
              title="Voltar para Projetos"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {project.title}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${statusInfo.badgeClass}`}
                >
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Cliente: <strong className="text-slate-700">{resolvedClientName}</strong></span>
                </div>

                {project.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{project.address}</span>
                  </div>
                )}

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      {project.startDate ? `Início: ${project.startDate}` : ""}
                      {project.startDate && project.endDate ? " • " : ""}
                      {project.endDate ? `Previsão: ${project.endDate}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {project.description && (
                <p className="text-xs text-slate-600 max-w-2xl pt-1 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {canManageMembers && (
              <Select
                value={project.status}
                onChange={(e) =>
                  updateProjectStatus(project.id, e.target.value as ProjectStatus)
                }
                className="h-9 text-xs bg-slate-50 w-40"
              >
                <option value="active">Em andamento</option>
                <option value="paused">Pausado</option>
                <option value="completed">Concluído</option>
              </Select>
            )}

            <Button
              size="sm"
              onClick={() => navigate(`/medicoes/nova?projectId=${project.id}`)}
              className="h-9 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              Nova Medição na Obra
            </Button>
          </div>
        </div>

        {/* Submenu (Tabs) */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>
              {isMember ? "Minhas Medições na Obra" : "Dashboard e Medições da Obra"}
            </span>
            <span className="rounded-full bg-white/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
              {projectMeasurements.length}
            </span>
          </button>

          {canViewTeamTab && (
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "team"
                  ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Equipe da Obra</span>
              <span className="rounded-full bg-white/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
                {activeMembersCount}/{project.maxMembers}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "overview" && (
        <ProjectMeasurementsTab
          measurements={projectMeasurements}
          metrics={metrics}
          canApprove={canApproveMeasurements}
          isMember={isMember}
          onApprove={approveMeasurement}
          onRequestRework={reworkMeasurement}
          onReject={rejectMeasurement}
          onDelete={deleteMeasurement}
        />
      )}

      {activeTab === "team" && canViewTeamTab && (
        <ProjectTeamTab
          members={projectMembers}
          activeCount={activeMembersCount}
          maxMembers={project.maxMembers}
          canManage={canManageMembers}
          onOpenAddModal={openAddMemberModal}
          onToggleStatus={toggleMemberStatus}
          onRemoveMember={removeProjectMember}
        />
      )}

      {/* Modal de Solicitação de Revisão / Ajuste */}
      <RequestReworkModal
        isOpen={!!reworkMeasurementId}
        onClose={closeReworkModal}
        onConfirm={confirmRework}
      />

      {/* Modal de Adicionar Membro na Obra */}
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        existingUserIds={projectMembers.map((m) => m.userId)}
        onClose={closeAddMemberModal}
        onAdd={handleAddMember}
      />
    </PageContainer>
  )
}

export default ProjectDetailPage
