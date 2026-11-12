import {
  Calendar,
  MapPin,
  Building2,
  Share2,
  CheckCircle2,
  RotateCcw,
  XCircle,
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
import { MeasurementStatusBadge } from "./MeasurementStatusBadge"
import type { Measurement, MeasurementStatus } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementDetailModalProps {
  measurement: Measurement | null
  onClose: () => void
  onUpdateStatus: (id: string, status: MeasurementStatus) => void
  onOpenShare: (measurement: Measurement) => void
}

export function MeasurementDetailModal({
  measurement,
  onClose,
  onUpdateStatus,
  onOpenShare,
}: MeasurementDetailModalProps) {
  if (!measurement) return null

  return (
    <Dialog open={!!measurement} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MeasurementStatusBadge status={measurement.status} />
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Data: {measurement.date}</span>
            </div>
          </div>
          <DialogTitle className="text-xl pt-1">
            {measurement.title}
          </DialogTitle>
          {measurement.location && (
            <DialogDescription className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{measurement.location}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Destinatário */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              Destinatário:{" "}
              <strong className="text-slate-900">
                {measurement.clientName || "Liderança da Obra"}
              </strong>
            </span>
          </div>

          {/* Tabela de Serviços */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Itens da Medição ({measurement.items.length})
            </h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-2.5">Serviço & Material</th>
                    <th className="p-2.5 text-center">Qtd.</th>
                    <th className="p-2.5 text-right">Unitário</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {measurement.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5">
                        <p className="font-semibold text-slate-900">
                          {item.serviceName}
                        </p>
                        {item.materialName && (
                          <p className="text-[11px] text-slate-500">
                            {item.materialName}
                          </p>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Despesas de Campo se houver */}
          {measurement.operationalCosts && measurement.costsTotal > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Despesas Operacionais de Campo:</span>
                <span className="font-mono">{formatCurrency(measurement.costsTotal)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1">
                {measurement.operationalCosts.transport ? (
                  <div>
                    Transporte:{" "}
                    <strong>{formatCurrency(measurement.operationalCosts.transport)}</strong>
                  </div>
                ) : null}
                {measurement.operationalCosts.lodging ? (
                  <div>
                    Estadia:{" "}
                    <strong>{formatCurrency(measurement.operationalCosts.lodging)}</strong>
                  </div>
                ) : null}
                {measurement.operationalCosts.food ? (
                  <div>
                    Alimentação:{" "}
                    <strong>{formatCurrency(measurement.operationalCosts.food)}</strong>
                  </div>
                ) : null}
                {measurement.operationalCosts.extraSetup ? (
                  <div>
                    Setup/Risco:{" "}
                    <strong>{formatCurrency(measurement.operationalCosts.extraSetup)}</strong>
                  </div>
                ) : null}
              </div>
              {measurement.operationalCosts.notes && (
                <p className="text-[11px] text-slate-500 italic pt-1">
                  Obs: {measurement.operationalCosts.notes}
                </p>
              )}
            </div>
          )}

          {/* Fechamento de Totais */}
          <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Valor Total Consolidado
              </p>
              <p className="text-xs text-slate-400">
                Serviços ({formatCurrency(measurement.servicesTotal)}) + Despesas ({formatCurrency(measurement.costsTotal)})
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(measurement.grandTotal)}
              </span>
            </div>
          </div>

          {/* Ações de Mudança de Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600">
              Aprovação / Conferência:
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(measurement.id, "approved")}
                className="h-8 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Aprovar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(measurement.id, "rework")}
                className="h-8 text-xs text-orange-700 border-orange-300 hover:bg-orange-50 gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
                Pedir Ajuste
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(measurement.id, "rejected")}
                className="h-8 text-xs text-rose-700 border-rose-300 hover:bg-rose-50 gap-1"
              >
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Rejeitar
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenShare(measurement)}
            className="text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5 text-slate-600" />
            Compartilhar Link
          </Button>
          <Button
            type="button"
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs"
            onClick={onClose}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
