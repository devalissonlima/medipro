import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Measurement, MeasurementStatus } from "@/types/measurement"
import { generateShareableToken } from "@/utils/calculations"

export const INITIAL_MEASUREMENTS: Measurement[] = [
  {
    id: "med-001",
    title: "Instalação Cozinha Ilha & Gourmet - Apto 82",
    date: "2026-11-10",
    location: "Residencial Alphaville Zero - Santana de Parnaíba/SP",
    clientId: "cli-001",
    clientName: "Dr. Roberto Martins",
    projectId: "proj-001",
    projectTitle: "Residencial Alphaville Zero - Cozinha & Gourmet",
    collaboratorId: "usr_member_001",
    collaboratorName: "Lucas Ferraz",
    collaboratorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isTeamContext: true,
    leaderId: "usr_manager_001",
    items: [
      {
        id: "item-101",
        serviceId: "srv-001",
        serviceName: "Assentamento de Mármore Travertino",
        materialName: "Mármore Travertino Navona Bruto",
        unit: "m²",
        quantity: 8.5,
        unitPrice: 155.0,
        subtotal: 1317.5,
      },
      {
        id: "item-102",
        serviceId: "srv-002",
        serviceName: "Corte em Meia Esquadria 45°",
        materialName: "Borda Ilha 4cm sobreposta",
        unit: "m linear",
        quantity: 11.2,
        unitPrice: 85.0,
        subtotal: 952.0,
      },
      {
        id: "item-103",
        serviceId: "srv-003",
        serviceName: "Furação e Recorte de Cuba Esculpida",
        materialName: "Cuba Dupla Inox Franke",
        unit: "unidade",
        quantity: 2,
        unitPrice: 130.0,
        subtotal: 260.0,
      },
    ],
    operationalCosts: {
      transport: 120.0,
      food: 75.0,
      notes: "Deslocamento de pedágios e combustível para 2 dias de montagem.",
    },
    servicesTotal: 2529.5,
    costsTotal: 195.0,
    grandTotal: 2724.5,
    status: "approved",
    shareableUrlToken: "med-nov26-cozinha82",
    createdAt: "2026-11-10T14:30:00Z",
  },
  {
    id: "med-002",
    title: "Revestimento Suíte Master & Nichos",
    date: "2026-11-11",
    location: "Condomínio Tamboré 10 - Casa 42",
    clientId: "cli-002",
    clientName: "Arq. Camila Vasconcellos",
    projectId: "proj-002",
    projectTitle: "Condomínio Tamboré 10 - Suíte Master",
    collaboratorId: "usr_member_002",
    collaboratorName: "Tiago Santos",
    collaboratorAvatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    isTeamContext: true,
    leaderId: "usr_manager_001",
    items: [
      {
        id: "item-201",
        serviceId: "srv-006",
        serviceName: "Revestimento Porcelanato Grandes Formatos",
        materialName: "Lastra Portobello 120x270 Calacatta",
        unit: "m²",
        quantity: 16.4,
        unitPrice: 130.0,
        subtotal: 2132.0,
      },
      {
        id: "item-202",
        serviceId: "srv-002",
        serviceName: "Corte em Meia Esquadria 45°",
        materialName: "Acabamento de 3 Nichos Embutidos",
        unit: "m linear",
        quantity: 8.6,
        unitPrice: 95.0,
        subtotal: 817.0,
      },
    ],
    operationalCosts: {
      extraSetup: 180.0,
      notes: "Içamento manual de lastras até o piso superior pela escada.",
    },
    servicesTotal: 2949.0,
    costsTotal: 180.0,
    grandTotal: 3129.0,
    status: "pending",
    shareableUrlToken: "med-nov26-suitemaster",
    createdAt: "2026-11-11T11:20:00Z",
  },
  {
    id: "med-003",
    title: "Polimento & Bancadas Hall de Entrada",
    date: "2026-11-08",
    location: "Edifício Horizon Corporate - Itaim Bibi/SP",
    clientId: "cli-003",
    clientName: "Construtora Silva & Ramos",
    projectId: "proj-003",
    projectTitle: "Edifício Horizon & Quinta da Baroneza",
    collaboratorId: "usr_supervisor_001",
    collaboratorName: "Marcos Oliveira",
    collaboratorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isTeamContext: true,
    leaderId: "usr_manager_001",
    items: [
      {
        id: "item-301",
        serviceId: "srv-004",
        serviceName: "Polimento e Cristalização de Rochas",
        materialName: "Granito Preto São Gabriel Escovado",
        unit: "m²",
        quantity: 24.0,
        unitPrice: 65.0,
        subtotal: 1560.0,
      },
      {
        id: "item-302",
        serviceId: "srv-005",
        serviceName: "Instalação de Ilha Gourmet & Bancada",
        materialName: "Balcão Recepção Principal",
        unit: "unidade",
        quantity: 1,
        unitPrice: 380.0,
        subtotal: 380.0,
      },
    ],
    operationalCosts: {
      lodging: 280.0,
      transport: 160.0,
      food: 110.0,
      notes: "Trabalho executado em turno noturno devido às regras do condomínio.",
    },
    servicesTotal: 1940.0,
    costsTotal: 550.0,
    grandTotal: 2490.0,
    status: "rework",
    reworkNote: "Favor anexar a nota fiscal do hotel e reconfirmar metragem do balcão.",
    shareableUrlToken: "med-nov26-hallrevest",
    createdAt: "2026-11-08T18:40:00Z",
  },
  {
    id: "med-004",
    title: "Bancadas Lavabo & Espelho Iluminado",
    date: "2026-11-04",
    location: "Av. Barão de Itapura, 1500 - Campinas/SP",
    clientId: "cli-004",
    clientName: "Eng. Marcos Pontes",
    projectId: "proj-004",
    projectTitle: "Ed. Grand Plaza Campinas - Lavabos",
    collaboratorId: "usr_member_004",
    collaboratorName: "Rafael Silveira",
    collaboratorAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    isTeamContext: true,
    leaderId: "usr_manager_001",
    items: [
      {
        id: "item-401",
        serviceId: "srv-002",
        serviceName: "Corte em Meia Esquadria 45°",
        materialName: "Quartzo Branco Prime",
        unit: "m linear",
        quantity: 4.8,
        unitPrice: 85.0,
        subtotal: 408.0,
      },
      {
        id: "item-402",
        serviceId: "srv-003",
        serviceName: "Furação e Recorte de Cuba Esculpida",
        materialName: "Furo misturador monocomando Docol",
        unit: "unidade",
        quantity: 1,
        unitPrice: 120.0,
        subtotal: 120.0,
      },
    ],
    operationalCosts: {
      transport: 80.0,
    },
    servicesTotal: 528.0,
    costsTotal: 80.0,
    grandTotal: 608.0,
    status: "approved",
    shareableUrlToken: "med-nov26-lavaboquartzo",
    createdAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "med-005",
    title: "Assentamento Área Gourmet & Piscina",
    date: "2026-11-11",
    location: "Residencial Quinta da Baroneza - Bragança/SP",
    clientId: "cli-003",
    clientName: "Construtora Silva & Ramos",
    projectId: "proj-003",
    projectTitle: "Edifício Horizon & Quinta da Baroneza",
    collaboratorId: "usr_member_001",
    collaboratorName: "Lucas Ferraz",
    collaboratorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isTeamContext: true,
    leaderId: "usr_manager_001",
    items: [
      {
        id: "item-501",
        serviceId: "srv-001",
        serviceName: "Assentamento de Mármore Travertino",
        materialName: "Borda Piscina atérmica levigada",
        unit: "m²",
        quantity: 18.2,
        unitPrice: 145.0,
        subtotal: 2639.0,
      },
      {
        id: "item-502",
        serviceId: "srv-002",
        serviceName: "Corte em Meia Esquadria 45°",
        materialName: "Canto grelha oculta",
        unit: "m linear",
        quantity: 14.0,
        unitPrice: 85.0,
        subtotal: 1190.0,
      },
    ],
    operationalCosts: {
      transport: 210.0,
      food: 130.0,
      lodging: 240.0,
      notes: "Obra a 95km da base. Estadia de 1 diária para 2 ajudantes.",
    },
    servicesTotal: 3829.0,
    costsTotal: 580.0,
    grandTotal: 4409.0,
    status: "pending",
    shareableUrlToken: "med-nov26-baroneza",
    createdAt: "2026-11-11T16:00:00Z",
  },
  {
    id: "med-solo-001",
    title: "Bancada Cozinha & Soleiras Apartamento Jardins",
    date: "2026-11-09",
    location: "Rua Oscar Freire, 980 - Jardins/SP",
    clientId: "cli-001",
    clientName: "Dr. Roberto Martins",
    projectId: "proj-solo-001",
    projectTitle: "Reforma Apartamento Jardins - Cozinha",
    collaboratorId: "usr_solo_001",
    collaboratorName: "João Autônomo",
    isTeamContext: false,
    items: [
      {
        id: "item-solo-1",
        serviceId: "srv-005",
        serviceName: "Instalação de Ilha Gourmet & Bancada",
        materialName: "Silestone Stellar Snow",
        unit: "unidade",
        quantity: 2,
        unitPrice: 450.0,
        subtotal: 900.0,
      },
    ],
    operationalCosts: {
      transport: 90.0,
    },
    servicesTotal: 900.0,
    costsTotal: 90.0,
    grandTotal: 990.0,
    status: "approved",
    shareableUrlToken: "med-nov26-jardins-solo",
    createdAt: "2026-11-09T13:00:00Z",
  },
]

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
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
          selectedMeasurement:
            state.selectedMeasurement?.id === id ? null : state.selectedMeasurement,
          notification: {
            message: item
              ? `Medição "${item.title}" foi excluída.`
              : "Medição excluída.",
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
            message:
              status === "approved"
                ? "Medição aprovada com sucesso!"
                : status === "rework"
                ? "Revisão solicitada ao colaborador."
                : `Status atualizado para "${status}".`,
            type: status === "approved" ? "success" : "info",
          },
        }))
      },

      bulkApprove: (ids: string[]) => {
        const idSet = new Set(ids)
        const now = new Date().toISOString()
        set((state) => ({
          measurements: state.measurements.map((m) =>
            idSet.has(m.id) ? { ...m, status: "approved", updatedAt: now } : m
          ),
          notification: {
            message: `${ids.length} medições aprovadas em lote com sucesso!`,
            type: "success",
          },
        }))
      },

      openDetailModal: (measurement) => set({ selectedMeasurement: measurement }),
      closeDetailModal: () => set({ selectedMeasurement: null }),

      openShareModal: (measurement) => set({ shareModalMeasurement: measurement }),
      closeShareModal: () => set({ shareModalMeasurement: null }),

      setNotification: (notification) => set({ notification }),

      ensureSeedData: () => {
        const current = get().measurements
        const existingIds = new Set(current.map((m) => m.id))
        const missing = INITIAL_MEASUREMENTS.filter((m) => !existingIds.has(m.id))
        if (missing.length > 0) {
          set({ measurements: [...current, ...missing] })
        }
      },
    }),
    {
      name: "@medipro:measurements-data-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        measurements: state.measurements,
      }),
    }
  )
)
