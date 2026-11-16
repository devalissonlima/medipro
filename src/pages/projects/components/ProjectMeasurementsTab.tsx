import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  File,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileDown,
  Printer,
  Check,
  ShieldCheck,
  Search,
  Plus,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { MeasurementDetailView } from "@/pages/dashboard/components/MeasurementDetailView"
import { GroupedMeasurementsList } from "@/components/shared/GroupedMeasurementsList"
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
  canApprove: boolean
  isMember?: boolean
  canCreateMeasurement?: boolean
  projectId?: string
  onApprove: (id: string) => void
  onRequestRework: (id: string, note: string) => void
  onReject: (id: string, reason?: string) => void
  onDelete?: (id: string) => void
  onFinalize?: (id: string) => void
}

export const ProjectMeasurementsTab: React.FC<ProjectMeasurementsTabProps> = ({
  measurements,
  canApprove,
  isMember = false,
  canCreateMeasurement = false,
  projectId,
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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

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

  // Filtros de status e pesquisa
  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) => {
      // Filtro por status
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false
      }

      // Filtro por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = m.title.toLowerCase().includes(query)
        const matchAuthor = (m.collaboratorName || "").toLowerCase().includes(query)
        const matchLocation = (m.location || "").toLowerCase().includes(query)
        const matchId = m.id.toLowerCase().includes(query)
        if (!matchTitle && !matchAuthor && !matchLocation && !matchId) {
          return false
        }
      }

      return true
    })
  }, [measurements, statusFilter, searchQuery])

  // Contadores por status para os pills
  const statusCounts = useMemo(() => {
    return {
      all: measurements.length,
      pending: measurements.filter((m) => m.status === "pending").length,
      approved: measurements.filter((m) => m.status === "approved").length,
      rework: measurements.filter((m) => m.status === "rework").length,
      draft: measurements.filter((m) => m.status === "draft").length,
    }
  }, [measurements])

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Barra de Filtros & Ações da Aba de Medições */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isMember
                ? `Minhas Medições nesta Obra (${measurements.length})`
                : `Lista de Medições da Obra (${measurements.length})`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulte detalhes dos serviços aferidos, gerencie aprovações e exporte relatórios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {measurements.length > 0 && (
              <>
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
              </>
            )}

            {canCreateMeasurement && projectId && (
              <Button
                size="sm"
                onClick={() => navigate(`/medicoes/nova?projectId=${projectId}`)}
                className="h-8 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400" />
                <span>Nova Medição</span>
              </Button>
            )}
          </div>
        </div>

        {/* Linha de Busca e Filtros Rápidos */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Pills de Status */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Todas</span>
              <span className="text-[10px] opacity-80">({statusCounts.all})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <span>Aguardando</span>
              <span className="text-[10px] font-bold">({statusCounts.pending})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <span>Aprovadas</span>
              <span className="text-[10px] font-bold">({statusCounts.approved})</span>
            </button>

            {statusCounts.rework > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter("rework")}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  statusFilter === "rework"
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200"
                }`}
              >
                <span>Em Ajuste</span>
                <span className="text-[10px] font-bold">({statusCounts.rework})</span>
              </button>
            )}

            {statusCounts.draft > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  statusFilter === "draft"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Rascunhos</span>
                <span className="text-[10px] font-bold">({statusCounts.draft})</span>
              </button>
            )}
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por título, código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Lista de Medições */}
      {filteredMeasurements.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/60">
          <CardContent className="py-12 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
              <File className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {measurements.length === 0
                ? isMember
                  ? "Você ainda não enviou medições para esta obra"
                  : "Nenhuma medição enviada para esta obra ainda"
                : "Nenhuma medição encontrada com os filtros selecionados"}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {measurements.length === 0
                ? isMember
                  ? "Clique no botão 'Nova Medição' para lançar seus serviços executados."
                  : "Assim que os instaladores ou o encarregado enviarem medições vinculadas a este projeto, elas aparecerão aqui para conferência."
                : "Tente limpar os filtros de status ou a busca por texto."}
            </p>
            {statusFilter !== "all" || searchQuery ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setSearchQuery("")
                }}
                className="text-xs mt-2"
              >
                Limpar Filtros
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <GroupedMeasurementsList
          measurements={filteredMeasurements}
          renderItem={(measurement) => {
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
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          #{measurement.id}
                        </span>
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
                        <span className="text-[11px] text-slate-400">
                          {measurement.items.length}{" "}
                          {measurement.items.length === 1 ? "item" : "itens"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">
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
                                    size="icon"
                                    onClick={() => onFinalize(measurement.id)}
                                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                    aria-label="Finalizar e enviar medição"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Finalizar Medição</span>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Gerenciar Medição (Manager/Supervisor) */}
                            {canApprove && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    onClick={() => setManagingMeasurement(measurement)}
                                    className="h-8 w-8 bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
                                    aria-label="Gerenciar aprovação da medição"
                                  >
                                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Gerenciar Medição</span>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Imprimir / Salvar PDF */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => exportMeasurementToPDF(measurement)}
                                  className="h-8 w-8 text-slate-700 hover:text-slate-900 border-slate-300 bg-white"
                                  aria-label="Imprimir ou salvar PDF da medição"
                                >
                                  <Printer className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>Imprimir / PDF</span>
                              </TooltipContent>
                            </Tooltip>

                            {/* Editar Medição (quando permitido) */}
                            {measurement.status !== "approved" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigate(`/medicoes/editar/${measurement.id}`)}
                                    className="h-8 w-8 text-slate-700 hover:text-slate-900 border-slate-300 bg-white"
                                    aria-label="Editar medição"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-amber-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Editar Medição</span>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Excluir Medição */}
                            {measurement.status !== "approved" && onDelete && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setDeletingId(measurement.id)}
                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-300 bg-white"
                                    aria-label="Excluir medição"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Excluir Medição</span>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      }
                    />
                  </div>
                )}

                {/* Confirmação Inline de Exclusão */}
                {deletingId === measurement.id && onDelete && (
                  <div className="border-t border-rose-200 bg-rose-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
                    <div>
                      <strong className="block font-bold">Excluir esta medição?</strong>
                      <span>Esta ação removerá permanentemente os lançamentos deste documento.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingId(null)}
                        className="h-7 text-xs bg-white border-slate-300 text-slate-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onDelete(measurement.id)
                          setDeletingId(null)
                        }}
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Sim, Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          }}
        />
      )}

      {/* Modal de Gerenciamento da Medição */}
      <ManageMeasurementModal
        measurement={managingMeasurement}
        isOpen={!!managingMeasurement}
        onClose={() => setManagingMeasurement(null)}
        onApprove={(id) => {
          onApprove(id)
          setManagingMeasurement(null)
        }}
        onRequestRework={(id, note) => {
          onRequestRework(id, note)
          setManagingMeasurement(null)
        }}
        onReject={(id, reason) => {
          onReject(id, reason)
          setManagingMeasurement(null)
        }}
      />
    </div>
  )
}
