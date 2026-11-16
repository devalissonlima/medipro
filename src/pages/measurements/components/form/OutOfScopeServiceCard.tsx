import React, { useRef } from "react"
import { Trash2, Camera, X, CheckCircle2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { MeasurementServiceItem } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface OutOfScopeServiceCardProps {
  index: number
  item: MeasurementServiceItem
  onUpdate: (
    itemId: string,
    field: "materialName" | "quantity" | "unitPrice",
    value: string | number
  ) => void
  onUpdateAuditField: <K extends keyof MeasurementServiceItem>(
    itemId: string,
    field: K,
    value: MeasurementServiceItem[K]
  ) => void
  onRemove: (itemId: string) => void
  isReadOnly?: boolean
}

export const OutOfScopeServiceCard: React.FC<OutOfScopeServiceCardProps> = ({
  index,
  item,
  onUpdate,
  onUpdateAuditField,
  onRemove,
  isReadOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      onUpdateAuditField(item.id, "evidencePhotoUrl", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/25 p-4 sm:p-5 shadow-xs space-y-4 relative group hover:border-amber-400 transition-colors">
      {/* Top Header com Badges Explicativos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
            {index + 1}
          </span>
          <h4 className="font-bold text-slate-900 text-sm truncate">
            {item.serviceName}
          </h4>
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase tracking-wider">
            Fora de Escopo (Extra)
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] bg-white text-slate-600 border-slate-200 uppercase font-semibold"
          >
            {item.unit}
          </Badge>
        </div>

        {!isReadOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Remover serviço extra"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Serviço Extra Não Previsto na Obra:</strong> Este item não consta no escopo orçado do projeto. O valor fica isolado em auditoria pendente e necessita da aprovação do gestor/encarregado para liberação do pagamento.
        </p>
      </div>

      {/* Grid de Inputs: Material + Quantidade + Unitário + Subtotal */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 block">
            Material / Detalhe
          </label>
          <Input
            placeholder="Ex: Soleira em Granito, acabamento extra..."
            value={item.materialName || ""}
            disabled={isReadOnly}
            onChange={(e) => onUpdate(item.id, "materialName", e.target.value)}
            className="h-9 text-xs bg-white"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">
            Medida ({item.unit}) <span className="text-rose-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            disabled={isReadOnly}
            value={item.quantity === 0 ? "" : item.quantity}
            onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
            className="h-9 text-xs font-mono font-medium text-slate-900 bg-white"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">
            Unitário (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            disabled={isReadOnly}
            value={item.unitPrice === 0 ? "" : item.unitPrice}
            onChange={(e) => onUpdate(item.id, "unitPrice", e.target.value)}
            className="h-9 text-xs font-mono font-medium text-slate-900 bg-white"
          />
        </div>

        <div className="sm:col-span-3 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Subtotal em Auditoria
          </span>
          <div className="h-9 rounded-md bg-amber-100/50 border border-amber-200 px-3 flex items-center justify-end font-mono font-bold text-xs text-amber-950">
            {formatCurrency(item.subtotal)}
          </div>
        </div>
      </div>

      {/* Bloco de Justificativa Textual e Foto de Evidência Obrigatórias */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-amber-200/60">
        <div className="sm:col-span-7 space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span>
              Justificativa Obrigatória <span className="text-rose-500">*</span>
            </span>
            {!item.justificationNotes?.trim() && (
              <span className="text-[10px] text-rose-600 font-semibold">
                Obrigatório para envio
              </span>
            )}
          </label>
          <Textarea
            rows={2}
            disabled={isReadOnly}
            value={item.justificationNotes || ""}
            onChange={(e) =>
              onUpdateAuditField(item.id, "justificationNotes", e.target.value)
            }
            placeholder="Descreva por que esse serviço foi executado fora do escopo previsto..."
            className="text-xs bg-white min-h-[60px]"
          />
        </div>

        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span>
              Foto de Evidência <span className="text-rose-500">*</span>
            </span>
            {item.evidencePhotoUrl ? (
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Anexada
              </span>
            ) : (
              <span className="text-[10px] text-rose-600 font-semibold">
                Obrigatório
              </span>
            )}
          </label>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {item.evidencePhotoUrl ? (
            <div className="relative inline-block rounded-lg overflow-hidden border border-slate-300 shadow-2xs group">
              <img
                src={item.evidencePhotoUrl}
                alt="Evidência fora de escopo"
                className="h-16 w-28 object-cover"
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateAuditField(item.id, "evidencePhotoUrl", undefined)
                  }
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  title="Remover foto"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReadOnly}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 border-dashed border-amber-400 bg-white hover:bg-amber-50 text-amber-900 gap-1.5 w-full justify-center"
            >
              <Camera className="h-3.5 w-3.5 text-amber-600" />
              <span>Anexar Foto da Obra</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
