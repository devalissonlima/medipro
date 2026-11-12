import { useAuthStore } from "@/stores/authStore"

export function usePlanData() {
  const user = useAuthStore((state) => state.user)

  const currentPlan = {
    name: user?.plano || "Plano Pro",
    status: "Ativo",
    price: "R$ 149,90/mês",
    renewalDate: "15 de Dezembro de 2026",
    seatsUsed: 12,
    seatsTotal: 25,
  }

  return {
    currentPlan,
  }
}
