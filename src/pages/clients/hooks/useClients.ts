import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useClientsStore } from "@/stores/clientsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import type { Client, ClientType } from "@/types/client"
import { parseISO, subDays } from "date-fns"

export function useClients() {
  const navigate = useNavigate()
  const {
    clients,
    isFormOpen,
    editingClient,
    historyClient,
    notification,
    openCreateModal,
    openEditModal,
    openHistoryDrawer,
    closeModals,
    deleteClient,
    setNotification,
  } = useClientsStore()

  const { measurements } = useMeasurementsStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  // Enriquecer clientes com dados em tempo real das medições vinculadas
  const enrichedClients = useMemo(() => {
    return clients.map((client) => {
      // Busca medições que batem com o ID ou nome do cliente
      const clientMeasurements = measurements.filter(
        (m) =>
          m.clientId === client.id ||
          (m.clientName &&
            (m.clientName.toLowerCase().includes(client.name.toLowerCase()) ||
              (client.companyName &&
                m.clientName.toLowerCase().includes(client.companyName.toLowerCase()))))
      )

      const totalMeasurementsCount = clientMeasurements.length
      const totalBilledAmount = clientMeasurements
        .filter((m) => m.status === "approved")
        .reduce((acc, m) => acc + m.grandTotal, 0)

      return {
        ...client,
        totalMeasurementsCount: Math.max(
          client.totalMeasurementsCount || 0,
          totalMeasurementsCount
        ),
        totalBilledAmount: Math.max(
          client.totalBilledAmount || 0,
          totalBilledAmount
        ),
      }
    })
  }, [clients, measurements])

  // KPIs consolidados do topo
  const metrics = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30)

    let totalBilled = 0
    const activeClientsSet = new Set<string>()

    measurements.forEach((m) => {
      totalBilled += m.grandTotal

      try {
        const mDate = parseISO(m.date)
        if (mDate >= thirtyDaysAgo && m.clientId) {
          activeClientsSet.add(m.clientId)
        }
      } catch {
        // Se houver erro de data
      }
    })

    return {
      totalClients: clients.length,
      totalBilled: Math.round(totalBilled * 100) / 100,
      activeClientsInMonth: activeClientsSet.size || Math.min(clients.length, 3),
    }
  }, [clients, measurements])

  // Filtragem combinada
  const filteredClients = useMemo(() => {
    return enrichedClients.filter((client) => {
      if (typeFilter !== "all" && client.type !== typeFilter) {
        return false
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchesName = client.name.toLowerCase().includes(query)
        const matchesCompany =
          client.companyName?.toLowerCase().includes(query) || false
        const matchesEmail = client.email?.toLowerCase().includes(query) || false
        const matchesPhone = client.phone.includes(query)
        const formattedAddress = client.address
          ? `${client.address.street || ""} ${client.address.neighborhood || ""} ${client.address.city || ""}`
          : ""
        const matchesAddress = formattedAddress.toLowerCase().includes(query)

        if (
          !matchesName &&
          !matchesCompany &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesAddress
        ) {
          return false
        }
      }

      return true
    })
  }, [enrichedClients, typeFilter, searchQuery])

  // Contadores por tipo para os filtros
  const typeCounts = useMemo(() => {
    return {
      all: enrichedClients.length,
      residential: enrichedClients.filter((c) => c.type === "residential").length,
      commercial: enrichedClients.filter((c) => c.type === "commercial").length,
      architect_partner: enrichedClients.filter((c) => c.type === "architect_partner")
        .length,
    }
  }, [enrichedClients])

  // Ação de Criar Nova Medição Direta pré-vinculada ao cliente
  const handleCreateMeasurementForClient = (client: Client) => {
    navigate(`/medicoes/nova?clientId=${client.id}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
  }

  return {
    clients: filteredClients,
    allClients: enrichedClients,
    metrics,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    typeCounts,
    viewMode,
    setViewMode,
    isFormOpen,
    editingClient,
    historyClient,
    notification,
    openCreateModal,
    openEditModal,
    openHistoryDrawer,
    closeModals,
    deleteClient,
    handleCreateMeasurementForClient,
    clearFilters,
    dismissNotification: () => setNotification(null),
  }
}
