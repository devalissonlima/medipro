import type {
  MeasurementServiceItem,
  OperationalCosts,
} from "@/types/measurement"

/**
 * Calcula o subtotal de um item individual (Quantidade x Preço Unitário).
 */
export function calculateItemSubtotal(quantity: number, unitPrice: number): number {
  const q = isNaN(quantity) || quantity < 0 ? 0 : quantity
  const p = isNaN(unitPrice) || unitPrice < 0 ? 0 : unitPrice
  return Math.round(q * p * 100) / 100
}

/**
 * Calcula a soma dos subtotais de todos os itens de serviços.
 */
export function calculateServicesTotal(items: MeasurementServiceItem[]): number {
  const sum = items.reduce((acc, item) => acc + (item.subtotal || 0), 0)
  return Math.round(sum * 100) / 100
}

/**
 * Calcula a soma dos custos operacionais de campo.
 */
export function calculateOperationalCostsTotal(costs?: OperationalCosts): number {
  if (!costs) return 0
  const transport = Number(costs.transport) || 0
  const lodging = Number(costs.lodging) || 0
  const food = Number(costs.food) || 0
  const extraSetup = Number(costs.extraSetup) || 0

  const sum = transport + lodging + food + extraSetup
  return Math.round(sum * 100) / 100
}

/**
 * Calcula o valor total final da medição (Serviços + Despesas Operacionais).
 */
export function calculateGrandTotal(servicesTotal: number, costsTotal: number): number {
  return Math.round((servicesTotal + costsTotal) * 100) / 100
}

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (R$).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0)
}

/**
 * Gera um token único e amigável para link de compartilhamento.
 */
export function generateShareableToken(): string {
  const randomStr = Math.random().toString(36).substring(2, 8)
  const timestamp = Date.now().toString(36).substring(4)
  return `med-${timestamp}-${randomStr}`
}
