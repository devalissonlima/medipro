export type MeasurementStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "rework"

export interface MeasurementServiceItem {
  id: string
  serviceId: string
  serviceName: string
  materialName?: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
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
