import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthCredentials, AuthState, User } from "@/types/auth"

const DEFAULT_MOCK_USER: User = {
  id: "usr_mock_001",
  nome: "Carlos Mendes",
  email: "carlos.mendes@medipro.com.br",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  role: "gestor",
  plano: "Plano Pro",
}

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
          // Simula latência de autenticação da API
          await new Promise((resolve) => setTimeout(resolve, 400))

          const formattedEmail = email.trim() || DEFAULT_MOCK_USER.email
          // Extrai o primeiro nome a partir do email se o usuário digitar outro
          const extractedName = formattedEmail.includes("@")
            ? formattedEmail
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : DEFAULT_MOCK_USER.nome

          const authenticatedUser: User = {
            ...DEFAULT_MOCK_USER,
            nome: extractedName || DEFAULT_MOCK_USER.nome,
            email: formattedEmail,
          }

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
      name: "@medipro:auth-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
