import { useMemo } from "react"
import type { Measurement } from "@/types/measurement"
import type { DashboardMetricsData } from "@/types/dashboard"

export function useDashboardMetrics(measurements: Measurement[]): DashboardMetricsData {
  return useMemo(() => {
    let totalPendingAmount = 0
    let totalApprovedAmount = 0
    let pendingCount = 0
    const activeMembers = new Set<string>()

    measurements.forEach((m) => {
      if (m.status === "pending") {
        totalPendingAmount += m.grandTotal
        pendingCount += 1
      } else if (m.status === "approved") {
        totalApprovedAmount += m.grandTotal
      }

      const memberKey = m.collaboratorId || m.collaboratorName || m.clientName || m.id
      activeMembers.add(memberKey)
    })

    return {
      totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
      totalApprovedAmount: Math.round(totalApprovedAmount * 100) / 100,
      pendingCount,
      activeMembersCount: activeMembers.size,
    }
  }, [measurements])
}
