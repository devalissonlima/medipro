import type { UserPlan } from "./auth"

export type TeamAccountType = "PROJECT_SUPERVISOR" | "MEMBER"

export type TeamMemberStatus = "invite_sent" | "active"

export const PLAN_LICENSE_LIMITS: Record<UserPlan, number> = {
  "Plano Básico": 3,
  "Plano Pro": 5,
  "Plano Enterprise": 25,
}

export interface TeamMember {
  id: string
  tenantId: string
  name: string
  email: string
  accountType: TeamAccountType
  status: TeamMemberStatus
  avatarUrl?: string
  invitedAt: string
  activatedAt?: string
  createdAt: string
}

export interface TeamMemberCreateInput {
  name: string
  email: string
  accountType: TeamAccountType
}

export interface TeamPlanUsage {
  usedLicenses: number
  maxLicenses: number
  planName: UserPlan
}

export const TEAM_ACCOUNT_TYPE_OPTIONS: TeamAccountType[] = [
  "PROJECT_SUPERVISOR",
  "MEMBER",
]

export const TEAM_ACCOUNT_TYPE_CONFIG: Record<
  TeamAccountType,
  { label: string; shortDescription: string; badgeClass: string }
> = {
  PROJECT_SUPERVISOR: {
    label: "Supervisor",
    shortDescription:
      "Gerencia obras alocadas, cria rascunhos de orçamento e fiscaliza medições da equipe.",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  MEMBER: {
    label: "Membro",
    shortDescription:
      "Acessa os projetos vinculados e realiza apontamentos de medições em campo.",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
}

export const TEAM_MEMBER_STATUS_CONFIG: Record<
  TeamMemberStatus,
  { label: string; badgeClass: string }
> = {
  invite_sent: {
    label: "Convite Enviado",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  active: {
    label: "Ativo",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
}
