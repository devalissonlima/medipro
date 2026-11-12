export type ProjectStatus = "active" | "paused" | "completed"

export interface Project {
  id: string
  tenantId: string
  clientId: string
  clientName?: string
  title: string
  description?: string
  address?: string
  startDate?: string
  endDate?: string
  status: ProjectStatus
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
  paused: {
    label: "Pausado",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Concluído",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
}
