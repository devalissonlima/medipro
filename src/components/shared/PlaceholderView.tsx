import type { LucideIcon } from "lucide-react"
import { Construction, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlaceholderViewProps {
  title: string
  description: string
  icon: LucideIcon
  features?: string[]
}

export function PlaceholderView({
  title,
  description,
  icon: Icon,
  features = [],
}: PlaceholderViewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2 border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Icon className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-amber-300 bg-amber-50/50 text-amber-800 gap-1 font-medium">
              <Construction className="h-3 w-3" />
              Módulo em Estruturação
            </Badge>
          </div>
          <div>
            <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
            <CardDescription className="text-slate-600 mt-1 text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        {features.length > 0 && (
          <CardContent className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Recursos previstos neste módulo:
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-[10px] font-semibold text-slate-700">
                    {idx + 1}
                  </span>
                  <span className="leading-5">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between">
        <CardHeader>
          <Badge className="w-fit bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
            Medipro Foundation
          </Badge>
          <CardTitle className="text-lg text-white mt-2">
            Padrão de Construção Civil
          </CardTitle>
          <CardDescription className="text-slate-300 text-xs leading-relaxed">
            Elimine o papel e a demora no fechamento de medições. Todas as regras de negócio deste módulo serão orquestradas via Custom Hooks e Zustand.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg bg-slate-800/80 p-3.5 border border-slate-700 text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Status Arquitetural</span>
              <span className="text-emerald-400 font-semibold">100% Tipado</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-2/3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Pronto para injeção de formulários e contratos de API na próxima sprint.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
