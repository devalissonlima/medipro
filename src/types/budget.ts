import type { CatalogItemType } from "./catalog"

export type BudgetStatus = "draft" | "sent" | "approved" | "rejected"
export type BudgetType = "base" | "additive"

export interface BudgetItem {
  id: string
  masterServiceId?: string
  itemType: CatalogItemType // 'labor' | 'material' | 'subcontract'
  environment?: string // ex: 'Cozinha', 'Banheiro Suíte'
  description: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Budget {
  id: string
  code: string // ex: 'ORC-2026-001'
  tenantId: string
  clientId: string
  projectId?: string // Vinculado após conversão ou quando criado como aditivo de uma obra
  budgetType: BudgetType // 'base' (Principal) ou 'additive' (Aditivo de obra)
  title: string
  status: BudgetStatus
  validUntil: string // Data de validade da proposta
  paymentTerms: string // Condições de pagamento (ex: 50% entrada + 50% entrega)
  executionDeadline: string // Prazo estimado (ex: 10 dias úteis)
  termsAndConditions: string
  items: BudgetItem[]
  laborTotal: number
  materialTotal: number
  subcontractTotal: number
  totalAmount: number
  signatureUrl?: string
  signatureName?: string
  createdAt: string
  updatedAt?: string
}

export const BUDGET_STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; badgeClass: string }
> = {
  draft: {
    label: "Rascunho",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  sent: {
    label: "Enviado",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  approved: {
    label: "Aprovado",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  rejected: {
    label: "Recusado",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-300",
  },
}

export const BUDGET_TYPE_CONFIG: Record<
  BudgetType,
  { label: string; badgeClass: string }
> = {
  base: {
    label: "Base",
    badgeClass: "bg-slate-900 text-white border-slate-900",
  },
  additive: {
    label: "Aditivo",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
}
