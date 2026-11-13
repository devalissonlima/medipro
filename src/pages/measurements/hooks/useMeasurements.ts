import { useMemo } from "react"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useAuthStore } from "@/stores/authStore"
import { useProjectsStore } from "@/stores/projectsStore"
import type { Measurement, MeasurementStatus } from "@/types/measurement"

export function useMeasurements() {
  const user = useAuthStore((state) => state.user)
  const { projects } = useProjectsStore()
  const {
    measurements,
    searchTerm,
    statusFilter,
    selectedMeasurement,
    shareModalMeasurement,
    notification,
    setSearchTerm,
    setStatusFilter,
    deleteMeasurement,
    duplicateMeasurement,
    updateStatus,
    openDetailModal,
    closeDetailModal,
    openShareModal,
    closeShareModal,
    setNotification,
  } = useMeasurementsStore()

  // Escopo visível por papel:
  // MEMBER e SOLO vêem suas próprias medições
  // Gestores vêem medições não-rascunho dos projetos do seu tenant
  const scopedMeasurements = useMemo(() => {
    if (!user) return []

    if (user.role === "MEMBER" || user.role === "SOLO") {
      return measurements.filter(
        (m) =>
          m.collaboratorId === user.id ||
          m.collaboratorName === user.name ||
          (user.role === "SOLO" && !m.isTeamContext && !m.collaboratorId)
      )
    }

    const tenantProjectIds = new Set(
      projects.filter((p) => p.tenantId === user.tenantId).map((p) => p.id)
    )
    return measurements.filter(
      (m) => !m.projectId || tenantProjectIds.has(m.projectId)
    )
  }, [measurements, projects, user])

  // Lista filtrada
  const filteredMeasurements = useMemo(() => {
    return scopedMeasurements.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.clientName &&
          item.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location &&
          item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.projectTitle &&
          item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [scopedMeasurements, searchTerm, statusFilter])

  // Métricas agregadas
  const metrics = useMemo(() => {
    const totalCount = scopedMeasurements.length
    const draftCount = scopedMeasurements.filter((m) => m.status === "draft").length
    const pendingCount = scopedMeasurements.filter((m) => m.status === "pending").length
    const approvedCount = scopedMeasurements.filter((m) => m.status === "approved").length
    const reworkCount = scopedMeasurements.filter((m) => m.status === "rework").length

    const totalValue = scopedMeasurements.reduce((acc, m) => acc + m.grandTotal, 0)
    const approvedValue = scopedMeasurements
      .filter((m) => m.status === "approved")
      .reduce((acc, m) => acc + m.grandTotal, 0)

    return {
      totalCount,
      draftCount,
      pendingCount,
      approvedCount,
      reworkCount,
      totalValue,
      approvedValue,
    }
  }, [scopedMeasurements])

  // Compartilhamento via Clipboard
  const copyShareLink = async (measurement: Measurement) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/medicao/${measurement.shareableUrlToken}`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }

      setNotification({
        message: "Link copiado para envio no WhatsApp!",
        type: "success",
      })
    } catch {
      setNotification({
        message: `Link: ${shareUrl}`,
        type: "info",
      })
    }
  }

  const finalizeMeasurement = (id: string) => {
    const item = measurements.find((m) => m.id === id)
    if (!item) return
    updateStatus(id, "pending")
    setNotification({
      message: `Medição "${item.title}" finalizada e enviada para conferência com sucesso!`,
      type: "success",
    })
  }

  const dismissNotification = () => setNotification(null)

  return {
    measurements: filteredMeasurements,
    totalCount: scopedMeasurements.length,
    filteredCount: filteredMeasurements.length,
    metrics,
    searchTerm,
    statusFilter: statusFilter as MeasurementStatus | "all",
    selectedMeasurement,
    shareModalMeasurement,
    notification,
    setSearchTerm,
    setStatusFilter,
    deleteMeasurement,
    duplicateMeasurement,
    finalizeMeasurement,
    updateStatus,
    openDetailModal,
    closeDetailModal,
    openShareModal,
    closeShareModal,
    copyShareLink,
    dismissNotification,
  }
}
