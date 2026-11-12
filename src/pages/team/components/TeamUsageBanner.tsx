import { Users, AlertTriangle, ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TeamPlanUsage } from "@/types/team"

interface TeamUsageBannerProps {
  usage: TeamPlanUsage & {
    percentage: number
    isAtLimit: boolean
    isNearLimit: boolean
  }
}

export function TeamUsageBanner({ usage }: TeamUsageBannerProps) {
  const navigate = useNavigate()

  // Cores dinâmicas da barra de progresso
  const getProgressColor = () => {
    if (usage.isAtLimit) return "bg-rose-500"
    if (usage.isNearLimit) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const availableLicenses = Math.max(0, usage.maxLicenses - usage.usedLicenses)

  return (
    <Card className="border-slate-200/90 bg-white shadow-xs overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Lado Esquerdo: Info de Capacidade */}
          <div className="space-y-2 flex-1 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Capacidade de Colaboradores & Licenças
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-slate-50 text-slate-700 border-slate-300"
                >
                  {usage.planName}
                </Badge>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">
                  {usage.usedLicenses} de {usage.maxLicenses} licenças em uso
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {usage.percentage}% ocupado
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${getProgressColor()}`}
                  style={{ width: `${usage.percentage}%` }}
                />
              </div>
            </div>

            {/* Mensagem de Status */}
            <p className="text-xs text-slate-500">
              {usage.isAtLimit ? (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Limite máximo de licenças atingido. Faça upgrade para adicionar novos instaladores.
                </span>
              ) : usage.isNearLimit ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Apenas {availableLicenses} licença disponível no plano atual.
                </span>
              ) : (
                <span className="text-slate-600">
                  Você ainda possui <strong>{availableLicenses} licenças livres</strong> para convidar membros.
                </span>
              )}
            </p>
          </div>

          {/* Lado Direito: Ação de Upgrade / Upsell */}
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/plano")}
              className="text-xs font-semibold h-10 px-4 border-slate-300 text-slate-800 hover:bg-slate-100 gap-1.5 shadow-2xs"
            >
              <span>Fazer Upgrade de Licenças</span>
              <ArrowUpRight className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
