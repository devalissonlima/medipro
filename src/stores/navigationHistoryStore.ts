import { create } from "zustand"

interface NavigationHistoryState {
  stack: string[]
  recordNavigation: (path: string, actionType: "PUSH" | "POP" | "REPLACE") => void
  getPreviousPath: () => string | null
  clearOnLogin: () => void
}

export const useNavigationHistoryStore = create<NavigationHistoryState>((set, get) => ({
  stack: [],

  recordNavigation: (path: string, actionType: "PUSH" | "POP" | "REPLACE") => {
    // Clean hash prefix if any (e.g. from HashRouter)
    const cleanPath = path.replace(/^#/, "")

    set((state) => {
      const currentStack = state.stack
      const top = currentStack[currentStack.length - 1]

      // Ignore consecutive duplicates
      if (top === cleanPath) {
        return state
      }

      if (actionType === "PUSH") {
        return { stack: [...currentStack, cleanPath] }
      }

      if (actionType === "REPLACE") {
        if (currentStack.length === 0) {
          return { stack: [cleanPath] }
        }
        return { stack: [...currentStack.slice(0, -1), cleanPath] }
      }

      if (actionType === "POP") {
        if (currentStack.length > 1) {
          return { stack: currentStack.slice(0, -1) }
        }
        return { stack: [cleanPath] }
      }

      return state
    })
  },

  getPreviousPath: () => {
    const { stack } = get()
    if (stack.length >= 2) {
      return stack[stack.length - 2]
    }
    return null
  },

  clearOnLogin: () => {
    set({ stack: ["/"] })
  },
}))
