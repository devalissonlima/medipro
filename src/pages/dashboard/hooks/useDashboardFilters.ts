import { useState, useMemo } from "react"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useAuthStore } from "@/stores/authStore"
import type { MeasurementStatus } from "@/types/measurement"
import type { DashboardPeriod } from "@/types/dashboard"
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns"

export function useDashboardFilters() {
  const user = useAuthStore((state) => state.user)
  const { projects } = useProjectsStore()
  const { measurements, updateStatus, bulkApprove, notification, setNotification } =
    useMeasurementsStore()

  const [period, setPeriod] = useState<DashboardPeriod>("all")
  const [projectId, setProjectId] = useState<string | "all">("all")
  const [memberId, setMemberId] = useState<string | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MeasurementStatus | "all">("all")

  // Seleção múltipla para aprovação em massa
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal para solicitar revisão
  const [reworkMeasurementId, setReworkMeasurementId] = useState<string | null>(null)

  // Projetos pertencentes ao tenant atual (para popular o Select "Filtrar por Projeto")
  const tenantProjects = useMemo(() => {
    if (!user) return projects
    return projects.filter((p) => p.tenantId === user.tenantId)
  }, [projects, user])

  // Medições do tenant (se houver projectId do tenant ou isTeamContext)
  // Rascunhos ("draft") são privados do autor e só aparecem no dashboard após envio ("pending")
  const tenantMeasurements = useMemo(() => {
    const projectIds = new Set(tenantProjects.map((p) => p.id))
    return measurements.filter(
      (m) => m.status !== "draft" && (!m.projectId || projectIds.has(m.projectId))
    )
  }, [measurements, tenantProjects])

  // Medições no escopo do Projeto selecionado (usado para contadores de tabs)
  const projectScopedMeasurements = useMemo(() => {
    if (projectId === "all") return tenantMeasurements
    return tenantMeasurements.filter((m) => m.projectId === projectId)
  }, [tenantMeasurements, projectId])

  // Filtragem combinada
  const filteredMeasurements = useMemo(() => {
    return projectScopedMeasurements.filter((m) => {
      // 1. Filtro temporal
      if (period !== "all") {
        try {
          const dateObj = parseISO(m.date)
          if (period === "today" && !isToday(dateObj)) return false
          if (period === "week" && !isThisWeek(dateObj, { weekStartsOn: 1 }))
            return false
          if (period === "month" && !isThisMonth(dateObj)) return false
        } catch {
          // Se houver erro de parsing, não exclui
        }
      }

      // 2. Filtro por Colaborador
      if (memberId !== "all") {
        if (m.collaboratorId !== memberId && m.collaboratorName !== memberId) {
          return false
        }
      }

      // 3. Filtro por Status
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false
      }

      // 4. Busca Textual
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchesTitle = m.title.toLowerCase().includes(query)
        const matchesLocation = m.location?.toLowerCase().includes(query) || false
        const matchesMember =
          m.collaboratorName?.toLowerCase().includes(query) || false
        const matchesClient = m.clientName?.toLowerCase().includes(query) || false
        const matchesProject = m.projectTitle?.toLowerCase().includes(query) || false

        if (
          !matchesTitle &&
          !matchesLocation &&
          !matchesMember &&
          !matchesClient &&
          !matchesProject
        ) {
          return false
        }
      }

      return true
    })
  }, [projectScopedMeasurements, period, memberId, statusFilter, searchQuery])

  // IDs pendentes na lista filtrada
  const pendingFilteredIds = useMemo(() => {
    return filteredMeasurements
      .filter((m) => m.status === "pending")
      .map((m) => m.id)
  }, [filteredMeasurements])

  // Valor total selecionado para aprovação em massa
  const bulkSelectedTotal = useMemo(() => {
    const selectedSet = new Set(selectedIds)
    return measurements
      .filter((m) => selectedSet.has(m.id))
      .reduce((acc, m) => acc + m.grandTotal, 0)
  }, [measurements, selectedIds])

  // Ações de seleção
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectAllPending = () => {
    if (selectedIds.length === pendingFilteredIds.length && pendingFilteredIds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingFilteredIds)
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  // Executar Aprovação em Lote
  const executeBulkApproval = () => {
    if (selectedIds.length === 0) return
    bulkApprove(selectedIds)
    clearSelection()
  }

  // Ações individuais
  const approveSingle = (id: string) => {
    updateStatus(id, "approved")
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
  }

  const openReworkModal = (id: string) => {
    setReworkMeasurementId(id)
  }

  const closeReworkModal = () => {
    setReworkMeasurementId(null)
  }

  const confirmRework = (note: string) => {
    if (reworkMeasurementId) {
      updateStatus(reworkMeasurementId, "rework", note)
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== reworkMeasurementId))
      closeReworkModal()
    }
  }

  const clearFilters = () => {
    setPeriod("all")
    setProjectId("all")
    setMemberId("all")
    setSearchQuery("")
    setStatusFilter("all")
  }

  return {
    period,
    setPeriod,
    projectId,
    setProjectId,
    projects: tenantProjects,
    memberId,
    setMemberId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredMeasurements,
    allMeasurements: projectScopedMeasurements,
    selectedIds,
    pendingFilteredIds,
    bulkSelectedTotal,
    reworkMeasurementId,
    notification,
    toggleSelect,
    selectAllPending,
    clearSelection,
    executeBulkApproval,
    approveSingle,
    openReworkModal,
    closeReworkModal,
    confirmRework,
    clearFilters,
    dismissNotification: () => setNotification(null),
  }
}
