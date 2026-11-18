import { Search, X, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type {
  CatalogItemType,
  ServiceCategory,
  ServiceViewMode,
} from "@/types/service"
import { SERVICE_CATEGORIES } from "@/types/service"

const ITEM_TYPE_TABS: Array<{ value: CatalogItemType | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "labor", label: "Mão de Obra" },
  { value: "material", label: "Materiais" },
  { value: "subcontract", label: "Ajudantes / Terceiros" },
]

interface ServiceFiltersProps {
  searchTerm: string
  selectedCategory: ServiceCategory | "Todas"
  selectedItemType: CatalogItemType | "all"
  viewMode: ServiceViewMode
  categoryCounts: Record<string, number>
  itemTypeCounts: Record<CatalogItemType | "all", number>
  totalCount: number
  filteredCount: number
  onSearchChange: (value: string) => void
  onCategoryChange: (category: ServiceCategory | "Todas") => void
  onItemTypeChange: (itemType: CatalogItemType | "all") => void
  onViewModeChange: (mode: ServiceViewMode) => void
  onClearFilters: () => void
}

export function ServiceFilters({
  searchTerm,
  selectedCategory,
  selectedItemType,
  viewMode,
  categoryCounts,
  itemTypeCounts,
  totalCount,
  filteredCount,
  onSearchChange,
  onCategoryChange,
  onItemTypeChange,
  onViewModeChange,
  onClearFilters,
}: ServiceFiltersProps) {
  const categoriesList: (ServiceCategory | "Todas")[] = [
    "Todas",
    ...SERVICE_CATEGORIES,
  ]

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "Todas" ||
    selectedItemType !== "all"

  return (
    <div className="space-y-4">
      {/* Abas Rápidas por Natureza da Composição */}
      <div className="flex flex-wrap items-center gap-2">
        {ITEM_TYPE_TABS.map((tab) => {
          const isSelected = selectedItemType === tab.value
          const count = itemTypeCounts[tab.value] || 0
          return (
            <Button
              key={tab.value}
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onItemTypeChange(tab.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nome, tag ou categoria..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 border-slate-200 bg-white shadow-2xs focus-visible:ring-amber-500"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* View Mode & Filter Reset */}
        <div className="flex items-center gap-2 justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 h-9 px-2.5"
            >
              Limpar filtros ({filteredCount} de {totalCount})
            </Button>
          )}

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Visualização em Tabela"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoriesList.map((category) => {
          const isSelected = selectedCategory === category
          const count = categoryCounts[category] || 0

          return (
            <Button
              key={category}
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? "bg-slate-800 text-amber-400"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
