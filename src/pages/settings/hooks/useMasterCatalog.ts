import { useMemo } from "react"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"

export function useMasterCatalog() {
  const {
    services,
    searchTerm,
    selectedCategory,
    isModalOpen,
    editingService,
    setSearchTerm,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    addMasterService,
    updateMasterService,
    deleteMasterService,
  } = useMasterCatalogStore()

  const categories = useMemo(() => {
    const set = new Set<string>()
    services.forEach((s) => set.add(s.category))
    return ["Todas", ...Array.from(set).sort()]
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCat =
        selectedCategory === "Todas" || s.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [services, searchTerm, selectedCategory])

  return {
    services: filteredServices,
    totalCount: services.length,
    filteredCount: filteredServices.length,
    searchTerm,
    selectedCategory,
    categories,
    isModalOpen,
    editingService,
    setSearchTerm,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    addMasterService,
    updateMasterService,
    deleteMasterService,
  }
}
