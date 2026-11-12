import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Car,
  MapPin,
  Calendar,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { MeasurementDetailView } from "./MeasurementDetailView"
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementReviewRowProps {
  measurement: Measurement
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onApprove: (id: string) => void
  onRequestRework: (id: string) => void
}

export function MeasurementReviewRow({
  measurement,
  isSelected,
  onToggleSelect,
  onApprove,
  onRequestRework,
}: MeasurementReviewRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isPending = measurement.status === "pending"
  const hasCosts = measurement.operationalCosts && measurement.costsTotal > 0

  const collaboratorInitials = (
    measurement.collaboratorName ||
    measurement.clientName ||
    "MP"
  )
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden ${
        isSelected
          ? "border-amber-400 bg-amber-50/20 shadow-xs"
          : "border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs"
      }`}
    >
      {/* Linha Compacta Principal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3.5 sm:p-4 gap-3">
        {/* Checkbox + Colaborador + Medição */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Checkbox de Seleção em Lote */}
          <div className="flex items-center pt-0.5 sm:pt-0">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={!isPending}
              onChange={() => onToggleSelect(measurement.id)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label={`Selecionar medição ${measurement.title}`}
            />
          </div>

          {/* Avatar do Liderado */}
          <Avatar size="sm" className="shrink-0 border border-slate-200 bg-slate-100 font-bold text-slate-700">
            <AvatarImage
              src={measurement.collaboratorAvatar}
              alt={measurement.collaboratorName}
            />
            <AvatarFallback>{collaboratorInitials}</AvatarFallback>
          </Avatar>

          {/* Dados da Medição & Obra */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm truncate max-w-sm">
                {measurement.title}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 font-medium truncate">
                {measurement.collaboratorName || "Instalador da Obra"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
              {measurement.location && (
                <span className="flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  {measurement.location}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                {measurement.date}
              </span>

              {/* Badges de Composição Resumida */}
              <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                {measurement.items.length} {measurement.items.length === 1 ? "serviço" : "serviços"}
              </span>

              {hasCosts && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 text-[10px] font-semibold">
                  <Car className="h-2.5 w-2.5" />
                  Despesas inclusas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Valor + Status + Ações Rápidas */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {/* Valor Total em Destaque */}
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block font-medium">
              Valor Total:
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(measurement.grandTotal)}
            </span>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            <MeasurementStatusBadge status={measurement.status} />
          </div>

          {/* Ações Rápidas do Gestor */}
          <div className="flex items-center gap-1 shrink-0">
            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(measurement.id)}
                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  title="Aprovação rápida"
                >
                  <Check className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRequestRework(measurement.id)}
                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
                  title="Solicitar ajuste / revisão"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {/* Expandir / Recolher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`h-8 px-2 text-xs font-semibold rounded-lg gap-1 transition-colors ${
                isExpanded
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Auditoria detalhada inline"
            >
              <span>{isExpanded ? "Recolher" : "Auditar"}</span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Painel Expandido Inline para Auditoria Completa */}
      {isExpanded && (
        <MeasurementDetailView
          measurement={measurement}
          onApprove={onApprove}
          onRequestRework={onRequestRework}
        />
      )}
    </div>
  )
}
