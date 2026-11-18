import { Trash2, Wrench, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ElasticGuardAlert } from "./ElasticGuardAlert"
import type { MeasurementServiceItem } from "@/types/measurement"
import type { ProjectScopeItem } from "@/types/project"
import {
  CATALOG_ITEM_TYPE_BADGES,
  MEASUREMENT_UNIT_OPTIONS,
  normalizeMeasurementUnit,
  type CatalogItemType,
} from "@/types/service"
import { formatCurrency } from "@/utils/calculations"

interface ServiceItemRowProps {
  index: number
  item: MeasurementServiceItem
  scopeItem?: ProjectScopeItem
  otherExecutedInProject?: number
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
  onUpdateAuditField?: <K extends keyof MeasurementServiceItem>(
    itemId: string,
    field: K,
    value: MeasurementServiceItem[K]
  ) => void
  onRemove: (itemId: string) => void
  isReadOnly?: boolean
}

export function ServiceItemRow({
  index,
  item,
  scopeItem,
  otherExecutedInProject = 0,
  onUpdate,
  onUpdateAuditField,
  onRemove,
  isReadOnly = false,
}: ServiceItemRowProps) {
  const itemType: CatalogItemType = item.itemType || "labor"
  const badgeInfo = CATALOG_ITEM_TYPE_BADGES[itemType]
  const normalizedUnit = normalizeMeasurementUnit(item.unit)
  const hasCustomUnit = !MEASUREMENT_UNIT_OPTIONS.some(
    (o) => o.value === normalizedUnit
  )
  const isLockedToScope = Boolean(scopeItem)

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4 relative group hover:border-slate-300 transition-colors">
      {/* Cabeçalho do Item */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
            {item.serviceName.trim() || "Novo Item Manual"}
          </h4>
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold shrink-0 ${badgeInfo.className}`}
          >
            {badgeInfo.label}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase font-semibold shrink-0"
          >
            {normalizedUnit}
          </Badge>
          {scopeItem && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
              Item de Escopo
            </Badge>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Select
              value={itemType}
              disabled={isLockedToScope}
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
              title="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
                : "Ex: Assentamento de Mármore, Corte 45°..."
            }
            value={item.serviceName}
            disabled={isReadOnly || isLockedToScope}
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
            placeholder="Ex: Cozinha Ilha - Mármore Branco Paraná..."
            value={item.materialName || ""}
            disabled={isReadOnly}
            onChange={(e) => onUpdate(item.id, "materialName", e.target.value)}
            className="h-10 text-xs bg-white"
          />
        </div>
      </div>

      {/* ZONA 2: Cálculo de Quantidade e Preço */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Unidade de Medida
            </label>
            <Select
              value={normalizedUnit}
              disabled={isReadOnly || isLockedToScope}
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
            <label className="text-xs font-bold text-slate-600 block text-right sm:text-left">
              Valor Total do Item
            </label>
            <div className="flex h-10 items-center justify-between rounded-lg bg-white border border-slate-200 px-3 font-mono font-black text-sm text-slate-900 shadow-2xs">
              <span className="text-xs font-bold text-slate-400">=</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trava Elástica & Auditoria de Excedente */}
      {scopeItem && (
        <ElasticGuardAlert
          item={item}
          scopeItem={scopeItem}
          otherExecutedInProject={otherExecutedInProject}
          onUpdateAuditField={(field, val) =>
            onUpdateAuditField?.(item.id, field, val)
          }
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  )
}
