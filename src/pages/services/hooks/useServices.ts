import { useMemo } from "react"
import { useServicesStore } from "@/stores/servicesStore"
import type { ServiceCategory } from "@/types/service"

export function useServices() {
  const {
    services,
    searchTerm,
    selectedCategory,
    viewMode,
    isFormOpen,
    editingService,
    notification,
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    openCreateModal,
    openEditModal,
    closeFormModal,
    deleteService,
    setNotification,
  } = useServicesStore()

  // Lista filtrada por busca textual e categoria
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
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

      return matchesSearch && matchesCategory
    })
  }, [services, searchTerm, selectedCategory])

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
  }

  return {
    services: filteredServices,
    totalCount: services.length,
    filteredCount: filteredServices.length,
    categoryCounts,
    searchTerm,
    selectedCategory,
    viewMode,
    isFormOpen,
    editingService,
    notification,
    setSearchTerm,
    setSelectedCategory: (cat: ServiceCategory | "Todas") =>
      setSelectedCategory(cat),
    setViewMode,
    openCreateModal,
    openEditModal,
    closeFormModal,
    deleteService,
    dismissNotification,
    clearFilters,
  }
}
