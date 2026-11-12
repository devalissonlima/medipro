import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardMetricsData } from "@/types/dashboard"
import { formatCurrency } from "@/utils/calculations"

interface DashboardMetricsProps {
  metrics: DashboardMetricsData
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total a Pagar (Pendente) */}
      <Card className="border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Total a Pagar (Pendente)
            </span>
            <h3 className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              {formatCurrency(metrics.totalPendingAmount)}
            </h3>
            <p className="text-[11px] text-amber-700/80 font-medium">
              {metrics.pendingCount} medições aguardando conferência
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Liquidado / Aprovado */}
      <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Total Liquidado / Aprovado
            </span>
            <h3 className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {formatCurrency(metrics.totalApprovedAmount)}
            </h3>
            <p className="text-[11px] text-emerald-700/80 font-medium">
              Valores validados no período
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Medições Pendentes de Análise */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Aguardando Decisão
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.pendingCount}
            </h3>
            <p className="text-[11px] text-slate-500">
              Fluxo de auditoria sem papel
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Colaboradores Ativos */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Colaboradores Ativos
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.activeMembersCount}
            </h3>
            <p className="text-[11px] text-slate-500">
              Profissionais com lançamentos
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
