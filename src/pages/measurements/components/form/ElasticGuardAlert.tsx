import React, { useRef } from "react"
import { AlertTriangle, CheckCircle2, Camera, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  EXCEEDED_REASON_LABELS,
  type ExceededReason,
  type MeasurementServiceItem,
} from "@/types/measurement"
import type { ProjectScopeItem } from "@/types/project"

interface ElasticGuardAlertProps {
  item: MeasurementServiceItem
  scopeItem?: ProjectScopeItem
  otherExecutedInProject?: number
  onUpdateAuditField: <K extends keyof MeasurementServiceItem>(
    field: K,
    value: MeasurementServiceItem[K]
  ) => void
  isReadOnly?: boolean
}

export const ElasticGuardAlert: React.FC<ElasticGuardAlertProps> = ({
  item,
  scopeItem,
  otherExecutedInProject = 0,
  onUpdateAuditField,
  isReadOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!scopeItem) {
    return null
  }

  const maxQty = scopeItem.maxQuantity
  const totalCombined = otherExecutedInProject + item.quantity
  const isExceeded = totalCombined > maxQty
  const exceededQty = Math.max(0, totalCombined - maxQty)
  const remainingBeforeThis = Math.max(0, maxQty - otherExecutedInProject)

  const progressPercent = maxQty > 0 ? Math.min(100, (totalCombined / maxQty) * 100) : 0

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      onUpdateAuditField("evidencePhotoUrl", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="pt-2 space-y-3">
      {/* 1. Barra de Saldo & Status de Escopo */}
      <div
        className={`p-3 rounded-lg border text-xs transition-colors ${
          isExceeded
            ? "border-amber-300 bg-amber-50/80 text-amber-950"
            : "border-slate-200 bg-slate-50/80 text-slate-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5">
          <div className="flex items-center gap-2">
            {isExceeded ? (
              <span className="flex items-center gap-1 font-bold text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Limite do Escopo Ultrapassado (Trava Elástica)
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Dentro do Escopo Previsto
              </span>
            )}
          </div>

          <div>
            {isExceeded ? (
              <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-bold text-[11px] font-mono">
                Excedente: +{exceededQty.toFixed(2)} {item.unit}
              </Badge>
            ) : (
              <span className="text-[11px] font-mono text-slate-600">
                Saldo restante:{" "}
                <strong className="text-emerald-700">
                  {Math.max(0, remainingBeforeThis - item.quantity).toFixed(2)} {item.unit}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso do Escopo */}
        <div className="h-2 w-full bg-slate-200/90 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isExceeded ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-500 font-mono">
          <span>
            Já medido na obra: {otherExecutedInProject.toFixed(2)} {item.unit}
          </span>
          <span>
            Nesta medição: {item.quantity.toFixed(2)} {item.unit}
          </span>
          <span>
            Teto orçado: {maxQty.toFixed(2)} {item.unit}
          </span>
        </div>
      </div>

      {/* 2. Bloco Obrigatório de Auditoria de Excedente (Expande se exceder o teto) */}
      {isExceeded && (
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-3 animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Auditoria Obrigatória de Excedente
            </h5>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Como a quantidade ultrapassou o teto previsto para o projeto ({maxQty.toFixed(2)} {item.unit}), o MediPro requer o motivo e foto comprobatória da obra para envio à conferência do gestor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            {/* Motivo do Excedente (Select Obrigatório) */}
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Motivo do Excedente <span className="text-rose-500">*</span>
              </label>
              <Select
                value={item.exceededReason || "client_additive"}
                disabled={isReadOnly}
                onChange={(e) =>
                  onUpdateAuditField("exceededReason", e.target.value as ExceededReason)
                }
                className="w-full text-xs h-8 bg-white"
              >
                {Object.entries(EXCEEDED_REASON_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Observações / Justificativa Opcional */}
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Justificativa / Observação
              </label>
              <Textarea
                rows={2}
                disabled={isReadOnly}
                value={item.justificationNotes || ""}
                onChange={(e) =>
                  onUpdateAuditField("justificationNotes", e.target.value)
                }
                placeholder="Ex: Solicitado aditivo em campo pelo encarregado da construtora..."
                className="text-xs bg-white min-h-[50px]"
              />
            </div>
          </div>

          {/* Upload de Foto de Evidência (Obrigatório) */}
          <div className="space-y-1.5 pt-1 border-t border-amber-200/80">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>
                Foto de Evidência da Obra <span className="text-rose-500">*</span>
              </span>
              {item.evidencePhotoUrl ? (
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Foto anexada
                </span>
              ) : (
                <span className="text-[10px] text-rose-600 font-semibold">
                  Foto obrigatória para liberar o envio
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
                  alt="Evidência do excedente"
                  className="h-24 w-36 object-cover"
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => onUpdateAuditField("evidencePhotoUrl", undefined)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadOnly}
                className="text-xs h-8 border-dashed border-amber-400 bg-white hover:bg-amber-50 text-amber-900 gap-1.5"
              >
                <Camera className="h-3.5 w-3.5 text-amber-600" />
                <span>Tirar ou Anexar Foto da Obra</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
