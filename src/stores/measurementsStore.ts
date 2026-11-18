import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Measurement, MeasurementStatus } from "@/types/measurement"
import { generateShareableToken } from "@/utils/calculations"
import { toast } from "@/components/ui/use-toast"

export const INITIAL_MEASUREMENTS: Measurement[] = []

interface MeasurementsState {
  measurements: Measurement[]
  searchTerm: string
  statusFilter: MeasurementStatus | "all"
  selectedMeasurement: Measurement | null
  shareModalMeasurement: Measurement | null
  notification: { message: string; type: "success" | "info" | "error" } | null

  // Ações
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: MeasurementStatus | "all") => void
  addMeasurement: (
    measurement: Omit<Measurement, "id" | "shareableUrlToken" | "createdAt">
  ) => Measurement
  updateMeasurement: (id: string, data: Partial<Measurement>) => void
  deleteMeasurement: (id: string) => void
  duplicateMeasurement: (id: string) => Measurement | null
  updateStatus: (id: string, status: MeasurementStatus, reworkNote?: string) => void
  updateItemAuditStatus: (
    measurementId: string,
    itemId: string,
    auditStatus: "approved" | "rejected"
  ) => void
  bulkApprove: (ids: string[]) => void
  openDetailModal: (measurement: Measurement) => void
  closeDetailModal: () => void
  openShareModal: (measurement: Measurement) => void
  closeShareModal: () => void
  setNotification: (
    notification: { message: string; type: "success" | "info" | "error" } | null
  ) => void
  ensureSeedData: () => void
}

export const useMeasurementsStore = create<MeasurementsState>()(
  persist(
    (set, get) => ({
      measurements: INITIAL_MEASUREMENTS,
      searchTerm: "",
      statusFilter: "all",
      selectedMeasurement: null,
      shareModalMeasurement: null,
      notification: null,

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),

      addMeasurement: (data) => {
        const now = new Date().toISOString()
        const newMeasurement: Measurement = {
          ...data,
          id: `med-${Date.now().toString(36)}`,
          shareableUrlToken: generateShareableToken(),
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          measurements: [newMeasurement, ...state.measurements],
          notification: {
            message: `Medição "${newMeasurement.title}" registrada com sucesso!`,
            type: "success",
          },
        }))

        return newMeasurement
      },

      updateMeasurement: (id, data) => {
        set((state) => ({
          measurements: state.measurements.map((m) =>
            m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
          ),
          notification: {
            message: "Medição atualizada com sucesso!",
            type: "success",
          },
        }))
      },

      deleteMeasurement: (id) => {
        const item = get().measurements.find((m) => m.id === id)
        const msg = item
          ? `Medição "${item.title}" foi excluída.`
          : "Medição excluída com sucesso."
        toast({
          title: "Medição Excluída",
          description: msg,
          variant: "destructive",
        })
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
          selectedMeasurement:
            state.selectedMeasurement?.id === id ? null : state.selectedMeasurement,
          notification: {
            message: msg,
            type: "info",
          },
        }))
      },

      duplicateMeasurement: (id) => {
        const original = get().measurements.find((m) => m.id === id)
        if (!original) return null

        const duplicated: Measurement = {
          ...original,
          id: `med-${Date.now().toString(36)}`,
          title: `${original.title} (Cópia)`,
          status: "pending",
          shareableUrlToken: generateShareableToken(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        toast({
          title: "Medição Duplicada",
          description: `Medição duplicada como "${duplicated.title}".`,
          variant: "success",
        })

        set((state) => ({
          measurements: [duplicated, ...state.measurements],
          notification: {
            message: `Medição duplicada como "${duplicated.title}".`,
            type: "success",
          },
        }))

        return duplicated
      },

      updateStatus: (id, status, reworkNote) => {
        const item = get().measurements.find((m) => m.id === id)
        const msg =
          status === "approved"
            ? `Medição "${item?.title || id}" aprovada com sucesso!`
            : status === "rework"
            ? `Revisão solicitada para "${item?.title || id}".`
            : status === "pending"
            ? `Medição "${item?.title || id}" enviada para conferência com sucesso!`
            : `Status da medição atualizado para "${status}".`

        toast({
          title: status === "approved" || status === "pending" ? "Sucesso" : "Atualização",
          description: msg,
          variant: status === "approved" || status === "pending" ? "success" : "info",
        })

        set((state) => ({
          measurements: state.measurements.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  reworkNote: reworkNote !== undefined ? reworkNote : m.reworkNote,
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
          notification: {
            message: msg,
            type: status === "approved" || status === "pending" ? "success" : "info",
          },
        }))
      },

      updateItemAuditStatus: (measurementId, itemId, auditStatus) => {
        set((state) => ({
          measurements: state.measurements.map((m) => {
            if (m.id !== measurementId) return m
            return {
              ...m,
              items: m.items.map((item) =>
                item.id === itemId ? { ...item, auditStatus } : item
              ),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))

        toast({
          title: auditStatus === "approved" ? "Item Aprovado" : "Item Rejeitado",
          description: `O item foi marcado como ${auditStatus === "approved" ? "Aprovado para pagamento" : "Rejeitado na auditoria"}.`,
          variant: auditStatus === "approved" ? "success" : "destructive",
        })
      },

      bulkApprove: (ids: string[]) => {
        const idSet = new Set(ids)
        const now = new Date().toISOString()
        const msg = `${ids.length} medições aprovadas em lote com sucesso!`
        toast({
          title: "Aprovação em Lote",
          description: msg,
          variant: "success",
        })
        set((state) => ({
          measurements: state.measurements.map((m) =>
            idSet.has(m.id) ? { ...m, status: "approved", updatedAt: now } : m
          ),
          notification: {
            message: msg,
            type: "success",
          },
        }))
      },

      openDetailModal: (measurement) => set({ selectedMeasurement: measurement }),
      closeDetailModal: () => set({ selectedMeasurement: null }),

      openShareModal: (measurement) => set({ shareModalMeasurement: measurement }),
      closeShareModal: () => set({ shareModalMeasurement: null }),

      setNotification: (notification) => {
        set({ notification })
        if (notification) {
          toast({
            title:
              notification.type === "success"
                ? "Sucesso"
                : notification.type === "error"
                ? "Atenção"
                : "Notificação",
            description: notification.message,
            variant:
              notification.type === "error"
                ? "destructive"
                : notification.type === "success"
                ? "success"
                : "info",
          })
        }
      },

      ensureSeedData: () => {},
    }),
    {
      name: "@medipro:measurements-data-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        measurements: state.measurements,
      }),
    }
  )
)
