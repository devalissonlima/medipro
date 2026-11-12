import { useMemo } from "react"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import type { Measurement } from "@/types/measurement"

export function useMeasurements() {
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

  // Lista filtrada
  const filteredMeasurements = useMemo(() => {
    return measurements.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.clientName &&
          item.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location &&
          item.location.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [measurements, searchTerm, statusFilter])

  // Métricas agregadas
  const metrics = useMemo(() => {
    const totalCount = measurements.length
    const pendingCount = measurements.filter((m) => m.status === "pending").length
    const approvedCount = measurements.filter((m) => m.status === "approved").length
    const reworkCount = measurements.filter((m) => m.status === "rework").length

    const totalValue = measurements.reduce((acc, m) => acc + m.grandTotal, 0)
    const approvedValue = measurements
      .filter((m) => m.status === "approved")
      .reduce((acc, m) => acc + m.grandTotal, 0)

    return {
      totalCount,
      pendingCount,
      approvedCount,
      reworkCount,
      totalValue,
      approvedValue,
    }
  }, [measurements])

  // Compartilhamento via Clipboard
  const copyShareLink = async (measurement: Measurement) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/medicao/${measurement.shareableUrlToken}`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // Fallback para ambientes com restrição de clipboard
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

  const dismissNotification = () => setNotification(null)

  return {
    measurements: filteredMeasurements,
    totalCount: measurements.length,
    filteredCount: filteredMeasurements.length,
    metrics,
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
    copyShareLink,
    dismissNotification,
  }
}
