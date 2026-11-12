import type { MeasurementStatus } from "./measurement"

export interface DashboardMetricsData {
  totalPendingAmount: number
  totalApprovedAmount: number
  pendingCount: number
  activeMembersCount: number
}

export type DashboardPeriod = "today" | "week" | "month" | "all"

export interface DashboardFilterState {
  period: DashboardPeriod
  memberId: string | "all"
  searchQuery: string
  statusFilter: MeasurementStatus | "all"
}

export interface TeamCollaborator {
  id: string
  name: string
  role: string
  avatarUrl: string
}

export const MOCK_TEAM_COLLABORATORS: TeamCollaborator[] = [
  {
    id: "usr_member_001",
    name: "Lucas Ferraz",
    role: "Instalador Sênior (Mármores)",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_supervisor_001",
    name: "Marcos Oliveira",
    role: "Encarregado de Obra",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_member_002",
    name: "Tiago Santos",
    role: "Especialista em Porcelanatos & Lastras",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_member_004",
    name: "Rafael Silveira",
    role: "Marceneiro & Montador",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
]
