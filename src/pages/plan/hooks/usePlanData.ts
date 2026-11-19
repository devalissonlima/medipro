import { useAuthStore } from "@/stores/authStore"
import { useTeamStore } from "@/stores/teamStore"

export function usePlanData() {
  const user = useAuthStore((state) => state.user)
  const getPlanUsage = useTeamStore((state) => state.getPlanUsage)

  const usage = getPlanUsage(user?.tenantId || "tenant_01", user?.plano || "Plano Pro")

  const currentPlan = {
    name: usage.planName,
    status: "Ativo",
    price:
      usage.planName === "Plano Enterprise"
        ? "R$ 299,90/mês"
        : usage.planName === "Plano Básico"
        ? "R$ 69,90/mês"
        : "R$ 149,90/mês",
    renewalDate: "15 de Dezembro de 2026",
    seatsUsed: usage.usedLicenses,
    seatsTotal: usage.maxLicenses,
  }

  return {
    currentPlan,
  }
}
