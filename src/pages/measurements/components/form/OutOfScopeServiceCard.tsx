import React, { useRef } from "react"
import {
  Trash2,
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  MapPin,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { MeasurementServiceItem } from "@/types/measurement"
import {
  CATALOG_ITEM_TYPE_BADGES,
  MEASUREMENT_UNIT_OPTIONS,
  normalizeMeasurementUnit,
  type CatalogItemType,
} from "@/types/service"
import { formatCurrency } from "@/utils/calculations"

interface OutOfScopeServiceCardProps {
  index: number
  item: MeasurementServiceItem
  onUpdate: (
    itemId: string,
    field:
      | "serviceName"
      | "materialName"
      | "unit"
      | "itemType"
      | "quantity"
      | "unitPrice",
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
  const itemType: CatalogItemType = item.itemType || "labor"
  const badgeInfo = CATALOG_ITEM_TYPE_BADGES[itemType]
  const normalizedUnit = normalizeMeasurementUnit(item.unit)
  const hasCustomUnit = !MEASUREMENT_UNIT_OPTIONS.some(
    (o) => o.value === normalizedUnit
  )

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
      {/* Cabeçalho do Item */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">
            {index + 1}
          </span>
          <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
            {item.serviceName.trim() || "Novo Item Extra"}
          </h4>
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase tracking-wider">
            Fora de Escopo (Extra)
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold shrink-0 ${badgeInfo.className}`}
          >
            {badgeInfo.label}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] bg-white text-slate-600 border-slate-200 uppercase font-semibold shrink-0"
          >
            {normalizedUnit}
          </Badge>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Select
              value={itemType}
              onChange={(e) =>
                onUpdate(item.id, "itemType", e.target.value as CatalogItemType)
              }
              className="h-8 text-[11px] font-semibold bg-white w-44"
            >
              <option value="labor">Mão de Obra</option>
              <option value="material">Material / Insumo</option>
              <option value="subcontract">Ajudante / Terceiro</option>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Remover serviço extra"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Serviço Extra Não Previsto na Obra:</strong> Este item não consta no escopo orçado do projeto. O valor fica isolado em auditoria pendente e necessita da aprovação do gestor/encarregado para liberação do pagamento.
        </p>
      </div>

      {/* ZONA 1: O que foi executado e onde/qual material */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-7 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              Qual é o Serviço, Material ou Diária?{" "}
              <span className="text-rose-500">*</span>
            </span>
          </label>
          <Input
            placeholder={
              itemType === "material"
                ? "Ex: Argamassa AC3 Branca, Selante PU..."
                : itemType === "subcontract"
                ? "Ex: Diária de Ajudante, Frete / Içamento..."
                : "Ex: Soleira extra, Polimento adicional..."
            }
            value={item.serviceName}
            disabled={isReadOnly}
            onChange={(e) => onUpdate(item.id, "serviceName", e.target.value)}
            className="h-10 text-xs bg-white"
          />
        </div>

        <div className="sm:col-span-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Ambiente / Material Aplicado (Detalhe)</span>
          </label>
          <Input
            placeholder="Ex: Soleira em Granito, acabamento extra..."
            value={item.materialName || ""}
            disabled={isReadOnly}
            onChange={(e) => onUpdate(item.id, "materialName", e.target.value)}
            className="h-10 text-xs bg-white"
          />
        </div>
      </div>

      {/* ZONA 2: Cálculo de Quantidade e Preço */}
      <div className="rounded-xl border border-amber-200/80 bg-white/80 p-3.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Unidade de Medida
            </label>
            <Select
              value={normalizedUnit}
              disabled={isReadOnly}
              onChange={(e) => onUpdate(item.id, "unit", e.target.value)}
              className="h-10 text-xs bg-white"
            >
              {MEASUREMENT_UNIT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {hasCustomUnit && (
                <option value={normalizedUnit}>{normalizedUnit}</option>
              )}
            </Select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Quantidade Executada
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                disabled={isReadOnly}
                value={item.quantity === 0 ? "" : item.quantity}
                onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
                className="h-10 text-xs font-mono font-semibold text-slate-900 pr-16 bg-white"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {normalizedUnit}
              </span>
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Valor por {normalizedUnit}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                disabled={isReadOnly}
                value={item.unitPrice === 0 ? "" : item.unitPrice}
                onChange={(e) => onUpdate(item.id, "unitPrice", e.target.value)}
                className="h-10 text-xs font-mono font-semibold text-slate-900 pl-9 bg-white"
              />
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-amber-900 block text-right sm:text-left">
              Subtotal em Auditoria
            </label>
            <div className="flex h-10 items-center justify-between rounded-lg bg-amber-100/60 border border-amber-200 px-3 font-mono font-black text-sm text-amber-950 shadow-2xs">
              <span className="text-xs font-bold text-amber-700">=</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
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

          <Input
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
                <Button
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() =>
                    onUpdateAuditField(item.id, "evidencePhotoUrl", undefined)
                  }
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  title="Remover foto"
                >
                  <X className="h-3 w-3" />
                </Button>
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
