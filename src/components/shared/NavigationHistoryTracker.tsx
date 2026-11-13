import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router-dom"
import { useNavigationHistoryStore } from "@/stores/navigationHistoryStore"

export function NavigationHistoryTracker() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const recordNavigation = useNavigationHistoryStore((s) => s.recordNavigation)

  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash
    recordNavigation(fullPath, navigationType)
  }, [location, navigationType, recordNavigation])

  return null
}
