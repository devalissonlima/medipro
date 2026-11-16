import React from "react"
import { Plus, Trash2, Layers, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"
import { MASTER_SERVICE_UNIT_LABELS } from "@/types/catalog"
import type { ProjectScopeItem } from "@/types/project"

interface ProjectScopeBuilderProps {
  items: ProjectScopeItem[]
  onChange: (items: ProjectScopeItem[]) => void
}

export const ProjectScopeBuilder: React.FC<ProjectScopeBuilderProps> = ({
  items,
  onChange,
}) => {
  const masterServices = useMasterCatalogStore((state) => state.services)

  const handleAddItem = () => {
    const defaultMaster = masterServices[0]
    if (!defaultMaster) return

    const newItem: ProjectScopeItem = {
      id: `scope-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      projectId: "",
      masterServiceId: defaultMaster.id,
      serviceName: defaultMaster.name,
      environment: "",
      unit: MASTER_SERVICE_UNIT_LABELS[defaultMaster.defaultUnit] || defaultMaster.defaultUnit,
      maxQuantity: 10,
      executedQuantity: 0,
    }

    onChange([...items, newItem])
  }

  const handleUpdateItem = (
    id: string,
    field: keyof ProjectScopeItem,
    value: string | number
  ) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item

        if (field === "masterServiceId") {
          const selectedMaster = masterServices.find((m) => m.id === value)
          if (selectedMaster) {
            return {
              ...item,
              masterServiceId: selectedMaster.id,
              serviceName: selectedMaster.name,
              unit:
                MASTER_SERVICE_UNIT_LABELS[selectedMaster.defaultUnit] ||
                selectedMaster.defaultUnit,
            }
          }
        }

        if (field === "maxQuantity") {
          const num = typeof value === "number" ? value : parseFloat(String(value)) || 0
          return { ...item, maxQuantity: num < 0 ? 0 : num }
        }

        return { ...item, [field]: value }
      })
    )
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <Card className="border-slate-200/90 shadow-2xs bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Escopo Previsto / Planilha de Quantidades
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Cadastre o teto máximo de serviços orçados para esta obra. A trava elástica do MediPro alertará quando as medições ultrapassarem esses limites.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddItem}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            <span>Adicionar Serviço ao Escopo</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {items.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 bg-slate-50/40">
            <Layers className="h-7 w-7 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Nenhum item adicionado ao escopo ainda
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Defina os ambientes e os limites de metragem/quantidade previstos para evitar cobranças de mão de obra excedente sem auditoria prévia.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5 mt-2"
            >
              <Plus className="h-3.5 w-3.5 text-amber-500" />
              <span>Inserir Primeiro Item</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Cabeçalho das colunas em telas maiores */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              <div className="col-span-3">Ambiente / Setor</div>
              <div className="col-span-5">Tipo de Serviço (Catálogo)</div>
              <div className="col-span-3">Qtd. Máxima Prevista</div>
              <div className="col-span-1 text-right">Ação</div>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-3 rounded-xl border border-slate-200/90 bg-slate-50/30 hover:border-slate-300 transition-colors items-center"
              >
                {/* 1. Ambiente / Setor */}
                <div className="col-span-1 md:col-span-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden block">
                    Ambiente / Setor:
                  </span>
                  <Input
                    value={item.environment || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "environment", e.target.value)
                    }
                    placeholder="Ex: Cozinha, Suíte..."
                    className="text-xs h-8 bg-white"
                  />
                </div>

                {/* 2. Tipo de Serviço (Select Master) */}
                <div className="col-span-1 md:col-span-5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden block">
                    Tipo de Serviço:
                  </span>
                  <Select
                    value={item.masterServiceId}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "masterServiceId", e.target.value)
                    }
                    className="w-full text-xs h-8 bg-white font-medium"
                  >
                    {masterServices.map((master) => (
                      <option key={master.id} value={master.id}>
                        {master.name} ({master.category})
                      </option>
                    ))}
                  </Select>
                </div>

                {/* 3. Quantidade Máxima Prevista + Unidade */}
                <div className="col-span-1 md:col-span-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden block">
                    Qtd. Máxima Prevista:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.maxQuantity || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "maxQuantity", e.target.value)
                      }
                      placeholder="0.00"
                      className="text-xs h-8 bg-white font-mono font-semibold"
                    />
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded h-8 flex items-center shrink-0">
                      {item.unit}
                    </span>
                  </div>
                </div>

                {/* 4. Ação Remover */}
                <div className="col-span-1 md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Remover item do escopo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-600">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                Total de {items.length} {items.length === 1 ? "item orçado" : "itens orçados"} no escopo deste projeto.
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-7 text-slate-700 hover:text-slate-900 gap-1 font-semibold"
              >
                <Plus className="h-3 w-3 text-amber-500" />
                Adicionar mais
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
