import { useState, useMemo } from "react"
import { useTeamStore } from "@/stores/teamStore"
import type { MemberStatus } from "@/types/team"

export function useTeamMembers() {
  const {
    members,
    getPlanUsage,
    isInviteModalOpen,
    isLimitDialogOpen,
    editingMember,
    notification,
    openInviteModal,
    openEditModal,
    closeModals,
    deleteMember,
    toggleMemberStatus,
    resendInvite,
    setNotification,
  } = useTeamStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all")

  // Uso do plano e capacidade
  const planUsage = useMemo(() => {
    const usage = getPlanUsage()
    const percentage = Math.min(
      100,
      Math.round((usage.usedLicenses / usage.maxLicenses) * 100)
    )
    const isAtLimit = usage.usedLicenses >= usage.maxLicenses
    const isNearLimit = percentage >= 80

    return {
      ...usage,
      percentage,
      isAtLimit,
      isNearLimit,
    }
  }, [members, getPlanUsage])

  // Filtragem combinada
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filtro de status
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false
      }

      // Busca textual
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchesName = m.name.toLowerCase().includes(query)
        const matchesEmail = m.email.toLowerCase().includes(query)
        const matchesPhone = m.phone.includes(query)
        const matchesRole = m.role.toLowerCase().includes(query)

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesRole) {
          return false
        }
      }

      return true
    })
  }, [members, statusFilter, searchQuery])

  // Contagens por status
  const statusCounts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === "active").length,
      pending_invite: members.filter((m) => m.status === "pending_invite").length,
      inactive: members.filter((m) => m.status === "inactive").length,
    }
  }, [members])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  return {
    members: filteredMembers,
    allMembers: members,
    planUsage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusCounts,
    isInviteModalOpen,
    isLimitDialogOpen,
    editingMember,
    notification,
    openInviteModal,
    openEditModal,
    closeModals,
    deleteMember,
    toggleMemberStatus,
    resendInvite,
    clearFilters,
    dismissNotification: () => setNotification(null),
  }
}
