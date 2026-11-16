export type ProjectStatus = "active" | "planning" | "paused" | "completed"

export type BillingCondition = "weekly" | "biweekly" | "by_stage" | "on_completion"

export interface ProjectFolder {
  id: string
  tenantId: string
  name: string
  color?: string // Cor identificadora opcional (ex: azul, verde, âmbar, roxo)
  createdAt: string
}

export interface ProjectScopeItem {
  id: string
  projectId: string
  masterServiceId: string
  serviceName: string
  environment?: string // ex: 'Cozinha', 'Banheiro Suíte'
  unit: string
  maxQuantity: number
  executedQuantity: number // Soma das medições já aprovadas/registradas
}

export interface Project {
  id: string
  tenantId: string
  folderId?: string | null
  clientId: string
  clientName?: string
  title: string
  description?: string
  address?: string
  startDate?: string
  endDate?: string
  status: ProjectStatus

  // Dados Financeiros e Comerciais
  budgetedAmount?: number // Valor Total Orçado/Fechado (R$)
  laborCostCap?: number // Teto de Custo de Mão de Obra estimado (R$)
  billingCondition?: BillingCondition // Condição de faturamento

  // Escopo e Metragem
  totalAreaExpected?: number // Metragem Total Prevista
  areaUnit?: string // ex: 'm²', 'm linear', 'unidade'
  materialsInvolved?: string // Principais Materiais envolvidos
  accessRules?: string // Observações / Regras de acesso ao local
  scopeItems?: ProjectScopeItem[] // Escopo Previsto / Planilha de Quantidades

  maxMembers: number // Limite de vagas herdado automaticamente do Plano do Tenant
  createdAt: string
  updatedAt?: string
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  userName: string
  userEmail?: string
  avatarUrl?: string
  projectRole: "PROJECT_SUPERVISOR" | "MEMBER"
  specialtyTag: string // ex: 'Marceneiro', 'Instalador de Mármore'
  status: "active" | "inactive"
}

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; badgeClass: string }
> = {
  active: {
    label: "Em andamento",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  planning: {
    label: "Planejamento",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  paused: {
    label: "Pausado",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Concluído",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
}
