import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import type { Project, ProjectStatus } from "@/types/project"

export function useProjects() {
  const user = useAuthStore((state) => state.user)
  const { projects, members, addProject, updateProjectStatus } = useProjectsStore()
  const { measurements } = useMeasurementsStore()
  const { clients } = useClientsStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const canCreateProject =
    user?.role === "MANAGER" || user?.role === "SOLO" || user?.role === "MASTER"

  // Projetos visíveis conforme tenantId e role
  const accessibleProjects = useMemo(() => {
    if (!user) return []

    const tenantProjects = projects.filter((p) => p.tenantId === user.tenantId)

    if (user.role === "PROJECT_SUPERVISOR" || user.role === "MEMBER") {
      // Encarregados e Membros veem os projetos onde estão alocados como membros ativos
      const userEmailNormalized = user.email?.trim().toLowerCase()
      const userNameNormalized = user.name?.trim().toLowerCase()

      const linkedProjectIds = new Set(
        members
          .filter(
            (m) =>
              (m.userId === user.id ||
                (userEmailNormalized && m.userEmail?.trim().toLowerCase() === userEmailNormalized) ||
                (userNameNormalized && m.userName?.trim().toLowerCase() === userNameNormalized)) &&
              m.status === "active"
          )
          .map((m) => m.projectId)
      )
      return tenantProjects.filter((p) => linkedProjectIds.has(p.id))
    }

    return tenantProjects
  }, [projects, members, user])

  // Aplicar busca e filtro de status
  const filteredProjects = useMemo(() => {
    return accessibleProjects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase()
        const clientName =
          project.clientName ||
          clients.find((c) => c.id === project.clientId)?.name ||
          ""
        const matchesTitle = project.title.toLowerCase().includes(q)
        const matchesClient = clientName.toLowerCase().includes(q)
        if (!matchesTitle && !matchesClient) return false
      }

      return true
    })
  }, [accessibleProjects, statusFilter, searchQuery, clients])

  // Enriquecer projetos com nome do cliente, contagem de medições e membros
  const enrichedProjects = useMemo(() => {
    const isMember = user?.role === "MEMBER"
    const userNameNormalized = user?.name?.trim().toLowerCase()

    return filteredProjects.map((project) => {
      const client = clients.find((c) => c.id === project.clientId)
      const projectMeasurements = measurements.filter((m) => {
        if (m.projectId !== project.id) return false
        if (isMember) {
          return (
            m.collaboratorId === user?.id ||
            (userNameNormalized && m.collaboratorName?.trim().toLowerCase() === userNameNormalized)
          )
        }
        return true
      })
      const activeMembersCount = members.filter(
        (m) => m.projectId === project.id && m.status === "active"
      ).length

      return {
        ...project,
        resolvedClientName: project.clientName || client?.name || "Cliente não vinculado",
        measurementsCount: projectMeasurements.length,
        pendingMeasurementsCount: projectMeasurements.filter(
          (m) => m.status === "pending"
        ).length,
        activeMembersCount,
      }
    })
  }, [filteredProjects, clients, measurements, members, user])

  const createProject = (payload: {
    title: string
    clientId: string
    status: ProjectStatus
    description?: string
    address?: string
    startDate?: string
    endDate?: string
  }): Project | null => {
    if (!user) return null
    const client = clients.find((c) => c.id === payload.clientId)

    // Limite de vagas herdado automaticamente do plano da conta:
    // SOLO = 1 membro; Demais (Plano Pro) = 5 membros por obra
    const planMaxMembers = user.role === "SOLO" ? 1 : 5

    return addProject({
      tenantId: user.tenantId,
      clientId: payload.clientId,
      clientName: client?.name || "Cliente",
      title: payload.title,
      description: payload.description,
      address: payload.address,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status,
      maxMembers: planMaxMembers,
    })
  }

  return {
    projects: enrichedProjects,
    totalCount: accessibleProjects.length,
    clients,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    canCreateProject,
    isSolo: user?.role === "SOLO",
    isMember: user?.role === "MEMBER",
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    createProject,
    updateProjectStatus,
  }
}
