import { useMemo } from "react"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"
import type { CatalogItemType } from "@/types/catalog"

export function useMasterCatalog() {
  const {
    services,
    searchTerm,
    selectedCategory,
    selectedItemType,
    isModalOpen,
    editingService,
    setSearchTerm,
    setSelectedCategory,
    setSelectedItemType,
    openCreateModal,
    openEditModal,
    closeModal,
    addMasterService,
    updateMasterService,
    deleteMasterService,
  } = useMasterCatalogStore()

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

  const categories = useMemo(() => {
    const set = new Set<string>()
    services.forEach((s) => set.add(s.category))
    return ["Todas", ...Array.from(set).sort()]
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesType =
        selectedItemType === "all" || (s.itemType || "labor") === selectedItemType
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCat =
        selectedCategory === "Todas" || s.category === selectedCategory
      return matchesType && matchesSearch && matchesCat
    })
  }, [services, searchTerm, selectedCategory, selectedItemType])

  return {
    services: filteredServices,
    totalCount: services.length,
    filteredCount: filteredServices.length,
    searchTerm,
    selectedCategory,
    selectedItemType,
    itemTypeCounts,
    categories,
    isModalOpen,
    editingService,
    setSearchTerm,
    setSelectedCategory,
    setSelectedItemType,
    openCreateModal,
    openEditModal,
    closeModal,
    addMasterService,
    updateMasterService,
    deleteMasterService,
  }
}
