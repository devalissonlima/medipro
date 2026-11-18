import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ActivityEvent } from "@/types/activity"

const INITIAL_ACTIVITIES: ActivityEvent[] = []

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
      name: "@medipro:activity-data-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activities: state.activities,
      }),
    }
  )
)
