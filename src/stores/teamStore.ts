import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"
import type { UserPlan } from "@/types/auth"
import {
  PLAN_LICENSE_LIMITS,
  type TeamMember,
  type TeamMemberCreateInput,
  type TeamPlanUsage,
} from "@/types/team"

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "colab-001",
    tenantId: "tenant_01",
    name: "Marcos Oliveira",
    email: "marcos.oliveira@medipro.com.br",
    accountType: "PROJECT_SUPERVISOR",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    invitedAt: "2026-10-01T10:00:00Z",
    activatedAt: "2026-10-01T10:15:00Z",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "colab-002",
    tenantId: "tenant_01",
    name: "Lucas Ferraz",
    email: "lucas.ferraz@medipro.com.br",
    accountType: "MEMBER",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    invitedAt: "2026-10-05T09:30:00Z",
    activatedAt: "2026-10-05T09:42:00Z",
    createdAt: "2026-10-05T09:30:00Z",
  },
  {
    id: "colab-003",
    tenantId: "tenant_01",
    name: "Tiago Santos",
    email: "tiago.santos@medipro.com.br",
    accountType: "MEMBER",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    invitedAt: "2026-10-20T11:00:00Z",
    activatedAt: "2026-10-20T11:18:00Z",
    createdAt: "2026-10-20T11:00:00Z",
  },
  {
    id: "colab-004",
    tenantId: "tenant_01",
    name: "Rafael Silveira",
    email: "rafael.silveira@medipro.com.br",
    accountType: "MEMBER",
    status: "invite_sent",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    invitedAt: "2026-11-18T16:00:00Z",
    createdAt: "2026-11-18T16:00:00Z",
  },
]

interface TeamState {
  members: TeamMember[]
  isInviteModalOpen: boolean
  isLimitDialogOpen: boolean

  getPlanUsage: (tenantId?: string, plan?: UserPlan) => TeamPlanUsage
  openInviteModal: (tenantId?: string, plan?: UserPlan) => void
  closeModals: () => void
  createMemberInvite: (
    data: TeamMemberCreateInput,
    tenantId: string,
    plan?: UserPlan
  ) => { success: boolean; error?: string }
  resendInvite: (id: string) => void
  deleteMember: (id: string) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: INITIAL_MEMBERS,
      isInviteModalOpen: false,
      isLimitDialogOpen: false,

      getPlanUsage: (tenantId = "tenant_01", plan = "Plano Pro") => {
        const tenantMembers = get().members.filter(
          (m) => m.tenantId === tenantId
        )
        const maxLicenses = PLAN_LICENSE_LIMITS[plan] ?? 5
        return {
          usedLicenses: tenantMembers.length,
          maxLicenses,
          planName: plan,
        }
      },

      openInviteModal: (tenantId = "tenant_01", plan = "Plano Pro") => {
        const { usedLicenses, maxLicenses } = get().getPlanUsage(tenantId, plan)
        if (usedLicenses >= maxLicenses) {
          set({ isLimitDialogOpen: true, isInviteModalOpen: false })
        } else {
          set({ isInviteModalOpen: true, isLimitDialogOpen: false })
        }
      },

      closeModals: () => {
        set({
          isInviteModalOpen: false,
          isLimitDialogOpen: false,
        })
      },

      createMemberInvite: (data, tenantId, plan = "Plano Pro") => {
        const { usedLicenses, maxLicenses } = get().getPlanUsage(tenantId, plan)
        if (usedLicenses >= maxLicenses) {
          set({ isLimitDialogOpen: true, isInviteModalOpen: false })
          return {
            success: false,
            error: "Limite de licenças do plano atingido.",
          }
        }

        const normalizedEmail = data.email.trim().toLowerCase()
        const duplicate = get().members.some(
          (m) =>
            m.tenantId === tenantId &&
            m.email.toLowerCase() === normalizedEmail
        )
        if (duplicate) {
          return {
            success: false,
            error: "Já existe um membro cadastrado ou convidado com este e-mail.",
          }
        }

        const now = new Date().toISOString()
        const newMember: TeamMember = {
          id: `colab-${Date.now().toString(36)}`,
          tenantId,
          name: data.name.trim(),
          email: normalizedEmail,
          accountType: data.accountType,
          status: "invite_sent",
          invitedAt: now,
          createdAt: now,
        }

        set((state) => ({
          members: [newMember, ...state.members],
          isInviteModalOpen: false,
        }))

        toast({
          title: "Convite Enviado",
          description: `${newMember.name} foi adicionado à lista. As credenciais temporárias e o código MFA serão enviados para ${newMember.email}.`,
          variant: "success",
        })

        return { success: true }
      },

      resendInvite: (id) => {
        const member = get().members.find((m) => m.id === id)
        if (!member) return

        const now = new Date().toISOString()
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, invitedAt: now } : m
          ),
        }))

        toast({
          title: "Convite Reenviado",
          description: `Um novo e-mail com senha temporária e código MFA foi disparado para ${member.email}.`,
          variant: "success",
        })
      },

      deleteMember: (id) => {
        const member = get().members.find((m) => m.id === id)
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }))

        toast({
          title: "Membro Removido",
          description: member
            ? `${member.name} foi excluído da equipe e a vaga do plano foi liberada.`
            : "Membro removido da equipe.",
          variant: "destructive",
        })
      },
    }),
    {
      name: "@medipro:team-data-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        members: state.members,
      }),
    }
  )
)
