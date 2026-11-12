import {
  CheckCircle2,
  RotateCcw,
  Car,
  Hotel,
  Utensils,
  Wrench,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementDetailViewProps {
  measurement: Measurement
  onApprove: (id: string) => void
  onRequestRework: (id: string) => void
}

export function MeasurementDetailView({
  measurement,
  onApprove,
  onRequestRework,
}: MeasurementDetailViewProps) {
  const isPending = measurement.status === "pending"

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
              {measurement.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">
                    {item.serviceName}
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
              ))}
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

        <div className="flex items-center gap-2 justify-end">
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
        </div>
      </div>
    </div>
  )
}
