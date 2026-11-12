export type UserRole = "gestor" | "prestador" | "autonomo" | "admin"

export type UserPlan = "Plano Pro" | "Plano Básico" | "Plano Enterprise"

export interface User {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  role: UserRole
  plano: UserPlan
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
  logout: () => void
}
