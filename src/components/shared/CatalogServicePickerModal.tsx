import React, { useState, useMemo, useEffect } from "react"
import {
  Search,
  X,
  Hammer,
  Package,
  Users,
  Layers,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { CatalogItemType } from "@/types/catalog"
import { formatCurrency } from "@/utils/calculations"

export interface CatalogPickerItem {
  id: string
  itemType: CatalogItemType // 'labor' | 'material' | 'subcontract'
  name: string
  category: string
  unit: string
  price: number
  description?: string
  tags?: string[]
  environment?: string
  scopeRemaining?: number | null
  scopeMax?: number | null
  scopeUnit?: string
}

interface CatalogServicePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  items: CatalogPickerItem[]
  onSelect: (item: CatalogPickerItem) => void
  variant?: "default" | "out-of-scope"
  emptyContextAlert?: React.ReactNode
  footerAction?: {
    label: string
    onClick: () => void
  }
}

const NATURE_TABS: Array<{
  value: CatalogItemType
  label: string
  icon: typeof Hammer
  activeCardClass: string
  activeIconClass: string
  activeBadgeClass: string
}> = [
  {
    value: "labor",
    label: "Mão de Obra",
    icon: Hammer,
    activeCardClass:
      "border-blue-600 bg-blue-50/90 text-blue-950 ring-2 ring-blue-500/15 shadow-2xs",
    activeIconClass: "text-blue-600",
    activeBadgeClass: "bg-blue-600 text-white",
  },
  {
    value: "material",
    label: "Materiais",
    icon: Package,
    activeCardClass:
      "border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-500/15 shadow-2xs",
    activeIconClass: "text-amber-600",
    activeBadgeClass: "bg-amber-500 text-slate-950",
  },
  {
    value: "subcontract",
    label: "Terceiros",
    icon: Users,
    activeCardClass:
      "border-purple-600 bg-purple-50/90 text-purple-950 ring-2 ring-purple-500/15 shadow-2xs",
    activeIconClass: "text-purple-600",
    activeBadgeClass: "bg-purple-600 text-white",
  },
]

