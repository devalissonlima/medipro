import React, { useState } from "react"
import {
  CheckCircle2,
  RotateCcw,
  Car,
  Hotel,
  Utensils,
  Wrench,
  AlertCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
  X,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useAuthStore } from "@/stores/authStore"
import { EXCEEDED_REASON_LABELS, type Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementDetailViewProps {
  measurement: Measurement
  onApprove: (id: string) => void
  onRequestRework: (id: string) => void
  onManage?: (measurement: Measurement) => void
  readOnly?: boolean
  headerActions?: React.ReactNode
}

export function MeasurementDetailView({
  measurement,
  onApprove,
  onRequestRework,
  onManage,
  readOnly = false,
  headerActions,
}: MeasurementDetailViewProps) {
  const isPending = measurement.status === "pending"
  const updateItemAuditStatus = useMeasurementsStore(
    (s) => s.updateItemAuditStatus
  )
  const user = useAuthStore((s) => s.user)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)

  const canAudit =
    !readOnly &&
    (user?.role === "MANAGER" ||
      user?.role === "PROJECT_SUPERVISOR" ||
      user?.role === "MASTER")

  const effectiveSignatureUrl = measurement.signatureUrl || user?.signatureUrl
  const effectiveSignatureName =
    measurement.signatureName ||
    user?.signatureName ||
    measurement.collaboratorName ||
    "Profissional Responsável"

  return (
    <div className="bg-slate-50/90 border-t border-slate-200/90 p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
      {/* Nota de Revisão se já estiver em status 'rework' */}
      {measurement.status === "rework" && measurement.reworkNote && (
        <div className="flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50/80 p-3 text-xs text-orange-900">
          <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Observação de Revisão Enviada:</span>
            <p className="mt-0.5 text-orange-800">{measurement.reworkNote}</p>
          </div>
        </div>
      )}

      {/* Ações da Medição (Alinhadas à Direita antes da Sessão de Serviços) */}
      {headerActions && (
        <div className="flex items-center justify-end">
          {headerActions}
        </div>
      )}

      {/* 1. Tabela Detalhada de Serviços Auditados */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Serviços Executados ({measurement.items.length})
          </h4>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            Subtotal Serviços: {formatCurrency(measurement.servicesTotal)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Serviço Cadastrado</th>
                <th className="p-3">Material Trabalhado</th>
                <th className="p-3 text-center">Medida / Qtd</th>
                <th className="p-3 text-right">Unitário Cobrado</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {measurement.items.map((item) => {
                const hasAuditAlert = item.isExceeded || item.isOutOfScope

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50/50 transition-colors ${
                        hasAuditAlert ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="p-3 font-medium text-slate-900">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{item.serviceName}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.isOutOfScope && (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase">
                                Fora de Escopo
                              </Badge>
                            )}
                            {item.isExceeded && item.exceededQuantity && (
                              <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-bold">
                                Excedente: +{item.exceededQuantity.toFixed(2)} {item.unit}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.materialName ? (
                          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                            {item.materialName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Padrão de obra</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-slate-800">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>

                    {/* Bloco de Auditoria do Item (Excedente ou Fora de Escopo) */}
                    {hasAuditAlert && (
                      <tr className="bg-amber-50/30 border-b border-amber-100">
                        <td colSpan={5} className="p-3 pt-0">
                          <div className="rounded-lg border border-amber-200/90 bg-white/95 p-3 text-xs space-y-2.5 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                  Auditoria de Item:
                                </span>
                                {item.auditStatus === "pending" && (
                                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                                    Auditoria Pendente
                                  </Badge>
                                )}
                                {item.auditStatus === "approved" && (
                                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-bold">
                                    Item Aprovado
                                  </Badge>
                                )}
                                {item.auditStatus === "rejected" && (
                                  <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px] font-bold">
                                    Item Rejeitado
                                  </Badge>
                                )}
                              </div>

                              {canAudit && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={item.auditStatus === "approved"}
                                    onClick={() =>
                                      updateItemAuditStatus(
                                        measurement.id,
                                        item.id,
                                        "approved"
                                      )
                                    }
                                    className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 px-2.5"
                                  >
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    Aprovar {item.isOutOfScope ? "Extra" : "Excedente"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={item.auditStatus === "rejected"}
                                    onClick={() =>
                                      updateItemAuditStatus(
                                        measurement.id,
                                        item.id,
                                        "rejected"
                                      )
                                    }
                                    className="h-7 text-[11px] font-semibold text-rose-700 border-rose-300 hover:bg-rose-50 gap-1 px-2.5"
                                  >
                                    <X className="h-3.5 w-3.5 text-rose-600" />
                                    Rejeitar {item.isOutOfScope ? "Extra" : "Excedente"}
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-9 space-y-1">
                                {item.exceededReason && (
                                  <p className="text-[11px] text-slate-600">
                                    <strong>Motivo do Excedente:</strong>{" "}
                                    <span className="text-slate-800">
                                      {EXCEEDED_REASON_LABELS[item.exceededReason] ||
                                        item.exceededReason}
                                    </span>
                                  </p>
                                )}
                                {item.justificationNotes && (
                                  <p className="text-[11px] text-slate-600 italic">
                                    <strong>Justificativa do instalador:</strong> &ldquo;
                                    {item.justificationNotes}&rdquo;
                                  </p>
                                )}
                              </div>

                              {item.evidencePhotoUrl && (
                                <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
                                  <Button
                                    type="button"
                                    variant="unstyled"
                                    size="auto"
                                    onClick={() =>
                                      setPreviewPhotoUrl(item.evidencePhotoUrl || null)
                                    }
                                    className="group relative rounded-lg border border-slate-200 overflow-hidden hover:border-amber-400 transition-all shadow-2xs"
                                    title="Clique para ampliar a foto de evidência da obra"
                                  >
                                    <img
                                      src={item.evidencePhotoUrl}
                                      alt="Foto de Evidência"
                                      className="h-12 w-20 object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Camera className="h-3.5 w-3.5 text-white" />
                                    </div>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Detalhamento de Custos Operacionais */}
      {measurement.operationalCosts && measurement.costsTotal > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-slate-400" />
              Despesas & Custos de Campo Anexados
            </h4>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Total Despesas: {formatCurrency(measurement.costsTotal)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {measurement.operationalCosts.transport ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Car className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Transporte:</span>
                    <strong className="font-mono text-slate-900">
                      {formatCurrency(measurement.operationalCosts.transport)}
                    </strong>
                  </div>
                </div>
              ) : null}

              {measurement.operationalCosts.lodging ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Hotel className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hospedagem:</span>
                    <strong className="font-mono text-slate-900">
                      {formatCurrency(measurement.operationalCosts.lodging)}
                    </strong>
                  </div>
                </div>
              ) : null}

              {measurement.operationalCosts.food ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Utensils className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Alimentação:</span>
                    <strong className="font-mono text-slate-900">
                      {formatCurrency(measurement.operationalCosts.food)}
                    </strong>
                  </div>
                </div>
              ) : null}

              {measurement.operationalCosts.extraSetup ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Wrench className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Setup / Risco:</span>
                    <strong className="font-mono text-slate-900">
                      {formatCurrency(measurement.operationalCosts.extraSetup)}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>

            {measurement.operationalCosts.notes && (
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-0.5">
                  Justificativa do Instalador:
                </span>
                <p className="italic">{measurement.operationalCosts.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assinatura Digital do Executor */}
      {effectiveSignatureUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assinatura Digital Registrada
            </span>
            <p className="text-xs font-bold text-slate-800">
              {effectiveSignatureName}
            </p>
          </div>
          <div className="h-12 px-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-center shrink-0">
            <img
              src={effectiveSignatureUrl}
              alt={`Assinatura digital de ${effectiveSignatureName}`}
              className="max-h-10 max-w-[180px] object-contain"
            />
          </div>
        </div>
      )}

      {/* 3. Rodapé de Fechamento & Ações do Gestor */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total a Liquidar:
          </span>
          <span className="text-xl font-black text-slate-900 font-mono">
            {formatCurrency(measurement.grandTotal)}
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 justify-end">
            {onManage && (
              <Button
                type="button"
                size="sm"
                onClick={() => onManage(measurement)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 h-9 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Gerenciar Medição</span>
              </Button>
            )}

            {!onManage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestRework(measurement.id)}
                  className="text-xs text-orange-700 border-orange-300 hover:bg-orange-50 gap-1.5 h-9"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
                  <span>Solicitar Revisão</span>
                </Button>

                {isPending && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onApprove(measurement.id)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 h-9 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Aprovar Medição</span>
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal Lightbox para visualização de foto de evidência */}
      <Dialog
        open={!!previewPhotoUrl}
        onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}
      >
        <DialogContent
          onClose={() => setPreviewPhotoUrl(null)}
          className="max-w-2xl p-4 bg-white"
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-amber-600" />
              Foto de Evidência da Obra
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[70vh]">
            <img
              src={previewPhotoUrl || ""}
              alt="Foto de Evidência da Obra"
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}