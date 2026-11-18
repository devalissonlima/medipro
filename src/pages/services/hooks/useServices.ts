import { useMemo } from "react"
import { useServicesStore } from "@/stores/servicesStore"
import type { CatalogItemType, ServiceCategory } from "@/types/service"

export function useServices() {
  const {
    services,
    searchTerm,
    selectedCategory,
    selectedItemType,
    viewMode,
    isFormOpen,
    editingService,
    notification,
    setSearchTerm,
    setSelectedCategory,
    setSelectedItemType,
    setViewMode,
    openCreateModal,
    openEditModal,
    closeFormModal,
    deleteService,
    setNotification,
  } = useServicesStore()

  // Lista filtrada por natureza, busca textual e categoria
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesType =
        selectedItemType === "all" ||
        (service.itemType || "labor") === selectedItemType

      const matchesSearch =
        searchTerm.trim() === "" ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description &&
          service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.complexityTags &&
          service.complexityTags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))

      const matchesCategory =
        selectedCategory === "Todas" || service.category === selectedCategory

      return matchesType && matchesSearch && matchesCategory
    })
  }, [services, searchTerm, selectedCategory, selectedItemType])

  // Contagem por natureza
  const itemTypeCounts = useMemo(() => {
    const counts: Record<CatalogItemType | "all", number> = {
      all: services.length,
      labor: 0,
      material: 0,
      subcontract: 0,
    }
    services.forEach((s) => {
      const type = s.itemType || "labor"
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  }, [services])

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todas: services.length,
    }
    services.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1
    })
    return counts
  }, [services])

  const dismissNotification = () => setNotification(null)

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Todas")
    setSelectedItemType("all")
  }

  return {
    services: filteredServices,
    totalCount: services.length,
    filteredCount: filteredServices.length,
    categoryCounts,
    itemTypeCounts,
    searchTerm,
    selectedCategory,
    selectedItemType,
    viewMode,
    isFormOpen,
    editingService,
    notification,
    setSearchTerm,
    setSelectedCategory: (cat: ServiceCategory | "Todas") =>
      setSelectedCategory(cat),
    setSelectedItemType,
    setViewMode,
    openCreateModal,
    openEditModal,
    closeFormModal,
    deleteService,
    dismissNotification,
    clearFilters,
  }
}
