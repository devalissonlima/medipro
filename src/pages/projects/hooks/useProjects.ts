import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useRecentAccessStore } from "@/stores/recentAccessStore"
import type { Project, ProjectStatus, ProjectFolder } from "@/types/project"

export interface EnrichedProject extends Project {
  resolvedClientName: string
  folderName?: string
  measurementsCount: number
  pendingMeasurementsCount: number
  activeMembersCount: number
}

export interface EnrichedFolder extends ProjectFolder {
  projectsCount: number
}

export function useProjects(routeFolderId?: string | null) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const {
    projects,
    members,
    folders,
    addProject,
    updateProjectStatus,
    createFolder: storeCreateFolder,
    renameFolder: storeRenameFolder,
    deleteFolder: storeDeleteFolder,
    moveProjectToFolder,
    ensureSeedData,
  } = useProjectsStore()
  const { measurements } = useMeasurementsStore()
  const { clients } = useClientsStore()
  const { recentProjectsByUser } = useRecentAccessStore()

  useEffect(() => {
    ensureSeedData()
  }, [ensureSeedData])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const selectedFolderId = routeFolderId || null

  const canCreateProject =
    user?.role === "MANAGER" || user?.role === "SOLO" || user?.role === "MASTER"

  const canManageFolders =
    user?.role === "MANAGER" || user?.role === "SOLO" || user?.role === "MASTER"

  // Projetos visíveis conforme tenantId e role
  const accessibleProjects = useMemo(() => {
    if (!user) return []

    const tenantProjects = projects.filter((p) => p.tenantId === user.tenantId)

    if (user.role === "PROJECT_SUPERVISOR" || user.role === "MEMBER") {
      const userEmailNormalized = user.email?.trim().toLowerCase()
      const userNameNormalized = user.name?.trim().toLowerCase()

      const linkedProjectIds = new Set(
        members
          .filter(
            (m) =>
              (m.userId === user.id ||
                (userEmailNormalized &&
                  m.userEmail?.trim().toLowerCase() === userEmailNormalized) ||
                (userNameNormalized &&
                  m.userName?.trim().toLowerCase() === userNameNormalized)) &&
              m.status === "active"
          )
          .map((m) => m.projectId)
      )
      return tenantProjects.filter((p) => linkedProjectIds.has(p.id))
    }

    return tenantProjects
  }, [projects, members, user])

  // Pastas do tenant atual enriquecidas com quantidade de projetos acessíveis
  const tenantFolders = useMemo<EnrichedFolder[]>(() => {
    if (!user) return []
    const allTenantFolders = (folders || []).filter(
      (f) => f.tenantId === user.tenantId
    )

    const enriched = allTenantFolders.map((folder) => {
      const count = accessibleProjects.filter(
        (p) => p.folderId === folder.id
      ).length
      return {
        ...folder,
        projectsCount: count,
      }
    })

    if (!canManageFolders) {
      return enriched.filter((f) => f.projectsCount > 0)
    }

    return enriched
  }, [folders, user, accessibleProjects, canManageFolders])

  const selectedFolder = useMemo(
    () => tenantFolders.find((f) => f.id === selectedFolderId) || null,
    [tenantFolders, selectedFolderId]
  )

  // Verifica se routeFolderId na verdade é o ID de um projeto (para redirect retrocompatível)
  const matchedDirectProject = useMemo(() => {
    if (!selectedFolderId || selectedFolder) return null
    return accessibleProjects.find((p) => p.id === selectedFolderId) || null
  }, [selectedFolderId, selectedFolder, accessibleProjects])

  const setSelectedFolderId = (folderId: string | null) => {
    if (folderId) {
      navigate(`/projetos/${folderId}`)
    } else {
      navigate("/projetos")
    }
  }

  // Função auxiliar para enriquecer lista de projetos
  const enrichProjectsList = useMemo(() => {
    const isMember = user?.role === "MEMBER"
    const userNameNormalized = user?.name?.trim().toLowerCase()
    const folderMap = new Map(tenantFolders.map((f) => [f.id, f.name]))

    return (list: Project[]): EnrichedProject[] =>
      list.map((project) => {
        const client = clients.find((c) => c.id === project.clientId)
        const projectMeasurements = measurements.filter((m) => {
          if (m.projectId !== project.id) return false
          if (isMember) {
            return (
              m.collaboratorId === user?.id ||
              (userNameNormalized &&
                m.collaboratorName?.trim().toLowerCase() === userNameNormalized)
            )
          }
          return true
        })
        const activeMembersCount = members.filter(
          (m) => m.projectId === project.id && m.status === "active"
        ).length

        return {
          ...project,
          resolvedClientName:
            project.clientName || client?.name || "Cliente não vinculado",
          folderName: project.folderId
            ? folderMap.get(project.folderId)
            : undefined,
          measurementsCount: projectMeasurements.length,
          pendingMeasurementsCount: projectMeasurements.filter(
            (m) => m.status === "pending"
          ).length,
          activeMembersCount,
        }
      })
  }, [user, tenantFolders, clients, measurements, members])

  // Últimos 5 projetos acessados pelo usuário logado
  const recentProjects = useMemo<EnrichedProject[]>(() => {
    if (!user?.id) return []
    const ids = recentProjectsByUser[user.id] || []
    const found = ids
      .map((id) => accessibleProjects.find((p) => p.id === id))
      .filter((p): p is Project => Boolean(p))
      .slice(0, 5)
    return enrichProjectsList(found)
  }, [user?.id, recentProjectsByUser, accessibleProjects, enrichProjectsList])

  // Aplicar busca textual, filtro de status e contexto de pasta
  const filteredProjects = useMemo(() => {
    const isSearching = searchQuery.trim() !== ""

    return accessibleProjects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false
      }

      if (isSearching) {
        if (selectedFolderId && project.folderId !== selectedFolderId) {
          return false
        }

        const q = searchQuery.toLowerCase()
        const clientName =
          project.clientName ||
          clients.find((c) => c.id === project.clientId)?.name ||
          ""
        const folderName =
          tenantFolders.find((f) => f.id === project.folderId)?.name || ""

        const matchesTitle = project.title.toLowerCase().includes(q)
        const matchesClient = clientName.toLowerCase().includes(q)
        const matchesFolder = folderName.toLowerCase().includes(q)
        if (!matchesTitle && !matchesClient && !matchesFolder) return false
        return true
      }

      if (selectedFolderId) {
        return project.folderId === selectedFolderId
      }

      return !project.folderId
    })
  }, [
    accessibleProjects,
    statusFilter,
    searchQuery,
    selectedFolderId,
    clients,
    tenantFolders,
  ])

  const enrichedProjects = useMemo(
    () => enrichProjectsList(filteredProjects),
    [enrichProjectsList, filteredProjects]
  )

  const handleCreateFolder = (name: string, color?: string) => {
    if (!user || !name.trim()) return null
    return storeCreateFolder({
      name: name.trim(),
      tenantId: user.tenantId,
      color,
    })
  }

  const handleRenameFolder = (
    folderId: string,
    newName: string,
    color?: string
  ) => {
    storeRenameFolder(folderId, newName, color)
  }

  const handleDeleteFolder = (folderId: string) => {
    storeDeleteFolder(folderId)
    if (selectedFolderId === folderId) {
      navigate("/projetos", { replace: true })
    }
  }

  const createProject = (payload: {
    title: string
    clientId: string
    folderId?: string | null
    status: ProjectStatus
    description?: string
    address?: string
    startDate?: string
    endDate?: string
  }): Project | null => {
    if (!user) return null
    const client = clients.find((c) => c.id === payload.clientId)
    const planMaxMembers = user.role === "SOLO" ? 1 : 5

    return addProject({
      tenantId: user.tenantId,
      folderId: payload.folderId ?? selectedFolderId ?? null,
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
    recentProjects,
    folders: tenantFolders,
    selectedFolderId,
    selectedFolder,
    matchedDirectProject,
    setSelectedFolderId,
    totalCount: accessibleProjects.length,
    clients,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    canCreateProject,
    canManageFolders,
    isSolo: user?.role === "SOLO",
    isMember: user?.role === "MEMBER",
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    createProject,
    updateProjectStatus,
    createFolder: handleCreateFolder,
    renameFolder: handleRenameFolder,
    deleteFolder: handleDeleteFolder,
    moveProjectToFolder,
  }
}
