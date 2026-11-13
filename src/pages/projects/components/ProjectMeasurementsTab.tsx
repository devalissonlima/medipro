import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ruler,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  Printer,
  Check,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { MeasurementDetailView } from "@/pages/dashboard/components/MeasurementDetailView"
import { ManageMeasurementModal } from "./ManageMeasurementModal"
import { formatCurrency } from "@/utils/calculations"
import {
  exportMeasurementsToCSV,
  exportMeasurementToPDF,
  exportMultipleMeasurementsToPDF,
} from "@/utils/exportUtils"
import type { Measurement } from "@/types/measurement"

interface ProjectMeasurementsTabProps {
  measurements: Measurement[]
  metrics: {
    approvedTotal: number
    pendingTotal: number
    reworkCount: number
    pendingCount: number
    totalCount: number
  }
  canApprove: boolean
  isMember?: boolean
  onApprove: (id: string) => void
  onRequestRework: (id: string, note: string) => void
  onReject: (id: string, reason?: string) => void
  onDelete?: (id: string) => void
  onFinalize?: (id: string) => void
}

export const ProjectMeasurementsTab: React.FC<ProjectMeasurementsTabProps> = ({
  measurements,
  metrics,
  canApprove,
  isMember = false,
  onApprove,
  onRequestRework,
  onReject,
  onDelete,
  onFinalize,
}) => {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [managingMeasurement, setManagingMeasurement] = useState<Measurement | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleExportCSV = () => {
    if (measurements.length === 0) return
    exportMeasurementsToCSV(measurements, "medicoes-obra")
  }

  const handleExportBatchPDF = () => {
    if (measurements.length === 0) return
    exportMultipleMeasurementsToPDF(measurements, "Relatório de Medições da Obra")
  }

  return (
    <div className="space-y-6">
      {/* KPIs Isolados da Obra: Títulos Padronizados e Objetivos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total de Medições
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Ruler className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {metrics.totalCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              {metrics.reworkCount > 0 ? (
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {metrics.reworkCount}{" "}
                  {metrics.reworkCount === 1 ? "em ajuste solicitado" : "em ajuste solicitados"}
                </span>
              ) : (
                "Medições registradas na obra"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aguardando Aprovação
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(metrics.pendingTotal)}
            </p>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              {metrics.pendingCount}{" "}
              {metrics.pendingCount === 1
                ? "medição aguardando conferência"
                : "medições aguardando conferência"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Aprovado
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(metrics.approvedTotal)}
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              {isMember
                ? "Seus valores já conferidos e liquidados"
                : "Valores já liquidados e conferidos"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela / Lista de Medições da Obra */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">
            {isMember
              ? `Minhas Medições nesta Obra (${measurements.length})`
              : `Medições Vinculadas a este Projeto (${measurements.length})`}
          </h3>

          {measurements.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                title="Exportar medições desta obra em CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Exportar CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportBatchPDF}
                className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                title="Exportar relatório consolidado em PDF"
              >
                <FileDown className="h-3.5 w-3.5 text-rose-600" />
                <span>Relatório PDF</span>
              </Button>
            </div>
          )}
        </div>

        {measurements.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50/60">
            <CardContent className="py-12 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
                <Ruler className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {isMember
                  ? "Você ainda não enviou medições para esta obra"
                  : "Nenhuma medição enviada para esta obra ainda"}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isMember
                  ? "Clique no botão 'Nova Medição na Obra' acima para lançar seus serviços executados."
                  : "Assim que os instaladores ou o encarregado enviarem medições vinculadas a este projeto, elas aparecerão aqui para conferência."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {measurements.map((measurement) => {
              const isExpanded = expandedId === measurement.id
              const initials = (
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
                  key={measurement.id}
                  className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-colors hover:border-slate-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        size="sm"
                        className="shrink-0 border border-slate-200 bg-slate-100 text-slate-700 font-bold"
                      >
                        <AvatarImage
                          src={measurement.collaboratorAvatar}
                          alt={measurement.collaboratorName}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/medicoes/${measurement.id}`)}
                            className="text-sm font-bold text-slate-900 hover:text-amber-600 hover:underline transition-colors truncate text-left"
                            title="Abrir página dedicada da medição"
                          >
                            {measurement.title}
                          </button>
                          <MeasurementStatusBadge status={measurement.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            {measurement.collaboratorName || "Profissional da Obra"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {measurement.date}
                          </span>
                          {measurement.location && (
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              {measurement.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-slate-400 block">
                          Valor Total
                        </span>
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {formatCurrency(measurement.grandTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Botão de Expandir / Ocultar Detalhes */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(measurement.id)}
                          className="h-8 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 gap-1 px-2.5 transition-colors shadow-2xs font-medium"
                        >
                          <span>{isExpanded ? "Ocultar" : "Detalhes"}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70">
                      <MeasurementDetailView
                        measurement={measurement}
                        onApprove={onApprove}
                        onRequestRework={() => {
                          setManagingMeasurement(measurement)
                        }}
                        onManage={canApprove ? () => setManagingMeasurement(measurement) : undefined}
                        readOnly={!canApprove}
                        headerActions={
                          <TooltipProvider delayDuration={150}>
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Finalizar Medição (quando rascunho) */}
                              {measurement.status === "draft" && onFinalize && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => onFinalize(measurement.id)}
                                      className="h-7 w-7 rounded-lg border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 shadow-2xs transition-colors"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span className="sr-only">Finalizar Medição</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Finalizar Medição</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Gerenciar Medição (Aprovação / Revisão / Rejeição) */}
                              {canApprove && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => setManagingMeasurement(measurement)}
                                      className="h-7 w-7 rounded-lg border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 shadow-2xs transition-colors"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      <span className="sr-only">Gerenciar Medição</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Gerenciar Medição</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Editar Medição */}
                              {measurement.status !== "approved" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => navigate(`/medicoes/editar/${measurement.id}`)}
                                      className="h-7 w-7 rounded-lg border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      <span className="sr-only">Editar Medição</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Editar Medição</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Imprimir / PDF */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => exportMeasurementToPDF(measurement)}
                                    className="h-7 w-7 rounded-lg border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
                                  >
                                    <Printer className="h-3.5 w-3.5" />
                                    <span className="sr-only">Imprimir / PDF</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Imprimir / PDF</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Ver Página Completa */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigate(`/medicoes/${measurement.id}`)}
                                    className="h-7 w-7 rounded-lg border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span className="sr-only">Ver Página Completa</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Ver Página Completa</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Excluir Medição */}
                              {measurement.status !== "approved" && onDelete && (
                                deletingId === measurement.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded-lg border border-rose-200">
                                    <span className="text-[10px] font-semibold text-rose-800 px-1">Excluir?</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeletingId(null)}
                                      className="h-6 text-[10px] px-1.5 text-slate-600 hover:text-slate-900"
                                    >
                                      Não
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        onDelete(measurement.id)
                                        setDeletingId(null)
                                      }}
                                      className="h-6 text-[10px] px-1.5 bg-rose-600 hover:bg-rose-700"
                                    >
                                      Sim
                                    </Button>
                                  </div>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setDeletingId(measurement.id)}
                                        className="h-7 w-7 rounded-lg border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="sr-only">Excluir Medição</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Excluir Medição</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              )}
                            </div>
                          </TooltipProvider>
                        }
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Dedicado de Gerenciamento da Medição (Aprovação, Revisão, Rejeição) */}
      {canApprove && (
        <ManageMeasurementModal
          measurement={managingMeasurement}
          isOpen={!!managingMeasurement}
          onClose={() => setManagingMeasurement(null)}
          onApprove={onApprove}
          onRequestRework={onRequestRework}
          onReject={onReject}
        />
      )}
    </div>
  )
}
