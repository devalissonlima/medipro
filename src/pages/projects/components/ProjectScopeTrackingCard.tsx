import React from "react"
import { Layers, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProjectScopeItem } from "@/types/project"
import type { Measurement } from "@/types/measurement"

interface ProjectScopeTrackingCardProps {
  scopeItems?: ProjectScopeItem[]
  measurements?: Measurement[]
}

export const ProjectScopeTrackingCard: React.FC<ProjectScopeTrackingCardProps> = ({
  scopeItems = [],
  measurements = [],
}) => {
  if (scopeItems.length === 0) {
    return null
  }

  // Calcula a quantidade executada consolidando medições aprovadas e pendentes
  const calculatedItems = scopeItems.map((item) => {
    // Busca execuções correspondentes nas medições da obra
    let totalFromMeasurements = 0
    measurements.forEach((m) => {
      // Consideramos medições aprovadas e pendentes (não rejeitadas)
      if (m.status !== "rejected") {
        m.items?.forEach((serviceItem) => {
          const matchMaster =
            serviceItem.masterServiceId === item.masterServiceId ||
            serviceItem.serviceName.toLowerCase() === item.serviceName.toLowerCase()
          if (matchMaster) {
            totalFromMeasurements += serviceItem.quantity
          }
        })
      }
    })

    const finalExecuted = Math.max(item.executedQuantity || 0, totalFromMeasurements)
    const percentage = item.maxQuantity > 0 ? (finalExecuted / item.maxQuantity) * 100 : 0
    const isExceeded = finalExecuted > item.maxQuantity
    const isFull = finalExecuted === item.maxQuantity

    return {
      ...item,
      computedExecuted: finalExecuted,
      percentage: Math.min(percentage, 100),
      rawPercentage: percentage,
      isExceeded,
      isFull,
      exceededBy: finalExecuted - item.maxQuantity,
    }
  })

  return (
    <Card className="border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Acompanhamento de Escopo &amp; Trava de Metragem
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Progresso de execução versus o teto máximo previsto para esta obra.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-semibold bg-slate-100 text-slate-700 border-slate-200 self-start sm:self-auto"
          >
            {calculatedItems.length} {calculatedItems.length === 1 ? "item monitorado" : "itens monitorados"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculatedItems.map((item) => {
            let progressColor = "bg-blue-600"
            if (item.rawPercentage >= 100) {
              progressColor = item.isExceeded ? "bg-rose-500" : "bg-emerald-500"
            } else if (item.rawPercentage >= 80) {
              progressColor = "bg-amber-500"
            }

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {item.serviceName}
                      </span>
                      {item.environment && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-100 text-slate-600 border-slate-200"
                        >
                          {item.environment}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.isExceeded ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                      <AlertTriangle className="h-3 w-3" />
                      +{item.exceededBy.toFixed(2)} {item.unit}
                    </span>
                  ) : item.isFull ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      100% Concluído
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                      {item.rawPercentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Barra de Progresso Horizontal */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>
                    Executado:{" "}
                    <strong className="text-slate-800">
                      {item.computedExecuted.toFixed(2)} {item.unit}
                    </strong>
                  </span>
                  <span>
                    Previsto:{" "}
                    <strong className="text-slate-800">
                      {item.maxQuantity.toFixed(2)} {item.unit}
                    </strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
