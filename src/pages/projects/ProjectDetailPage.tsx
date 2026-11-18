import React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  File,
  ReceiptText,
  Users,
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
import { getProjectUrl } from "@/utils/projectRoutes"
import { useAuthStore } from "@/stores/authStore"
import { useRecentAccessStore } from "@/stores/recentAccessStore"
import { useBudgetsStore } from "@/stores/budgetsStore"
import { useProjectDetail } from "./hooks/useProjectDetail"
import { ProjectDashboardTab } from "./components/ProjectDashboardTab"
import { ProjectMeasurementsTab } from "./components/ProjectMeasurementsTab"
import { ProjectBudgetsTab } from "./components/ProjectBudgetsTab"
import { ProjectTeamTab } from "./components/ProjectTeamTab"
import { AddProjectMemberModal } from "./components/AddProjectMemberModal"

export const ProjectDetailPage: React.FC = () => {
  const { id, folderId } = useParams<{ id: string; folderId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const trackProjectView = useRecentAccessStore((state) => state.trackProjectView)

  const {
    project,
    resolvedClientName,
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
    approveMeasurement,
    rejectMeasurement,
    reworkMeasurement,
    finalizeMeasurement,
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

  // Detecção da aba ativa pela URL
  const isTeamRoute = location.pathname.endsWith("/equipe")
  const isMeasurementsRoute = location.pathname.endsWith("/medicoes")
  const isBudgetsRoute = location.pathname.endsWith("/orcamentos")
  const currentTab: "dashboard" | "measurements" | "budgets" | "team" = isTeamRoute
    ? "team"
    : isBudgetsRoute
    ? "budgets"
    : isMeasurementsRoute
    ? "measurements"
    : "dashboard"

  const canViewBudgetsTab = !isMember
  const budgets = useBudgetsStore((state) => state.budgets)
  const projectBudgetsCount = React.useMemo(
    () => budgets.filter((b) => b.projectId === id).length,
    [budgets, id]
  )

  // Restringir criação de medição na obra exclusivamente a SOLO e MEMBER
  const canCreateMeasurement = user?.role === "SOLO" || user?.role === "MEMBER"

  React.useEffect(() => {
    if (project && user?.id) {
      trackProjectView(project.id, user.id)
    }
  }, [project?.id, user?.id, trackProjectView])

  React.useEffect(() => {
    if (
      ((isTeamRoute && !canViewTeamTab) ||
        (isBudgetsRoute && !canViewBudgetsTab)) &&
      project
    ) {
      navigate(getProjectUrl(project, "dashboard"), { replace: true })
    }
  }, [
    isTeamRoute,
    canViewTeamTab,
    isBudgetsRoute,
    canViewBudgetsTab,
    project,
    navigate,
  ])

  // Mantém a rota canônica projetos > [idpasta] > [idprojeto] > [tab] quando o projeto pertence a uma pasta
  React.useEffect(() => {
    if (!project) return
    const tabSlug =
      currentTab === "team"
        ? "equipe"
        : currentTab === "budgets"
        ? "orcamentos"
        : currentTab === "measurements"
        ? "medicoes"
        : "dashboard"
    if (project.folderId && folderId !== project.folderId) {
      navigate(getProjectUrl(project, tabSlug), { replace: true })
    }
  }, [project, folderId, currentTab, navigate])

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
  const backTargetUrl = project.folderId
    ? `/projetos/${project.folderId}`
    : "/projetos"

  return (
    <PageContainer className="space-y-6 pb-20">
      {/* Cabeçalho do Projeto */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(backTargetUrl)}
              className="h-9 w-9 shrink-0 border-slate-300 text-slate-600 hover:text-slate-900 mt-0.5"
              title={
                project.folderId
                  ? "Voltar para a pasta do projeto"
                  : "Voltar para Projetos"
              }
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
                  <span>
                    Cliente: <strong className="text-slate-700">{resolvedClientName}</strong>
                  </span>
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

            {canCreateMeasurement && (
              <Button
                size="sm"
                onClick={() => navigate(`/medicoes/nova?projectId=${project.id}`)}
                className="h-9 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400" />
                <span>Nova Medição na Obra</span>
              </Button>
            )}
          </div>
        </div>

        {/* Submenu com 3 Abas: Dashboard, Medições e Equipe */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-t border-slate-100 pt-3 overflow-x-auto">
          {/* Aba 1: Dashboard */}
          <Button
            type="button"
            variant="unstyled"
            size="auto"
            onClick={() => navigate(getProjectUrl(project, "dashboard"))}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 ${
              currentTab === "dashboard"
                ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          {/* Aba 2: Medições */}
          <Button
            type="button"
            variant="unstyled"
            size="auto"
            onClick={() => navigate(getProjectUrl(project, "medicoes"))}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 ${
              currentTab === "measurements"
                ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <File className="h-4 w-4" />
            <span>{isMember ? "Minhas Medições" : "Medições da Obra"}</span>
            <span className="rounded-full bg-white/90 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
              {projectMeasurements.length}
            </span>
          </Button>

          {/* Aba 3: Orçamentos (oculta para MEMBER) */}
          {canViewBudgetsTab && (
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => navigate(getProjectUrl(project, "orcamentos"))}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 ${
                currentTab === "budgets"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <ReceiptText className="h-4 w-4" />
              <span>Orçamentos</span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
                {projectBudgetsCount}
              </span>
            </Button>
          )}

          {/* Aba 4: Equipe (oculta para membros e solo sem permissão) */}
          {canViewTeamTab && (
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => navigate(getProjectUrl(project, "equipe"))}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 ${
                currentTab === "team"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Equipe da Obra</span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
                {activeMembersCount}/{project.maxMembers}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo das 3 Tabs */}
      {currentTab === "dashboard" && (
        <ProjectDashboardTab
          project={project}
          measurements={projectMeasurements}
          metrics={metrics}
          scopeItems={project.scopeItems}
          isMember={isMember}
          canViewTeam={canViewTeamTab}
          activeMembersCount={activeMembersCount}
          canCreateMeasurement={canCreateMeasurement}
          onNavigateToMeasurements={() =>
            navigate(getProjectUrl(project, "medicoes"))
          }
          onNavigateToTeam={() => navigate(getProjectUrl(project, "equipe"))}
        />
      )}

      {currentTab === "measurements" && (
        <ProjectMeasurementsTab
          measurements={projectMeasurements}
          canApprove={canApproveMeasurements}
          isMember={isMember}
          canCreateMeasurement={canCreateMeasurement}
          projectId={project.id}
          onApprove={approveMeasurement}
          onRequestRework={reworkMeasurement}
          onReject={rejectMeasurement}
          onDelete={deleteMeasurement}
          onFinalize={finalizeMeasurement}
        />
      )}

      {currentTab === "budgets" && canViewBudgetsTab && (
        <ProjectBudgetsTab project={project} />
      )}

      {currentTab === "team" && canViewTeamTab && (
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
