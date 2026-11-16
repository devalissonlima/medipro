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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMasterCatalog } from "../hooks/useMasterCatalog"
import { MasterServiceModal } from "./MasterServiceModal"
import { MASTER_SERVICE_UNIT_LABELS } from "@/types/catalog"

export function MasterCatalogTab() {
  const {
    services,
    totalCount,
    filteredCount,
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
              Fonte Única da Verdade para Escopos de Obras
            </h3>
            <p className="text-xs text-amber-900/80 leading-relaxed max-w-3xl">
              Diferente da tabela individual de serviços (onde cada instalador precifica sua mão de obra), este Catálogo Geral define os tipos de serviço oficiais da empresa com suas unidades padrão. Ele serve de base para montar o Escopo Previsto dos Projetos e calcular a trava elástica de excedentes.
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Busca e Criação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar serviço por nome ou categoria..."
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
          <span>Novo Serviço Padronizado</span>
        </Button>
      </div>

      {/* Filtro por Categorias */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider pr-1">
          Categoria:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listagem em Tabela */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                {searchTerm || selectedCategory !== "Todas"
                  ? "Nenhum serviço encontrado para este filtro"
                  : "Nenhum tipo de serviço cadastrado"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cadastre os serviços corporativos para que eles possam ser selecionados nos escopos de obras.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase">
                  <TableHead className="w-[45%]">Nome do Serviço</TableHead>
                  <TableHead className="w-[20%]">Categoria</TableHead>
                  <TableHead className="w-[20%]">Unidade Padrão</TableHead>
                  <TableHead className="w-[15%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs">
                {services.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-semibold text-slate-900 py-3.5">
                      {item.name}
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
                            title="Editar serviço"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(item.id)}
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Excluir serviço"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400 text-right">
        Exibindo {filteredCount} de {totalCount} serviços padronizados
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
