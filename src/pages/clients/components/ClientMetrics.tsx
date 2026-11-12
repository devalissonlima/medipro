import { Users, DollarSign, CalendarCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/utils/calculations"

interface ClientMetricsProps {
  metrics: {
    totalClients: number
    totalBilled: number
    activeClientsInMonth: number
  }
}

export function ClientMetrics({ metrics }: ClientMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total de Clientes */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Clientes na Carteira
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.totalClients}
            </h3>
            <p className="text-[11px] text-slate-500">
              Contratos e obras registradas
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Faturado / Em Aberto */}
      <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Volume Movimentado
            </span>
            <h3 className="text-2xl font-black text-emerald-700 font-mono tracking-tight mt-0.5">
              {formatCurrency(metrics.totalBilled)}
            </h3>
            <p className="text-[11px] text-emerald-700/80 font-medium">
              Soma total em medições
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Clientes Ativos no Mês */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Ativos no Mês
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.activeClientsInMonth}
            </h3>
            <p className="text-[11px] text-slate-500">
              Com medição nos últimos 30 dias
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
