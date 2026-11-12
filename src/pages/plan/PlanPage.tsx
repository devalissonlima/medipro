import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { PlanOverview } from "./components/PlanOverview"
import { Badge } from "@/components/ui/badge"

export function PlanPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu plano"
        description="Informações sobre a assinatura do Medipro, recursos disponíveis na sua conta e gerenciamento de faturamento."
        badge={
          <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
            Plano Pro
          </Badge>
        }
      />
      <PlanOverview />
    </PageContainer>
  )
}
