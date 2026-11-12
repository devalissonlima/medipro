import { useState, useEffect } from "react"
import {
  CheckCircle2,
  RotateCcw,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface ManageMeasurementModalProps {
  measurement: Measurement | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onRequestRework: (id: string, note: string) => void
  onReject: (id: string, reason?: string) => void
}

type ManagementAction = "approve" | "rework" | "reject" | null

export function ManageMeasurementModal({
  measurement,
  isOpen,
  onClose,
  onApprove,
  onRequestRework,
  onReject,
}: ManageMeasurementModalProps) {
  const [selectedAction, setSelectedAction] = useState<ManagementAction>(null)
  const [reworkNote, setReworkNote] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (measurement) {
      setSelectedAction(null)
      setReworkNote(measurement.reworkNote || "")
      setRejectReason("")
      setError(null)
    }
  }, [measurement, isOpen])

  if (!measurement) return null

  const handleConfirmAction = () => {
    if (!selectedAction) return

    if (selectedAction === "approve") {
      onApprove(measurement.id)
      onClose()
    } else if (selectedAction === "rework") {
      if (!reworkNote.trim()) {
        setError("Por favor, informe a instrução de ajuste para o colaborador.")
        return
      }
      onRequestRework(measurement.id, reworkNote.trim())
      onClose()
    } else if (selectedAction === "reject") {
      onReject(measurement.id, rejectReason.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-lg">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Gerenciar Medição</DialogTitle>
              <DialogDescription className="text-xs">
                Audite e decida sobre a aprovação, ajuste ou rejeição desta medição.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card Resumo da Medição */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {measurement.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {measurement.collaboratorName || "Profissional da Obra"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {measurement.date}
                  </span>
                </div>
              </div>
              <MeasurementStatusBadge status={measurement.status} />
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Valor Total da Medição:</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatCurrency(measurement.grandTotal)}
              </span>
            </div>
          </div>

          {/* Seleção de Ação */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Selecione a Ação Desejada:
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Opção Aprovar */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAction("approve")
                  setError(null)
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedAction === "approve"
                    ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <CheckCircle2
                  className={`h-5 w-5 ${
                    selectedAction === "approve"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                />
                <span className="text-xs font-bold">Aprovar</span>
              </button>

              {/* Opção Pedir Ajuste */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAction("rework")
                  setError(null)
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedAction === "rework"
                    ? "border-orange-500 bg-orange-50/80 text-orange-900 ring-2 ring-orange-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <RotateCcw
                  className={`h-5 w-5 ${
                    selectedAction === "rework"
                      ? "text-orange-600"
                      : "text-slate-400"
                  }`}
                />
                <span className="text-xs font-bold">Pedir Ajuste</span>
              </button>

              {/* Opção Rejeitar */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAction("reject")
                  setError(null)
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedAction === "reject"
                    ? "border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <XCircle
                  className={`h-5 w-5 ${
                    selectedAction === "reject"
                      ? "text-rose-600"
                      : "text-slate-400"
                  }`}
                />
                <span className="text-xs font-bold">Rejeitar</span>
              </button>
            </div>
          </div>

          {/* Painéis Contextuais por Ação */}
          {selectedAction === "approve" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 space-y-1 animate-in fade-in duration-150">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Liquidação e Aprovação Financeira
              </span>
              <p className="text-emerald-800/90 leading-relaxed">
                Ao confirmar, a medição no valor de <strong>{formatCurrency(measurement.grandTotal)}</strong> será marcada como <strong>Aprovada</strong> e incorporada aos totais já liquidados desta obra.
              </p>
            </div>
          )}

          {selectedAction === "rework" && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-orange-900 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                Instruções de Ajuste para o Colaborador: *
              </label>
              <Textarea
                placeholder="Descreva exatamente o que deve ser conferido ou alterado (ex: revisar metragem de rodapés ou anexar comprovante de alimentação)..."
                value={reworkNote}
                onChange={(e) => {
                  setReworkNote(e.target.value)
                  setError(null)
                }}
                className="text-xs min-h-[90px] bg-white border-slate-300 focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-500">
                O colaborador verá esta mensagem no painel dele e a medição será desbloqueada para edição.
              </p>
            </div>
          )}

          {selectedAction === "reject" && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-rose-900 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Motivo da Rejeição (opcional):
              </label>
              <Textarea
                placeholder="Informe o motivo da recusa desta medição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs min-h-[80px] bg-white border-slate-300 focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-500">
                A medição será arquivada como Rejeitada e seus valores não serão computados na obra.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 border-t border-slate-100 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-9"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={!selectedAction}
            onClick={handleConfirmAction}
            className={`text-xs h-9 font-semibold gap-1.5 text-white ${
              selectedAction === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : selectedAction === "rework"
                ? "bg-orange-600 hover:bg-orange-700"
                : selectedAction === "reject"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {selectedAction === "approve" && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirmar Aprovação
              </>
            )}
            {selectedAction === "rework" && (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Solicitar Ajuste
              </>
            )}
            {selectedAction === "reject" && (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Confirmar Rejeição
              </>
            )}
            {!selectedAction && "Escolha uma Ação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
