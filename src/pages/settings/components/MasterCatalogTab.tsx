import { useState } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMasterCatalog } from "../hooks/useMasterCatalog"
import { MasterServiceModal } from "./MasterServiceModal"
import {
  CATALOG_ITEM_TYPE_BADGES,
  MASTER_SERVICE_UNIT_LABELS,
  type CatalogItemType,
} from "@/types/catalog"

const TYPE_FILTER_TABS: Array<{ value: CatalogItemType | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "labor", label: "Mão de Obra" },
  { value: "material", label: "Materiais" },
  { value: "subcontract", label: "Ajudantes / Terceiros" },
]

export function MasterCatalogTab() {
  const {
    services,
    totalCount,
    filteredCount,
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
  } = useMasterCatalog()

  const [deletingId, setDeletingId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Banner Explicativo de Contexto */}
      <div className="rounded-xl border border-amber-200/90 bg-amber-50/50 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950">
              Catálogo Unificado de Composições da Empresa
            </h3>
            <p className="text-xs text-amber-900/80 leading-relaxed max-w-3xl">
              Padronize serviços de <strong>Mão de Obra</strong>, <strong>Materiais</strong> e <strong>Ajudantes / Terceiros</strong> com suas unidades oficiais. Essas composições alimentam os orçamentos comerciais e os escopos previstos das obras.
            </p>
          </div>
        </div>
      </div>

      {/* Abas de Filtro Rápido por Natureza */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTER_TABS.map((tab) => {
          const isSelected = selectedItemType === tab.value
          const count = itemTypeCounts[tab.value] || 0
          return (
            <Button
              key={tab.value}
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setSelectedItemType(tab.value)}
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

      {/* Controles de Busca e Criação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar item por nome ou categoria..."
              className="pl-9 text-xs h-9 bg-white"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="h-9 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-2xs shrink-0"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Novo Item Padronizado</span>
        </Button>
      </div>

      {/* Filtro por Categorias */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider pr-1">
          Categoria:
        </span>
        {categories.map((cat) => (
          <Button
            key={cat}
            type="button"
            variant="unstyled"
            size="auto"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Listagem em Tabela */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                {searchTerm || selectedCategory !== "Todas" || selectedItemType !== "all"
                  ? "Nenhum item encontrado para este filtro"
                  : "Nenhum item cadastrado"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cadastre composições corporativas para que elas possam ser selecionadas nos orçamentos e escopos de obras.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase">
                  <TableHead className="w-[36%]">Nome do Item / Serviço</TableHead>
                  <TableHead className="w-[18%]">Natureza</TableHead>
                  <TableHead className="w-[16%]">Categoria</TableHead>
                  <TableHead className="w-[15%]">Unidade Padrão</TableHead>
                  <TableHead className="w-[15%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs">
                {services.map((item) => {
                  const typeBadge =
                    CATALOG_ITEM_TYPE_BADGES[item.itemType || "labor"]
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-semibold text-slate-900 py-3.5">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${typeBadge.className}`}
                        >
                          {typeBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium bg-slate-50 text-slate-700 border-slate-200"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {MASTER_SERVICE_UNIT_LABELS[item.defaultUnit] || item.defaultUnit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {deletingId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-rose-700 font-semibold pr-1">
                              Excluir?
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingId(null)}
                              className="h-6 text-[10px] px-1.5"
                            >
                              Não
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                deleteMasterService(item.id)
                                setDeletingId(null)
                              }}
                              className="h-6 text-[10px] px-1.5 bg-rose-600 hover:bg-rose-700"
                            >
                              Sim
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(item)}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                              title="Editar item"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(item.id)}
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Excluir item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400 text-right">
        Exibindo {filteredCount} de {totalCount} composições cadastradas
      </div>

      {/* Modal de Criação / Edição */}
      <MasterServiceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={editingService}
        onSave={(data) => {
          if (editingService) {
            updateMasterService(editingService.id, data)
          } else {
            addMasterService(data)
          }
        }}
      />
    </div>
  )
}
