import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthCredentials, AuthState, User, UserRole } from "@/types/auth"
import { useProjectsStore } from "./projectsStore"
import { useMeasurementsStore } from "./measurementsStore"

export const MOCK_USERS_BY_ROLE: Record<Exclude<UserRole, "MASTER">, User> = {
  MANAGER: {
    id: "usr_manager_001",
    name: "Carlos Mendes",
    email: "carlos.mendes@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    role: "MANAGER",
    tenantId: "tenant_01",
    plano: "Plano Pro",
  },
  PROJECT_SUPERVISOR: {
    id: "usr_supervisor_001",
    name: "Marcos Oliveira",
    email: "marcos.oliveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "PROJECT_SUPERVISOR",
    tenantId: "tenant_01",
    plano: "Plano Pro",
  },
  MEMBER: {
    id: "usr_member_001",
    name: "Lucas Ferraz",
    email: "lucas.ferraz@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "MEMBER",
    tenantId: "tenant_01",
    plano: "Plano Pro",
  },
  SOLO: {
    id: "usr_solo_001",
    name: "João Autônomo",
    email: "joao.silva@autonomo.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    role: "SOLO",
    tenantId: "tenant_solo_01",
    plano: "Plano Básico",
  },
}

const DEFAULT_MOCK_USER = MOCK_USERS_BY_ROLE.MANAGER

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async ({ email }: AuthCredentials) => {
        set({ isLoading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 400))

          const formattedEmail = email.trim() || DEFAULT_MOCK_USER.email
          const extractedName = formattedEmail.includes("@")
            ? formattedEmail
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : DEFAULT_MOCK_USER.name

          const authenticatedUser: User = {
            ...DEFAULT_MOCK_USER,
            name: extractedName || DEFAULT_MOCK_USER.name,
            email: formattedEmail,
          }

          useProjectsStore.getState().ensureSeedData()
          useMeasurementsStore.getState().ensureSeedData()

          set({
            user: authenticatedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch {
          set({
            error: "Falha ao realizar login. Tente novamente.",
            isLoading: false,
          })
          return false
        }
      },

      loginAsMockRole: (role) => {
        const mockUser = MOCK_USERS_BY_ROLE[role]
        useProjectsStore.getState().ensureSeedData()
        useMeasurementsStore.getState().ensureSeedData()

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: "@medipro:auth-state-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
