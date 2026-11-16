import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const MAX_RECENT_ITEMS = 5

interface RecentAccessState {
  recentProjectsByUser: Record<string, string[]>
  recentMeasurementsByUser: Record<string, string[]>

  trackProjectView: (projectId: string, userId: string) => void
  trackMeasurementView: (measurementId: string, userId: string) => void
}

export const useRecentAccessStore = create<RecentAccessState>()(
  persist(
    (set) => ({
      recentProjectsByUser: {},
      recentMeasurementsByUser: {},

      trackProjectView: (projectId, userId) => {
        if (!projectId || !userId) return
        set((state) => {
          const currentList = state.recentProjectsByUser[userId] || []
          const nextList = [
            projectId,
            ...currentList.filter((id) => id !== projectId),
          ].slice(0, MAX_RECENT_ITEMS)

          return {
            recentProjectsByUser: {
              ...state.recentProjectsByUser,
              [userId]: nextList,
            },
          }
        })
      },

      trackMeasurementView: (measurementId, userId) => {
        if (!measurementId || !userId) return
        set((state) => {
          const currentList = state.recentMeasurementsByUser[userId] || []
          const nextList = [
            measurementId,
            ...currentList.filter((id) => id !== measurementId),
          ].slice(0, MAX_RECENT_ITEMS)

          return {
            recentMeasurementsByUser: {
              ...state.recentMeasurementsByUser,
              [userId]: nextList,
            },
          }
        })
      },
    }),
    {
      name: "@medipro:recent-access-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
