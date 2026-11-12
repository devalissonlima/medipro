import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useActivityStore } from "@/stores/activityStore"
import {
  getGreetingByHour,
  formatFullDate,
  isWithinLast24Hours,
} from "@/utils/dateUtils"
import type { DailyPulseSummary, ActivityTab } from "@/types/activity"

export function useHomeOverview() {
  const user = useAuthStore((state) => state.user)
  const { measurements } = useMeasurementsStore()
  const { activities, markAsRead, markAllAsRead } = useActivityStore()

  const [activeTab, setActiveTab] = useState<ActivityTab>("all")

  // Primeiro nome do usuário para saudação
  const firstName = useMemo(() => {
    if (!user?.name) return "Profissional"
    return user.name.trim().split(" ")[0]
  }, [user?.name])

  const greeting = useMemo(() => {
    return `${getGreetingByHour()}, ${firstName}!`
  }, [firstName])

  const formattedDate = useMemo(() => {
    return formatFullDate()
  }, [])

  // Medições pendentes totais (para badge no atalho de dashboard)
  const totalPendingCount = useMemo(() => {
    return measurements.filter((m) => m.status === "pending").length
  }, [measurements])

  // Eventos estritamente dentro das últimas 24h
  const events24h = useMemo(() => {
    return activities.filter((a) => isWithinLast24Hours(a.timestamp))
  }, [activities])

  // Resumo consolidado do Daily Pulse (24h)
  const dailyPulse: DailyPulseSummary = useMemo(() => {
    let createdCount24h = 0
    let createdAmount24h = 0
    let approvedCount24h = 0
    let approvedAmount24h = 0
    let attentionCount = 0

    // Calcula a partir dos eventos nas últimas 24 horas
    events24h.forEach((event) => {
      if (event.type === "measurement_created") {
        createdCount24h += 1
        createdAmount24h += event.amount || 0
      } else if (event.type === "measurement_approved") {
        approvedCount24h += 1
        approvedAmount24h += event.amount || 0
      } else if (event.type === "measurement_rejected") {
        attentionCount += 1
      }
    })

    // Adiciona medições atuais com status rework se houver
    const reworkMeasurements = measurements.filter((m) => m.status === "rework").length
    attentionCount = Math.max(attentionCount, reworkMeasurements)

    return {
      createdCount24h,
      createdAmount24h: Math.round(createdAmount24h * 100) / 100,
      approvedCount24h,
      approvedAmount24h: Math.round(approvedAmount24h * 100) / 100,
      attentionCount,
    }
  }, [events24h, measurements])

  // Contextual Subtitle
  const contextualSubtitle = useMemo(() => {
    if (totalPendingCount === 0 && dailyPulse.attentionCount === 0) {
      return "Tudo em dia! Nenhuma pendência urgente aguardando sua revisão."
    }
    if (totalPendingCount > 0) {
      return `Você tem ${totalPendingCount} ${
        totalPendingCount === 1 ? "medição pendente" : "medições pendentes"
      } para conferência e liquidação.`
    }
    return `Você tem ${dailyPulse.attentionCount} apontamentos que exigem sua atenção.`
  }, [totalPendingCount, dailyPulse.attentionCount])

  // Filtragem da Timeline pelas tabs (Todas, Medições, Equipe)
  const filteredEvents = useMemo(() => {
    return events24h.filter((event) => {
      if (activeTab === "all") return true
      if (activeTab === "measurements") {
        return (
          event.type === "measurement_created" ||
          event.type === "measurement_approved" ||
          event.type === "measurement_rejected"
        )
      }
      if (activeTab === "team") {
        return (
          event.type === "team_member_joined" ||
          event.type === "team_member_left"
        )
      }
      return true
    })
  }, [events24h, activeTab])

  // Contadores para as tabs
  const tabCounts = useMemo(() => {
    return {
      all: events24h.length,
      measurements: events24h.filter(
        (e) =>
          e.type === "measurement_created" ||
          e.type === "measurement_approved" ||
          e.type === "measurement_rejected"
      ).length,
      team: events24h.filter(
        (e) => e.type === "team_member_joined" || e.type === "team_member_left"
      ).length,
    }
  }, [events24h])

  return {
    user,
    greeting,
    formattedDate,
    contextualSubtitle,
    totalPendingCount,
    dailyPulse,
    events: filteredEvents,
    activeTab,
    tabCounts,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  }
}
