import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthCredentials, AuthState, User, UserRole } from "@/types/auth"
import { useProjectsStore } from "./projectsStore"
import { useMeasurementsStore } from "./measurementsStore"

function createMockSignatureSvg(signerLabel: string): string {
  const safeLabel = signerLabel.replace(/[<>&"']/g, "")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 76" width="280" height="76"><path d="M18 50 C34 18, 48 14, 52 42 C56 58, 70 22, 88 28 C100 32, 94 50, 110 44 C124 39, 136 20, 150 36 C160 47, 178 24, 200 32 C216 38, 234 26, 258 30" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 58 Q138 46 252 53" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/><text x="140" y="70" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="10.5" fill="#475569">${safeLabel}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

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
    signatureName: "Carlos Mendes",
    signatureUrl: createMockSignatureSvg("Carlos Mendes"),
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
    signatureName: "Marcos Oliveira",
    signatureUrl: createMockSignatureSvg("Marcos Oliveira"),
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
    signatureName: "Lucas Ferraz",
    signatureUrl: createMockSignatureSvg("Lucas Ferraz"),
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
    signatureName: "João Autônomo",
    signatureUrl: createMockSignatureSvg("João Autônomo"),
  },
}

const DEFAULT_MOCK_USER = MOCK_USERS_BY_ROLE.MANAGER

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      customUsersByRole: {},
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

          const savedManager = get().customUsersByRole?.MANAGER
          const baseUser = savedManager || DEFAULT_MOCK_USER
          const resolvedName = savedManager?.name || extractedName || DEFAULT_MOCK_USER.name

          const authenticatedUser: User = {
            ...baseUser,
            name: resolvedName,
            email: formattedEmail,
            signatureName: baseUser.signatureName || resolvedName,
            signatureUrl: baseUser.signatureUrl || createMockSignatureSvg(resolvedName),
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
        const customSaved = get().customUsersByRole?.[role]
        const mockUser = customSaved
          ? { ...MOCK_USERS_BY_ROLE[role], ...customSaved }
          : MOCK_USERS_BY_ROLE[role]
        useProjectsStore.getState().ensureSeedData()
        useMeasurementsStore.getState().ensureSeedData()

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      },

      updateProfile: (data) => {
        set((state) => {
          if (!state.user) return state
          const updatedUser: User = { ...state.user, ...data }
          return {
            user: updatedUser,
            customUsersByRole: {
              ...(state.customUsersByRole || {}),
              [updatedUser.role]: updatedUser,
            },
          }
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
        customUsersByRole: state.customUsersByRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
