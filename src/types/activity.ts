export type ActivityType =
  | "measurement_created"
  | "measurement_approved"
  | "measurement_rejected"
  | "team_member_joined"
  | "team_member_left"

export type ActivityTab = "all" | "measurements" | "team"

export interface ActivityEvent {
  id: string
  type: ActivityType
  actorName: string
  targetTitle: string
  amount?: number
  reason?: string
  targetRoute: string
  timestamp: string // ISO String dentro da janela de 24h
  isRead: boolean
}

export interface DailyPulseSummary {
  createdCount24h: number
  createdAmount24h: number
  approvedCount24h: number
  approvedAmount24h: number
  attentionCount: number
}
