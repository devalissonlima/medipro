import { useState, useMemo } from "react"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import type { MeasurementStatus } from "@/types/measurement"
import type { DashboardPeriod } from "@/types/dashboard"
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns"

export function useDashboardFilters() {
  const { measurements, updateStatus, bulkApprove, notification, setNotification } =
    useMeasurementsStore()

  const [period, setPeriod] = useState<DashboardPeriod>("all")
  const [memberId, setMemberId] = useState<string | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MeasurementStatus | "all">("all")

  // Seleção múltipla para aprovação em massa
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal para solicitar revisão
  const [reworkMeasurementId, setReworkMeasurementId] = useState<string | null>(null)

  // Filtragem combinada
  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) => {
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

        if (!matchesTitle && !matchesLocation && !matchesMember && !matchesClient) {
          return false
        }
      }

      return true
    })
  }, [measurements, period, memberId, statusFilter, searchQuery])

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
    setMemberId("all")
    setSearchQuery("")
    setStatusFilter("all")
  }

  return {
    period,
    setPeriod,
    memberId,
    setMemberId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredMeasurements,
    allMeasurements: measurements,
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