export const CatalogServicePickerModal: React.FC<CatalogServicePickerModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  items,
  onSelect,
  variant = "default",
  emptyContextAlert,
  footerAction,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogItemType>("labor")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  // Contagem por natureza considerando todo o catálogo passado (ou filtro de busca se preferir total da aba)
  const tabCounts = useMemo(() => {
    const counts: Record<CatalogItemType, number> = {
      labor: 0,
      material: 0,
      subcontract: 0,
    }
    items.forEach((item) => {
      const t = item.itemType || "labor"
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [items])

  // Ao abrir o modal, reinicia busca/categoria e posiciona em Mão de Obra (ou primeira aba não vazia)
  useEffect(() => {
    if (open) {
      setSearch("")
      setSelectedCategory("Todas")
      if (tabCounts.labor > 0) {
        setActiveTab("labor")
      } else if (tabCounts.material > 0) {
        setActiveTab("material")
      } else if (tabCounts.subcontract > 0) {
        setActiveTab("subcontract")
      } else {
        setActiveTab("labor")
      }
    }
  }, [open, tabCounts.labor, tabCounts.material, tabCounts.subcontract])

  const handleTabChange = (nextTab: CatalogItemType) => {
    setActiveTab(nextTab)
    setSelectedCategory("Todas")
  }

  // Itens da aba ativa
  const itemsInActiveTab = useMemo(() => {
    return items.filter((item) => (item.itemType || "labor") === activeTab)
  }, [items, activeTab])

  // Categorias disponíveis na aba ativa
  const categories = useMemo(() => {
    const set = new Set<string>()
    itemsInActiveTab.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return ["Todas", ...Array.from(set)]
  }, [itemsInActiveTab])

  // Filtragem final por busca e categoria
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim()
    return itemsInActiveTab.filter((item) => {
      const matchesCat =
        selectedCategory === "Todas" || item.category === selectedCategory
      const matchesText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.environment && item.environment.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      return matchesCat && matchesText
    })
  }, [itemsInActiveTab, selectedCategory, search])

  const hasActiveFilters = search.trim() !== "" || selectedCategory !== "Todas"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-w-4xl p-0 flex flex-col h-[calc(100dvh-2rem)] sm:h-[640px] max-h-[calc(100dvh-2rem)] sm:max-h-[88dvh] overflow-hidden bg-white"
      >
        {/* Topo Fixo: Título, 3 Abas e Filtros */}
        <div className="px-5 pt-5 pb-3.5 sm:px-6 border-b border-slate-200 bg-white space-y-3.5 shrink-0">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {variant === "out-of-scope" && (
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
              )}
              <span>{title}</span>
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {/* 3 Abas Principais: Mão de Obra | Materiais | Terceiros */}
          <div className="grid grid-cols-3 gap-2">
            {NATURE_TABS.map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.value
              const count = tabCounts[tab.value]
              return (
                <Button
                  key={tab.value}
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => handleTabChange(tab.value)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl border px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all ${
                    isSelected
                      ? tab.activeCardClass
                      : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${
                        isSelected ? tab.activeIconClass : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? tab.activeBadgeClass
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>

          {/* Barra de Busca + Chips de Categoria */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Buscar por nome, categoria ou etiqueta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-slate-50/60 focus:bg-white"
              />
              {search && (
                <Button
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:max-w-[55%] scrollbar-none">
                {categories.map((cat) => {
                  const isCatSelected = selectedCategory === cat
                  return (
                    <Button
                      key={cat}
                      type="button"
                      variant="unstyled"
                      size="auto"
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isCatSelected
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Corpo com Scroll Interno Exclusivo: Grid de Cards */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          {items.length === 0 && emptyContextAlert ? (
            emptyContextAlert
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 px-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {hasActiveFilters
                    ? "Nenhum item encontrado para os filtros aplicados"
                    : `Nenhum item de ${
                        NATURE_TABS.find((t) => t.value === activeTab)?.label
                      } disponível`}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "Tente limpar a busca ou escolher outra categoria."
                    : "Alterne entre as abas acima para visualizar os demais tipos disponíveis."}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("")
                    setSelectedCategory("Todas")
                  }}
                  className="text-xs h-8"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const hasScopeBalance =
                  item.scopeRemaining !== undefined &&
                  item.scopeRemaining !== null

                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant="unstyled"
                    size="auto"
                    onClick={() => onSelect(item)}
                    className={`group flex flex-col justify-between rounded-xl border bg-white p-3.5 sm:p-4 text-left shadow-2xs transition-all hover:shadow-md ${
                      variant === "out-of-scope"
                        ? "border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/30"
                        : "border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/20"
                    }`}
                  >
                    <div className="space-y-2 w-full">
                      {/* Topo do Card: Categoria + Ambiente + Unidade */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1 min-w-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                          >
                            {item.category}
                          </Badge>
                          {item.environment && (
                            <Badge className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              {item.environment}
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {item.unit}
                        </span>
                      </div>

                      {/* Nome em Destaque */}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-amber-900 transition-colors">
                        {item.name}
                      </h4>

                      {/* Descrição curta */}
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Tags (até 2) */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Saldo de Escopo (quando vinculado a projeto com escopo fechado) */}
                      {hasScopeBalance && item.scopeMax != null && (
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200/70 px-2.5 py-1.5 text-[11px]">
                          <span className="text-slate-500">Saldo:</span>
                          <span className="font-mono font-semibold">
                            <span
                              className={
                                (item.scopeRemaining ?? 0) > 0
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }
                            >
                              {(item.scopeRemaining ?? 0).toFixed(2)}{" "}
                              {item.scopeUnit || item.unit}
                            </span>
                            <span className="text-slate-400 font-normal ml-1">
                              / {item.scopeMax.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Base do Card: Valor Unitário */}
                    <div className="flex items-baseline justify-between gap-2 pt-3 mt-3 border-t border-slate-100 w-full">
                      <span className="font-mono font-black text-slate-900 text-sm leading-none">
                        {item.price > 0
                          ? formatCurrency(item.price)
                          : "Definir R$"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        por {item.unit}
                      </span>
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Rodapé Fixo */}
        <div className="px-5 py-3 sm:px-6 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Exibindo <strong className="text-slate-800">{filteredItems.length}</strong> de{" "}
            <strong className="text-slate-800">{itemsInActiveTab.length}</strong> itens em{" "}
            <strong className="text-slate-800">
              {NATURE_TABS.find((t) => t.value === activeTab)?.label}
            </strong>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {footerAction && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={footerAction.onClick}
                className="h-9 text-xs border-dashed border-amber-400 text-amber-900 bg-amber-50/50 hover:bg-amber-100 font-semibold"
              >
                {footerAction.label}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
