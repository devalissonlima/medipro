export type UserRole = "MASTER" | "MANAGER" | "PROJECT_SUPERVISOR" | "MEMBER" | "SOLO"

export type UserPlan = "Plano Pro" | "Plano Básico" | "Plano Enterprise"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
  avatarUrl?: string
  plano?: UserPlan
}

export interface AuthCredentials {
  email: string
  senha?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: AuthCredentials) => Promise<boolean>
  loginAsMockRole: (role: Exclude<UserRole, "MASTER">) => void
  logout: () => void
}
