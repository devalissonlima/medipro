export type MemberRole =
  | "Instalador de Mármore"
  | "Revestidor"
  | "Acabador"
  | "Marceneiro"
  | "Ajudante Geral"
  | "Outro"

export type MemberStatus = "active" | "pending_invite" | "inactive"

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: MemberRole
  status: MemberStatus
  avatarUrl?: string
  baseRate?: number
  monthlyMeasurementsCount: number
  monthlyTotalBilled: number
  createdAt: string
  lastActive?: string
}

export interface TeamPlanUsage {
  usedLicenses: number
  maxLicenses: number
  planName: string
}

export const MEMBER_ROLE_OPTIONS: MemberRole[] = [
  "Instalador de Mármore",
  "Revestidor",
  "Acabador",
  "Marceneiro",
  "Ajudante Geral",
  "Outro",
]

export const MEMBER_STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; badgeClass: string }
> = {
  active: {
    label: "Ativo",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  pending_invite: {
    label: "Convite Pendente",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  inactive: {
    label: "Inativo / Suspenso",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-300",
  },
}
