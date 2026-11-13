import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import type { ProjectMember } from "@/types/project"

export type ProjectDetailTab = "overview" | "team"

export function useProjectDetail(projectId: string) {
  const user = useAuthStore((state) => state.user)
  const {
    projects,
    members,
    addProjectMember,
    toggleMemberStatus,
    removeProjectMember,
    updateProjectStatus,
  } = useProjectsStore()
  const { measurements, updateStatus, notification, setNotification } =
    useMeasurementsStore()
  const { clients } = useClientsStore()

  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("overview")
  const [reworkMeasurementId, setReworkMeasurementId] = useState<string | null>(null)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

  // Validação de acesso à obra conforme RBAC
  const isAccessible = useMemo(() => {
    if (!user) return false
    if (user.role === "MANAGER" || user.role === "MASTER" || user.role === "SOLO") return true

    const userEmailNormalized = user.email?.trim().toLowerCase()
    const userNameNormalized = user.name?.trim().toLowerCase()

    return members.some(
      (m) =>
        m.projectId === projectId &&
        (m.userId === user.id ||
          (userEmailNormalized && m.userEmail?.trim().toLowerCase() === userEmailNormalized) ||
          (userNameNormalized && m.userName?.trim().toLowerCase() === userNameNormalized)) &&
        m.status === "active"
    )
  }, [members, projectId, user])

  const project = useMemo(() => {
    const found = projects.find((p) => p.id === projectId) || null
    if (!found) return null
    if (user && found.tenantId !== user.tenantId) return null
    if (!isAccessible) return null
    return found
  }, [projects, projectId, user, isAccessible])

  const resolvedClientName = useMemo(() => {
    if (!project) return ""
    if (project.clientName) return project.clientName
    return clients.find((c) => c.id === project.clientId)?.name || "Cliente não informado"
  }, [project, clients])

  // Medições desta obra (para MEMBER, estritamente APENAS as suas próprias medições)
  const projectMeasurements = useMemo(() => {
    const isMember = user?.role === "MEMBER"
    const userNameNormalized = user?.name?.trim().toLowerCase()

    return measurements.filter((m) => {
      if (m.projectId !== projectId) return false

      // Regra de Isolamento estrito para MEMBER:
      // O membro só pode ver APENAS as medições criadas por ele mesmo
      if (isMember) {
        const isAuthor =
          m.collaboratorId === user?.id ||
          (userNameNormalized && m.collaboratorName?.trim().toLowerCase() === userNameNormalized)
        return isAuthor
      }

      // Para Supervisor, Gestor e Master:
      // Rascunhos de terceiros não devem ser vistos na lista do projeto
      if (m.status === "draft") {
        return (
          m.collaboratorId === user?.id ||
          (userNameNormalized && m.collaboratorName?.trim().toLowerCase() === userNameNormalized)
        )
      }

      return true
    })
  }, [measurements, projectId, user])

  // KPIs isolados da obra
  const metrics = useMemo(() => {
    const approvedTotal = projectMeasurements
      .filter((m) => m.status === "approved")
      .reduce((acc, m) => acc + m.grandTotal, 0)

    const pendingTotal = projectMeasurements
      .filter((m) => m.status === "pending")
      .reduce((acc, m) => acc + m.grandTotal, 0)

    const reworkCount = projectMeasurements.filter(
      (m) => m.status === "rework"
    ).length

    const pendingCount = projectMeasurements.filter(
      (m) => m.status === "pending"
    ).length

    return {
      approvedTotal,
      pendingTotal,
      reworkCount,
      pendingCount,
      totalCount: projectMeasurements.length,
    }
  }, [projectMeasurements])

  // Membros vinculados a esta obra
  const projectMembers = useMemo(() => {
    return members.filter((m) => m.projectId === projectId)
  }, [members, projectId])

  const activeMembersCount = useMemo(() => {
    return projectMembers.filter((m) => m.status === "active").length
  }, [projectMembers])

  // Regras RBAC (Aba Equipe oculta para SOLO e MEMBER)
  const canViewTeamTab = user?.role !== "SOLO" && user?.role !== "MEMBER"
  const canApproveMeasurements =
    user?.role === "MANAGER" ||
    user?.role === "PROJECT_SUPERVISOR" ||
    user?.role === "SOLO" ||
    user?.role === "MASTER"
  const canManageMembers = canApproveMeasurements && user?.role !== "MEMBER" && user?.role !== "SOLO"

  // Ações sobre medições da obra
  const approveMeasurement = (measurementId: string) => {
    if (!canApproveMeasurements) return
    updateStatus(measurementId, "approved")
  }

  const rejectMeasurement = (measurementId: string, reason?: string) => {
    if (!canApproveMeasurements) return
    updateStatus(measurementId, "rejected", reason)
  }

  const reworkMeasurement = (measurementId: string, note: string) => {
    if (!canApproveMeasurements) return
    updateStatus(measurementId, "rework", note)
  }

  const finalizeMeasurement = (measurementId: string) => {
    const target = measurements.find((m) => m.id === measurementId)
    if (!target) return
    updateStatus(measurementId, "pending")
    setNotification({
      message: `Medição "${target.title}" finalizada e disponibilizada na obra com sucesso!`,
      type: "success",
    })
  }

  const deleteMeasurement = (measurementId: string) => {
    const target = measurements.find((m) => m.id === measurementId)
    if (target?.status === "approved") {
      setNotification({
        message: "Medições aprovadas não podem ser excluídas.",
        type: "error",
      })
      return
    }
    useMeasurementsStore.getState().deleteMeasurement(measurementId)
  }

  const openReworkModal = (measurementId: string) => {
    if (!canApproveMeasurements) return
    setReworkMeasurementId(measurementId)
  }

  const closeReworkModal = () => setReworkMeasurementId(null)

  const confirmRework = (note: string) => {
    if (reworkMeasurementId && canApproveMeasurements) {
      updateStatus(reworkMeasurementId, "rework", note)
      closeReworkModal()
    }
  }

  // Ações sobre equipe da obra
  const handleAddMember = (
    data: Omit<ProjectMember, "id" | "projectId">
  ): { success: boolean; error?: string } => {
    return addProjectMember({
      ...data,
      projectId,
    })
  }

  return {
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
    isMember: user?.role === "MEMBER",
    reworkMeasurementId,
    isAddMemberModalOpen,
    notification,
    dismissNotification: () => setNotification(null),
    approveMeasurement,
    rejectMeasurement,
    reworkMeasurement,
    finalizeMeasurement,
    deleteMeasurement,
    openReworkModal,
    closeReworkModal,
    confirmRework,
    openAddMemberModal: () => setIsAddMemberModalOpen(true),
    closeAddMemberModal: () => setIsAddMemberModalOpen(false),
    handleAddMember,
    toggleMemberStatus,
    removeProjectMember,
    updateProjectStatus,
  }
}
