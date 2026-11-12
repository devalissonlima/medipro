import { Trash2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MeasurementServiceItem } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface ServiceItemRowProps {
  index: number
  item: MeasurementServiceItem
  onUpdate: (
    itemId: string,
    field: "materialName" | "quantity" | "unitPrice",
    value: string | number
  ) => void
  onRemove: (itemId: string) => void
}

export function ServiceItemRow({
  index,
  item,
  onUpdate,
  onRemove,
}: ServiceItemRowProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 relative group hover:border-slate-300 transition-colors">
      {/* Top Header do Item: Nome do Serviço + Badge de Unidade + Botão Remover */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
            {index + 1}
          </span>
          <h4 className="font-bold text-slate-900 text-sm truncate">
            {item.serviceName}
          </h4>
          <Badge
            variant="outline"
            className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase font-semibold shrink-0"
          >
            {item.unit}
          </Badge>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          title="Remover serviço"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid de Inputs: Material + Quantidade + Valor Unitário + Subtotal */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        {/* Material Trabalhado (6 cols) */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <span>Material / Detalhe</span>
            <span className="text-[10px] text-amber-600 font-normal flex items-center gap-1 hidden lg:flex">
              <Sparkles className="h-3 w-3" />
              Materiais nobres exigem ajuste
            </span>
          </label>
          <Input
            placeholder="Ex: Mármore Branco Paraná, Granito..."
            value={item.materialName || ""}
            onChange={(e) => onUpdate(item.id, "materialName", e.target.value)}
            className="h-9 text-xs bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Quantidade (2 cols) */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">
            Medida ({item.unit})
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={item.quantity === 0 ? "" : item.quantity}
            onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
            className="h-9 text-xs font-mono font-medium text-slate-900"
          />
        </div>

        {/* Preço Unitário Ajustado (2 cols) */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">
            Unitário (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={item.unitPrice === 0 ? "" : item.unitPrice}
            onChange={(e) => onUpdate(item.id, "unitPrice", e.target.value)}
            className="h-9 text-xs font-mono font-medium text-slate-900"
          />
        </div>

        {/* Subtotal Calculado (3 cols) */}
        <div className="sm:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-right">
            Subtotal
          </label>
          <div className="flex h-9 items-center justify-end rounded-md bg-slate-50 border border-slate-200/80 px-3 font-mono font-bold text-slate-900 text-sm shadow-2xs">
            {formatCurrency(item.subtotal)}
          </div>
        </div>
      </div>
    </div>
  )
}
