import { useState } from "react"
import {
  Car,
  ChevronDown,
  ChevronUp,
  Hotel,
  Utensils,
  Wrench,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { OperationalCosts } from "@/types/measurement"
import {
  calculateOperationalCostsTotal,
  formatCurrency,
} from "@/utils/calculations"

interface OperationalCostsCardProps {
  costs: OperationalCosts
  onUpdateCost: (field: keyof OperationalCosts, value: string | number) => void
}

export function OperationalCostsCard({
  costs,
  onUpdateCost,
}: OperationalCostsCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const totalCosts = calculateOperationalCostsTotal(costs)

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs transition-all">
      {/* Header Interativo / Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Custos Operacionais & Despesas de Campo
              </h3>
              {totalCosts > 0 && (
                <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {formatCurrency(totalCosts)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deslocamento, combustível, alimentação e estadia para obras fora da base
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            {isOpen ? "Recolher" : "Adicionar Despesas"}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            {/* Deslocamento */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-slate-400" />
                Deslocamento / Combustível
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={costs.transport || ""}
                  onChange={(e) => onUpdateCost("transport", e.target.value)}
                  className="pl-8 h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Hospedagem */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Hotel className="h-3.5 w-3.5 text-slate-400" />
                Hospedagem / Estadia
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={costs.lodging || ""}
                  onChange={(e) => onUpdateCost("lodging", e.target.value)}
                  className="pl-8 h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Alimentação */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-slate-400" />
                Alimentação / Diárias
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={costs.food || ""}
                  onChange={(e) => onUpdateCost("food", e.target.value)}
                  className="pl-8 h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Setup Extra */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-slate-400" />
                Taxa de Setup / Risco
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={costs.extraSetup || ""}
                  onChange={(e) => onUpdateCost("extraSetup", e.target.value)}
                  className="pl-8 h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Observações Operacionais */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Observações / Justificativas de Despesa
            </label>
            <Textarea
              placeholder="Ex: Pedágios da Rod. dos Bandeirantes + 1 diária de hotel em Campinas para 2 pessoas..."
              value={costs.notes || ""}
              onChange={(e) => onUpdateCost("notes", e.target.value)}
              className="resize-none text-xs h-16"
            />
          </div>
        </div>
      )}
    </div>
  )
}
