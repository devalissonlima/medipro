export type MeasurementStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "rework"

export type ExceededReason =
  | "client_additive"
  | "third_party_rework"
  | "measurement_difference"
  | "internal_error"

export type AuditStatus = "not_required" | "pending" | "approved" | "rejected"

export const EXCEEDED_REASON_LABELS: Record<ExceededReason, string> = {
  client_additive: "Aditivo solicitado pelo cliente",
  third_party_rework: "Retrabalho por erro de terceiros",
  measurement_difference: "Diferença de medida em obra",
  internal_error: "Ajuste / Erro interno",
}

export const AUDIT_STATUS_LABELS: Record<
  AuditStatus,
  { label: string; badgeClass: string }
> = {
  not_required: {
    label: "No Escopo",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending: {
    label: "Auditoria Pendente",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  approved: {
    label: "Excedente Aprovado",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  rejected: {
    label: "Excedente Rejeitado",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
  },
}

export interface MeasurementServiceItem {
  id: string
  masterServiceId?: string
  serviceId: string
  serviceName: string
  environment?: string
  materialName?: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
  // Novos campos de controle e auditoria
  isOutOfScope: boolean
  isExceeded: boolean
  exceededQuantity?: number
  exceededReason?: ExceededReason
  justificationNotes?: string
  evidencePhotoUrl?: string
  auditStatus: AuditStatus
}

export interface OperationalCosts {
  transport?: number
  lodging?: number
  food?: number
  extraSetup?: number
  notes?: string
}

export interface Measurement {
  id: string
  title: string
  date: string
  location?: string
  clientId?: string
  clientName?: string
  projectId?: string
  projectTitle?: string
  isTeamContext: boolean
  leaderId?: string
  collaboratorId?: string
  collaboratorName?: string
  collaboratorAvatar?: string
  items: MeasurementServiceItem[]
  operationalCosts?: OperationalCosts
  servicesTotal: number
  costsTotal: number
  grandTotal: number
  status: MeasurementStatus
  reworkNote?: string
  shareableUrlToken: string
  createdAt: string
  updatedAt?: string
}

export const MEASUREMENT_STATUS_CONFIG: Record<
  MeasurementStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    badgeClass: string
  }
> = {
  draft: {
    label: "Rascunho",
    variant: "outline",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  pending: {
    label: "Pendente",
    variant: "secondary",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  approved: {
    label: "Aprovado",
    variant: "default",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  rejected: {
    label: "Rejeitado",
    variant: "destructive",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
  },
  rework: {
    label: "Ajustar",
    variant: "outline",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-300",
  },
}
