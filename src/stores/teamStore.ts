import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { TeamMember, TeamPlanUsage } from "@/types/team"

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "colab-001",
    name: "Lucas Ferraz",
    email: "lucas.ferraz@medipro.com.br",
    phone: "(11) 98765-4321",
    role: "Instalador de Mármore",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    baseRate: 150.0,
    monthlyMeasurementsCount: 6,
    monthlyTotalBilled: 7133.5,
    createdAt: "2026-10-01T10:00:00Z",
    lastActive: "Hoje às 14:32",
  },
  {
    id: "colab-002",
    name: "Marcos Oliveira",
    email: "marcos.oliveira@medipro.com.br",
    phone: "(11) 99123-4567",
    role: "Acabador",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    baseRate: 120.0,
    monthlyMeasurementsCount: 4,
    monthlyTotalBilled: 4430.0,
    createdAt: "2026-10-15T09:30:00Z",
    lastActive: "Ontem às 18:20",
  },
  {
    id: "colab-003",
    name: "Tiago Santos",
    email: "tiago.santos@medipro.com.br",
    phone: "(11) 97654-3210",
    role: "Revestidor",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    baseRate: 130.0,
    monthlyMeasurementsCount: 5,
    monthlyTotalBilled: 5261.0,
    createdAt: "2026-10-20T11:00:00Z",
    lastActive: "Hoje às 11:15",
  },
  {
    id: "colab-004",
    name: "Rafael Silveira",
    email: "rafael.silveira@medipro.com.br",
    phone: "(19) 98877-1122",
    role: "Marceneiro",
    status: "pending_invite",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    baseRate: 140.0,
    monthlyMeasurementsCount: 1,
    monthlyTotalBilled: 608.0,
    createdAt: "2026-11-04T16:00:00Z",
    lastActive: "Aguardando ativação",
  },
]

interface TeamState {
  members: TeamMember[]
  maxLicenses: number
  planName: string
  isInviteModalOpen: boolean
  isLimitDialogOpen: boolean
  editingMember: TeamMember | null
  notification: { message: string; type: "success" | "info" | "error" } | null

  // Ações
  getPlanUsage: () => TeamPlanUsage
  openInviteModal: () => void
  openEditModal: (member: TeamMember) => void
  closeModals: () => void
  addMember: (
    data: Omit<
      TeamMember,
      "id" | "monthlyMeasurementsCount" | "monthlyTotalBilled" | "createdAt"
    >
  ) => boolean
  updateMember: (id: string, data: Partial<TeamMember>) => void
  deleteMember: (id: string) => void
  toggleMemberStatus: (id: string) => void
  resendInvite: (id: string) => void
  setNotification: (
    notification: { message: string; type: "success" | "info" | "error" } | null
  ) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: INITIAL_MEMBERS,
      maxLicenses: 5,
      planName: "Plano Pro",
      isInviteModalOpen: false,
      isLimitDialogOpen: false,
      editingMember: null,
      notification: null,

      getPlanUsage: () => {
        const { members, maxLicenses, planName } = get()
        // Licenças ocupadas = colaboradores ativos ou com convite pendente
        const usedLicenses = members.filter((m) => m.status !== "inactive").length
        return {
          usedLicenses,
          maxLicenses,
          planName,
        }
      },

      openInviteModal: () => {
        const { usedLicenses, maxLicenses } = get().getPlanUsage()
        if (usedLicenses >= maxLicenses) {
          // Limite do plano atingido -> abre modal de upsell
          set({ isLimitDialogOpen: true, isInviteModalOpen: false, editingMember: null })
        } else {
          set({ isInviteModalOpen: true, isLimitDialogOpen: false, editingMember: null })
        }
      },

      openEditModal: (member) => {
        set({
          isInviteModalOpen: true,
          isLimitDialogOpen: false,
          editingMember: member,
        })
      },

      closeModals: () => {
        set({
          isInviteModalOpen: false,
          isLimitDialogOpen: false,
          editingMember: null,
        })
      },

      addMember: (data) => {
        const { usedLicenses, maxLicenses } = get().getPlanUsage()
        if (usedLicenses >= maxLicenses) {
          set({ isLimitDialogOpen: true, isInviteModalOpen: false })
          return false
        }

        const now = new Date().toISOString()
        const newMember: TeamMember = {
          ...data,
          id: `colab-${Date.now().toString(36)}`,
          status: "pending_invite",
          monthlyMeasurementsCount: 0,
          monthlyTotalBilled: 0,
          createdAt: now,
          lastActive: "Aguardando ativação",
        }

        set((state) => ({
          members: [newMember, ...state.members],
          isInviteModalOpen: false,
          notification: {
            message: `Convite enviado com sucesso para ${newMember.name}!`,
            type: "success",
          },
        }))

        return true
      },

      updateMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
          isInviteModalOpen: false,
          editingMember: null,
          notification: {
            message: "Dados do colaborador atualizados!",
            type: "success",
          },
        }))
      },

      deleteMember: (id) => {
        const member = get().members.find((m) => m.id === id)
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          notification: {
            message: member
              ? `${member.name} foi removido da equipe.`
              : "Colaborador removido da equipe.",
            type: "info",
          },
        }))
      },

      toggleMemberStatus: (id) => {
        const member = get().members.find((m) => m.id === id)
        if (!member) return

        const newStatus = member.status === "inactive" ? "active" : "inactive"

        // Se estiver ativando, checar se há licença disponível
        if (newStatus === "active") {
          const { usedLicenses, maxLicenses } = get().getPlanUsage()
          if (usedLicenses >= maxLicenses) {
            set({
              isLimitDialogOpen: true,
              notification: {
                message: "Limite de licenças atingido. Faça upgrade para reativar este membro.",
                type: "error",
              },
            })
            return
          }
        }

        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, status: newStatus } : m
          ),
          notification: {
            message:
              newStatus === "active"
                ? `Acesso de ${member.name} reativado.`
                : `Acesso de ${member.name} suspenso (licença liberada).`,
            type: "info",
          },
        }))
      },

      resendInvite: (id) => {
        const member = get().members.find((m) => m.id === id)
        if (!member) return

        set({
          notification: {
            message: `Link de acesso reenviado para ${member.phone}!`,
            type: "success",
          },
        })
      },

      setNotification: (notification) => set({ notification }),
    }),
    {
      name: "@medipro:team-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        members: state.members,
      }),
    }
  )
)
