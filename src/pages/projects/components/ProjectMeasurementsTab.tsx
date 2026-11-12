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
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { MeasurementDetailView } from "@/pages/dashboard/components/MeasurementDetailView"
import { ManageMeasurementModal } from "./ManageMeasurementModal"
import { formatCurrency } from "@/utils/calculations"
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
}) => {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [managingMeasurement, setManagingMeasurement] = useState<Measurement | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* KPIs Isolados da Obra */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {isMember ? "Meu Total Aprovado" : "Total Aprovado nesta Obra"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.approvedTotal)}
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              {isMember
                ? "Seus valores já liquidados e conferidos"
                : "Valores já liquidados e conferidos"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {isMember ? "Meu Total Pendente" : "Total Pendente na Obra"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.pendingTotal)}
            </p>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              {metrics.pendingCount}{" "}
              {metrics.pendingCount === 1
                ? isMember
                  ? "medição sua aguardando conferência"
                  : "medição aguardando aprovação"
                : isMember
                ? "medições suas aguardando conferência"
                : "medições aguardando aprovação"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {isMember ? "Minhas Medições & Ajustes" : "Volume & Ajustes"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Ruler className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.totalCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              {metrics.reworkCount > 0 ? (
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {metrics.reworkCount} {metrics.reworkCount === 1 ? "em ajuste solicitado" : "em ajuste solicitados"}
                </span>
              ) : (
                "Nenhum apontamento de revisão pendente"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela / Lista de Medições da Obra */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {isMember
              ? `Minhas Medições nesta Obra (${measurements.length})`
              : `Medições Vinculadas a este Projeto (${measurements.length})`}
          </h3>
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
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {measurement.title}
                          </span>
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
                        {deletingId === measurement.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                            <span className="text-[11px] font-semibold text-rose-800 px-1">
                              Excluir?
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingId(null)}
                              className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900"
                            >
                              Não
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                onDelete?.(measurement.id)
                                setDeletingId(null)
                              }}
                              className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
                            >
                              Sim
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Ação de Gerenciamento para Gestor, Supervisor e Solo */}
                            {canApprove && (
                              <Button
                                size="sm"
                                onClick={() => setManagingMeasurement(measurement)}
                                className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 px-3 font-semibold shadow-2xs"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                                <span>Gerenciar</span>
                              </Button>
                            )}

                            {/* Ações do Membro dono da medição */}
                            {isMember && measurement.status !== "approved" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/medicoes/editar/${measurement.id}`)}
                                  className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1 px-2.5"
                                >
                                  <Pencil className="h-3 w-3 text-slate-500" />
                                  Editar
                                </Button>
                                {onDelete && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeletingId(measurement.id)}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    title="Excluir medição"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpand(measurement.id)}
                              className="h-8 text-xs text-slate-600 hover:text-slate-900 gap-1"
                            >
                              <span>{isExpanded ? "Ocultar" : "Detalhes"}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </>
                        )}
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
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Dedicado de Gerenciamento da Medição */}
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
