import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ServiceItem,
  ServiceCategory,
  ServiceViewMode,
} from "@/types/service"
import { toast } from "@/components/ui/use-toast"

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "srv-001",
    name: "Assentamento de Mármore Travertino",
    category: "Assentamento",
    unit: "m2",
    basePrice: 145.0,
    complexityTags: ["Material Nobre", "Alto Risco"],
    description:
      "Assentamento com argamassa colante branca especial, nivelamento a laser e acabamento resinado.",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "srv-002",
    name: "Corte em Meia Esquadria 45°",
    category: "Corte",
    unit: "m_linear",
    basePrice: 85.0,
    complexityTags: ["Precisão Milimétrica", "Padrão"],
    description:
      "Corte em 45 graus para quinas vivas e saias sobrepostas em bancadas e nichos.",
    createdAt: "2026-11-02T11:30:00Z",
    updatedAt: "2026-11-02T11:30:00Z",
  },
  {
    id: "srv-003",
    name: "Furação e Recorte de Cuba Esculpida",
    category: "Furação",
    unit: "un",
    basePrice: 130.0,
    complexityTags: ["Padrão"],
    description:
      "Corte interno polido para cuba oculta ou de embutir, com furação para válvula e misturador.",
    createdAt: "2026-11-03T09:15:00Z",
    updatedAt: "2026-11-03T09:15:00Z",
  },
  {
    id: "srv-004",
    name: "Polimento e Cristalização de Rochas",
    category: "Acabamento",
    unit: "m2",
    basePrice: 65.0,
    complexityTags: ["Acabamento Fino"],
    description:
      "Polimento diamantado progressivo de grão 50 a 3000 e aplicação de selante hidro-óleo fugante.",
    createdAt: "2026-11-04T14:20:00Z",
    updatedAt: "2026-11-04T14:20:00Z",
  },
  {
    id: "srv-005",
    name: "Instalação de Ilha Gourmet & Bancada",
    category: "Instalação",
    unit: "un",
    basePrice: 380.0,
    complexityTags: ["Material Nobre", "Alto Risco"],
    description:
      "Içamento, calçamento estrutural metálico, fixação química com PU bicomponente e vedação.",
    createdAt: "2026-11-05T08:45:00Z",
    updatedAt: "2026-11-05T08:45:00Z",
  },
  {
    id: "srv-006",
    name: "Revestimento Porcelanato Grandes Formatos",
    category: "Assentamento",
    unit: "m2",
    basePrice: 110.0,
    complexityTags: ["Grandes Formatos", "Alto Risco"],
    description:
      "Instalação de lastras a partir de 120x120cm, dupla colagem e sistema de niveladores.",
    createdAt: "2026-11-06T16:10:00Z",
    updatedAt: "2026-11-06T16:10:00Z",
  },
]

interface ServicesState {
  services: ServiceItem[]
  searchTerm: string
  selectedCategory: ServiceCategory | "Todas"
  viewMode: ServiceViewMode
  isFormOpen: boolean
  editingService: ServiceItem | null
  notification: { message: string; type: "success" | "info" | "error" } | null

  // Ações
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: ServiceCategory | "Todas") => void
  setViewMode: (mode: ServiceViewMode) => void
  openCreateModal: () => void
  openEditModal: (service: ServiceItem) => void
  closeFormModal: () => void
  setNotification: (
    notification: { message: string; type: "success" | "info" | "error" } | null
  ) => void
  addService: (
    data: Omit<ServiceItem, "id" | "createdAt" | "updatedAt">
  ) => void
  updateService: (
    id: string,
    data: Partial<Omit<ServiceItem, "id" | "createdAt">>
  ) => void
  deleteService: (id: string) => void
}

export const useServicesStore = create<ServicesState>()(
  persist(
    (set) => ({
      services: INITIAL_SERVICES,
      searchTerm: "",
      selectedCategory: "Todas",
      viewMode: "grid",
      isFormOpen: false,
      editingService: null,
      notification: null,

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

      setViewMode: (viewMode) => set({ viewMode }),

      openCreateModal: () =>
        set({ isFormOpen: true, editingService: null }),

      openEditModal: (service) =>
        set({ isFormOpen: true, editingService: service }),

      closeFormModal: () =>
        set({ isFormOpen: false, editingService: null }),

      setNotification: (notification) => {
        set({ notification })
        if (notification) {
          toast({
            title: notification.type === "success" ? "Sucesso" : "Notificação",
            description: notification.message,
            variant: notification.type === "success" ? "success" : "default",
          })
        }
      },

      addService: (data) =>
        set((state) => {
          const now = new Date().toISOString()
          const newService: ServiceItem = {
            ...data,
            id: `srv-${Date.now().toString(36)}`,
            createdAt: now,
            updatedAt: now,
          }
          const msg = `Serviço "${newService.name}" cadastrado com sucesso!`
          toast({
            title: "Serviço Cadastrado",
            description: msg,
            variant: "success",
          })
          return {
            services: [newService, ...state.services],
            isFormOpen: false,
            editingService: null,
            notification: {
              message: msg,
              type: "success",
            },
          }
        }),

      updateService: (id, data) =>
        set((state) => {
          const now = new Date().toISOString()
          const updatedServices = state.services.map((item) =>
            item.id === id ? { ...item, ...data, updatedAt: now } : item
          )
          const msg = "Serviço atualizado com sucesso!"
          toast({
            title: "Serviço Atualizado",
            description: msg,
            variant: "success",
          })
          return {
            services: updatedServices,
            isFormOpen: false,
            editingService: null,
            notification: {
              message: msg,
              type: "success",
            },
          }
        }),

      deleteService: (id) =>
        set((state) => {
          const serviceToDelete = state.services.find((s) => s.id === id)
          const msg = serviceToDelete
            ? `Serviço "${serviceToDelete.name}" removido.`
            : "Serviço removido com sucesso."
          toast({
            title: "Serviço Removido",
            description: msg,
            variant: "destructive",
          })
          return {
            services: state.services.filter((item) => item.id !== id),
            notification: {
              message: msg,
              type: "info",
            },
          }
        }),
    }),
    {
      name: "@medipro:services-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        services: state.services,
        viewMode: state.viewMode,
      }),
    }
  )
)
