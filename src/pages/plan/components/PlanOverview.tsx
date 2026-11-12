import { CreditCard, CheckCircle2 } from "lucide-react"
import { PlaceholderView } from "@/components/shared/PlaceholderView"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePlanData } from "../hooks/usePlanData"

export function PlanOverview() {
  const { currentPlan } = usePlanData()

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                {currentPlan.name}
              </Badge>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300">
                {currentPlan.status}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-slate-900 pt-1">
              {currentPlan.price}
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs">
              Próxima renovação em {currentPlan.renewalDate}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              Gerenciar Assinatura
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800">
              Upgrade para Enterprise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 pt-2 border-t border-amber-200/40 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Medições Ilimitadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Até 25 Colaboradores ({currentPlan.seatsUsed} em uso)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Exportação de Relatórios e PDFs com Logotipo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Suporte Prioritário Via WhatsApp</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PlaceholderView
        title="Gestão de Assinatura & Limites Operacionais"
        description="Administre o plano do seu negócio, visualize o histórico de notas fiscais de pagamento do software e contrate assentos adicionais para equipes de obra."
        icon={CreditCard}
        features={[
          "Histórico e download de notas fiscais e comprovantes de pagamento",
          "Gestão de licenças por dispositivo e colaborador",
          "Módulos complementares: integração com ERPs e emissão de NFe de serviço",
          "Garantia de backup diário e conformidade com a LGPD",
        ]}
      />
    </div>
  )
}
