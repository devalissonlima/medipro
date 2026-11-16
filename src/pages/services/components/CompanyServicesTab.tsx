import { useState, useMemo } from "react"
import {
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"
import { useServicesStore } from "@/stores/servicesStore"
import {
  MASTER_SERVICE_UNIT_LABELS,
  type MasterServiceType,
} from "@/types/catalog"

interface CompanyServicesTabProps {
  onStartWizard: (services: MasterServiceType[]) => void
}

export function CompanyServicesTab({ onStartWizard }: CompanyServicesTabProps) {
  const masterServices = useMasterCatalogStore((state) => state.services)
  const memberServices = useServicesStore((state) => state.services)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Verifica se o serviço mestre já foi importado pelo membro
  const isAlreadyImported = useMemo(() => {
    const importedSet = new Set<string>()
    const importedNames = new Set<string>()

    memberServices.forEach((s) => {
      if (s.masterServiceId) importedSet.add(s.masterServiceId)
      importedNames.add(s.name.toLowerCase().trim())
    })

    return (master: MasterServiceType) => {
      return (
        importedSet.has(master.id) ||
        importedNames.has(master.name.toLowerCase().trim())
      )
    }
  }, [memberServices])

  // Serviços da empresa disponíveis para importação (ainda não importados)
  const availableServices = useMemo(() => {
    return masterServices.filter((s) => !isAlreadyImported(s))
  }, [masterServices, isAlreadyImported])

  // Categorias presentes no catálogo da empresa
  const categories = useMemo(() => {
    const set = new Set<string>()
    masterServices.forEach((s) => {
      if (s.category) set.add(s.category)
    })
    return ["Todas", ...Array.from(set)]
  }, [masterServices])

  // Filtragem por busca e categoria
  const filteredServices = useMemo(() => {
    return masterServices.filter((s) => {
      const matchCat =
        selectedCategory === "Todas" || s.category === selectedCategory
      const query = searchTerm.toLowerCase().trim()
      const matchText =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      return matchCat && matchText
    })
  }, [masterServices, selectedCategory, searchTerm])

  // Controle de Seleção
  const availableFiltered = useMemo(() => {
    return filteredServices.filter((s) => !isAlreadyImported(s))
  }, [filteredServices, isAlreadyImported])

  const isAllAvailableSelected =
    availableFiltered.length > 0 &&
    availableFiltered.every((s) => selectedIds.has(s.id))

  const handleToggleSelectAll = () => {
    if (isAllAvailableSelected) {
      setSelectedIds(new Set())
    } else {
      const next = new Set(selectedIds)
      availableFiltered.forEach((s) => next.add(s.id))
      setSelectedIds(next)
    }
  }

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Ação: Importar todos os serviços disponíveis direto no wizard
  const handleImportAllAvailable = () => {
    if (availableServices.length === 0) return
    onStartWizard(availableServices)
  }

  // Ação: Precificar os itens selecionados via checkboxes
  const handleStartPricingSelected = () => {
    const selected = masterServices.filter((s) => selectedIds.has(s.id))
    if (selected.length === 0) return
    onStartWizard(selected)
  }

  // Ação: Precificar apenas um serviço específico
  const handlePriceSingleService = (service: MasterServiceType) => {
    onStartWizard([service])
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Card de Cabeçalho e Controles de Ação */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Catálogo Geral da Empresa
              </h2>
              {availableServices.length > 0 && (
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                  {availableServices.length}{" "}
                  {availableServices.length === 1 ? "disponível" : "disponíveis"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Selecione os serviços padronizados da empresa que você executa para
              importar e definir o seu valor unitário de mão de obra.
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {availableServices.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportAllAvailable}
                className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
              >
                <span>Importar Todos Disponíveis</span>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  {availableServices.length}
                </span>
              </Button>
            )}

            <Button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleStartPricingSelected}
              className="h-9 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm gap-2 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Precificar Selecionados ({selectedIds.size})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 2. Barra de Busca e Filtros de Categoria */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Categoria:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar serviço da empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8 bg-slate-50/60"
            />
          </div>
        </div>
      </div>

      {/* 3. Tabela de Serviços da Empresa */}
      {filteredServices.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="py-12 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Layers className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Nenhum serviço encontrado no catálogo da empresa
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== "Todas"
                ? "Tente ajustar o termo de pesquisa ou limpar os filtros de categoria."
                : "A gestão ainda não cadastrou tipos de serviços no Catálogo Geral da Empresa."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllAvailableSelected}
                    disabled={availableFiltered.length === 0}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Selecionar todos os serviços disponíveis"
                  />
                </th>
                <th className="p-3.5">Nome do Serviço Padronizado</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5 text-center">Unidade Padrão</th>
                <th className="p-3.5 text-center">Status no seu Catálogo</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((service) => {
                const alreadyIn = isAlreadyImported(service)
                const isChecked = selectedIds.has(service.id)
                const unitLabel =
                  MASTER_SERVICE_UNIT_LABELS[service.defaultUnit] ||
                  service.defaultUnit

                return (
                  <tr
                    key={service.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isChecked ? "bg-amber-50/30" : ""
                    } ${alreadyIn ? "opacity-75" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={alreadyIn}
                        onChange={() => handleToggleItem(service.id)}
                        className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>

                    {/* Nome do Serviço */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 text-xs">
                        {service.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{service.id}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 font-semibold"
                      >
                        {service.category}
                      </Badge>
                    </td>

                    {/* Unidade Padrão */}
                    <td className="p-3.5 text-center">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                        {unitLabel}
                      </span>
                    </td>

                    {/* Status de Vínculo */}
                    <td className="p-3.5 text-center">
                      {alreadyIn ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1 inline-flex items-center">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Já no seu catálogo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-medium"
                        >
                          Disponível para importar
                        </Badge>
                      )}
                    </td>

                    {/* Ação Rápida */}
                    <td className="p-3.5 text-right">
                      {alreadyIn ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Importado
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriceSingleService(service)}
                          className="h-7 text-[11px] font-semibold border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-950 gap-1 px-2.5"
                        >
                          <span>Precificar</span>
                          <ArrowRight className="h-3 w-3 text-amber-600" />
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
