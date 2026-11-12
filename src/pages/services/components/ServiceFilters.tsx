import { Search, X, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ServiceCategory, ServiceViewMode } from "@/types/service"
import { SERVICE_CATEGORIES } from "@/types/service"

interface ServiceFiltersProps {
  searchTerm: string
  selectedCategory: ServiceCategory | "Todas"
  viewMode: ServiceViewMode
  categoryCounts: Record<string, number>
  totalCount: number
  filteredCount: number
  onSearchChange: (value: string) => void
  onCategoryChange: (category: ServiceCategory | "Todas") => void
  onViewModeChange: (mode: ServiceViewMode) => void
  onClearFilters: () => void
}

export function ServiceFilters({
  searchTerm,
  selectedCategory,
  viewMode,
  categoryCounts,
  totalCount,
  filteredCount,
  onSearchChange,
  onCategoryChange,
  onViewModeChange,
  onClearFilters,
}: ServiceFiltersProps) {
  const categoriesList: (ServiceCategory | "Todas")[] = [
    "Todas",
    ...SERVICE_CATEGORIES,
  ]

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "Todas"

  return (
    <div className="space-y-4">
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
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
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
            <button
              type="button"
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
            </button>
            <button
              type="button"
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
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoriesList.map((category) => {
          const isSelected = selectedCategory === category
          const count = categoryCounts[category] || 0

          return (
            <button
              key={category}
              type="button"
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
            </button>
          )
        })}
      </div>
    </div>
  )
}
