import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ActivityEvent } from "@/types/activity"

const nowMs = Date.now()
const minuteMs = 60 * 1000
const hourMs = 60 * minuteMs

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-001",
    type: "measurement_created",
    actorName: "Lucas Ferraz",
    targetTitle: "Assentamento Área Gourmet & Piscina",
    amount: 4409.0,
    targetRoute: "/dashboard",
    timestamp: new Date(nowMs - 20 * minuteMs).toISOString(),
    isRead: false,
  },
  {
    id: "act-002",
    type: "measurement_approved",
    actorName: "Carlos Mendes (Gestor)",
    targetTitle: "Instalação Cozinha Ilha & Gourmet - Apto 82",
    amount: 2724.5,
    targetRoute: "/medicoes",
    timestamp: new Date(nowMs - 90 * minuteMs).toISOString(),
    isRead: false,
  },
  {
    id: "act-003",
    type: "team_member_joined",
    actorName: "Rafael Silveira",
    targetTitle: "Entrou para a equipe como Marceneiro",
    targetRoute: "/equipe",
    timestamp: new Date(nowMs - 3.5 * hourMs).toISOString(),
    isRead: false,
  },
  {
    id: "act-004",
    type: "measurement_created",
    actorName: "Tiago Santos",
    targetTitle: "Revestimento Suíte Master & Nichos",
    amount: 3129.0,
    targetRoute: "/dashboard",
    timestamp: new Date(nowMs - 6 * hourMs).toISOString(),
    isRead: true,
  },
  {
    id: "act-005",
    type: "measurement_rejected",
    actorName: "Carlos Mendes (Gestor)",
    targetTitle: "Polimento & Bancadas Hall de Entrada",
    amount: 2490.0,
    reason: "Favor anexar nota fiscal do hotel e reconfirmar metragem do balcão.",
    targetRoute: "/dashboard",
    timestamp: new Date(nowMs - 12 * hourMs).toISOString(),
    isRead: true,
  },
  {
    id: "act-006",
    type: "measurement_approved",
    actorName: "Carlos Mendes (Gestor)",
    targetTitle: "Bancadas Lavabo & Espelho Iluminado",
    amount: 608.0,
    targetRoute: "/medicoes",
    timestamp: new Date(nowMs - 18 * hourMs).toISOString(),
    isRead: true,
  },
  {
    id: "act-007",
    type: "team_member_left",
    actorName: "Gestão de Equipe",
    targetTitle: "Acesso de Marcos Silva pausado temporariamente",
    targetRoute: "/equipe",
    timestamp: new Date(nowMs - 22 * hourMs).toISOString(),
    isRead: true,
  },
]

interface ActivityState {
  activities: ActivityEvent[]
  addActivity: (
    event: Omit<ActivityEvent, "id" | "timestamp" | "isRead"> & {
      timestamp?: string
    }
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: INITIAL_ACTIVITIES,

      addActivity: (event) => {
        const newEvent: ActivityEvent = {
          ...event,
          id: `act-${Date.now().toString(36)}`,
          timestamp: event.timestamp || new Date().toISOString(),
          isRead: false,
        }

        set((state) => ({
          activities: [newEvent, ...state.activities],
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, isRead: true } : a
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          activities: state.activities.map((a) => ({ ...a, isRead: true })),
        }))
      },
    }),
    {
      name: "@medipro:activity-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activities: state.activities,
      }),
    }
  )
)
