import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useTeamStore } from "@/stores/teamStore"
import {
  PLAN_LICENSE_LIMITS,
  TEAM_ACCOUNT_TYPE_CONFIG,
  type TeamMemberStatus,
} from "@/types/team"

export function useTeamMembers() {
  const user = useAuthStore((state) => state.user)
  const tenantId = user?.tenantId || "tenant_01"
  const plan = user?.plano || "Plano Pro"

  const {
    members,
    isInviteModalOpen,
    isLimitDialogOpen,
    openInviteModal,
    closeModals,
    deleteMember,
    resendInvite,
  } = useTeamStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | "all">(
    "all"
  )

  const tenantMembers = useMemo(
    () => members.filter((m) => m.tenantId === tenantId),
    [members, tenantId]
  )

  const planUsage = useMemo(() => {
    const usedLicenses = tenantMembers.length
    const maxLicenses = PLAN_LICENSE_LIMITS[plan] ?? 5
    const percentage = Math.min(
      100,
      Math.round((usedLicenses / maxLicenses) * 100)
    )
    const isAtLimit = usedLicenses >= maxLicenses
    const isNearLimit = !isAtLimit && percentage >= 80

    return {
      usedLicenses,
      maxLicenses,
      planName: plan,
      percentage,
      isAtLimit,
      isNearLimit,
    }
  }, [tenantMembers.length, plan])

  const filteredMembers = useMemo(() => {
    return tenantMembers.filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) {
        return false
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const accountLabel =
          TEAM_ACCOUNT_TYPE_CONFIG[member.accountType]?.label.toLowerCase() || ""
        const matchesName = member.name.toLowerCase().includes(query)
        const matchesEmail = member.email.toLowerCase().includes(query)
        const matchesRole = accountLabel.includes(query)

        if (!matchesName && !matchesEmail && !matchesRole) {
          return false
        }
      }

      return true
    })
  }, [tenantMembers, statusFilter, searchQuery])

  const statusCounts = useMemo(() => {
    return {
      all: tenantMembers.length,
      invite_sent: tenantMembers.filter((m) => m.status === "invite_sent").length,
      active: tenantMembers.filter((m) => m.status === "active").length,
    }
  }, [tenantMembers])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  return {
    members: filteredMembers,
    allMembers: tenantMembers,
    planUsage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusCounts,
    isInviteModalOpen,
    isLimitDialogOpen,
    openInviteModal: () => openInviteModal(tenantId, plan),
    closeModals,
    deleteMember,
    resendInvite,
    clearFilters,
  }
}
