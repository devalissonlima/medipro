import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Client } from "@/types/client"
import { toast } from "@/components/ui/use-toast"

const INITIAL_CLIENTS: Client[] = [
  {
    id: "cli-001",
    name: "Dr. Roberto Martins",
    companyName: "Residência Alphaville - Casa 42",
    type: "residential",
    phone: "(11) 97654-1122",
    whatsapp: "(11) 97654-1122",
    email: "roberto.martins@email.com",
    document: "123.456.789-00",
    address: {
      street: "Al. das Orquídeas",
      number: "142",
      neighborhood: "Alphaville Zero",
      city: "Santana de Parnaíba",
      state: "SP",
    },
    notes: "Entrada na portaria somente após as 9h com documento. Agendar com antecedência.",
    totalMeasurementsCount: 2,
    totalBilledAmount: 8500.0,
    createdAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-11-10T14:30:00Z",
  },
  {
    id: "cli-002",
    name: "Arq. Camila Vasconcellos",
    companyName: "Studio Arquitetura & Interiores",
    type: "architect_partner",
    phone: "(11) 99123-8877",
    whatsapp: "(11) 99123-8877",
    email: "camila@studiovasconcellos.com.br",
    document: "12.345.678/0001-90",
    address: {
      street: "Av. Brigadeiro Faria Lima",
      number: "2601",
      neighborhood: "Itaim Bibi",
      city: "São Paulo",
      state: "SP",
    },
    notes: "Arquiteta parceira com especificações recorrentes de mármores nobres e porcelanatos finos.",
    totalMeasurementsCount: 3,
    totalBilledAmount: 14250.0,
    createdAt: "2026-10-20T14:30:00Z",
    updatedAt: "2026-11-11T11:20:00Z",
  },
  {
    id: "cli-003",
    name: "Construtora Silva & Ramos",
    companyName: "Silva & Ramos Engenharia e Obras",
    type: "commercial",
    phone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    email: "obras@silvaramos.com.br",
    document: "98.765.432/0001-11",
    address: {
      street: "Av. Tamboré",
      number: "1000",
      neighborhood: "Tamboré",
      city: "Barueri",
      state: "SP",
    },
    notes: "Contato na obra: Eng. Marcelo. Medições quinzenais com conferência e aprovação na matriz.",
    totalMeasurementsCount: 4,
    totalBilledAmount: 22800.0,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: "2026-11-11T16:00:00Z",
  },
  {
    id: "cli-004",
    name: "Eng. Marcos Pontes",
    companyName: "Edifício Grand Plaza",
    type: "commercial",
    phone: "(19) 98877-6655",
    whatsapp: "(19) 98877-6655",
    email: "marcos.pontes@grandplaza.com.br",
    document: "45.678.901/0001-22",
    address: {
      street: "Av. Barão de Itapura",
      number: "1500",
      neighborhood: "Guanabara",
      city: "Campinas",
      state: "SP",
    },
    notes: "Condomínio comercial de alto padrão. Exige crachá de identificação e EPI completo.",
    totalMeasurementsCount: 1,
    totalBilledAmount: 608.0,
    createdAt: "2026-11-04T10:15:00Z",
    updatedAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "cli-005",
    name: "Dra. Juliana Prado",
    companyName: "Cobertura Jardins",
    type: "residential",
    phone: "(11) 97111-2233",
    whatsapp: "(11) 97111-2233",
    email: "juliana.prado@advocacia.com.br",
    document: "321.654.987-11",
    address: {
      street: "Rua Oscar Freire",
      number: "850",
      neighborhood: "Cerqueira César",
      city: "São Paulo",
      state: "SP",
    },
    notes: "Reforma da cozinha gourmet e banheiros em Quartzo Calacatta.",
    totalMeasurementsCount: 1,
    totalBilledAmount: 5400.0,
    createdAt: "2026-11-02T16:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
  },
]

interface ClientsState {
  clients: Client[]
  isFormOpen: boolean
  editingClient: Client | null
  historyClient: Client | null
  notification: { message: string; type: "success" | "info" | "error" } | null

  // Ações
  searchClients: (term: string) => Client[]
  getClientById: (id: string) => Client | undefined
  createQuickClient: (data: { name: string; whatsapp?: string; address?: string }) => Client
  addClient: (data: Omit<Client, "id" | "totalMeasurementsCount" | "totalBilledAmount" | "createdAt" | "updatedAt">) => Client
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  openCreateModal: () => void
  openEditModal: (client: Client) => void
  openHistoryDrawer: (client: Client) => void
  closeModals: () => void
  setNotification: (
    notification: { message: string; type: "success" | "info" | "error" } | null
  ) => void
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      clients: INITIAL_CLIENTS,
      isFormOpen: false,
      editingClient: null,
      historyClient: null,
      notification: null,

      searchClients: (term: string) => {
        if (!term.trim()) return get().clients
        const lower = term.toLowerCase()
        return get().clients.filter((c) => {
          const formattedAddress = c.address
            ? `${c.address.street || ""} ${c.address.neighborhood || ""} ${c.address.city || ""}`
            : ""
          return (
            c.name.toLowerCase().includes(lower) ||
            (c.companyName && c.companyName.toLowerCase().includes(lower)) ||
            (c.email && c.email.toLowerCase().includes(lower)) ||
            c.phone.includes(term) ||
            formattedAddress.toLowerCase().includes(lower)
          )
        })
      },

      getClientById: (id: string) => {
        return get().clients.find((c) => c.id === id)
      },

      createQuickClient: ({ name, whatsapp, address }) => {
        const now = new Date().toISOString()
        const newClient: Client = {
          id: `cli-${Date.now().toString(36)}`,
          name: name.trim(),
          type: "residential",
          phone: whatsapp?.trim() || "(11) 99999-0000",
          whatsapp: whatsapp?.trim() || "(11) 99999-0000",
          address: {
            city: address?.trim() || "São Paulo",
          },
          totalMeasurementsCount: 0,
          totalBilledAmount: 0,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          clients: [newClient, ...state.clients],
          notification: {
            message: `Cliente "${newClient.name}" cadastrado com sucesso!`,
            type: "success",
          },
        }))

        return newClient
      },

      addClient: (data) => {
        const now = new Date().toISOString()
        const newClient: Client = {
          ...data,
          id: `cli-${Date.now().toString(36)}`,
          whatsapp: data.phone,
          totalMeasurementsCount: 0,
          totalBilledAmount: 0,
          createdAt: now,
          updatedAt: now,
        }

        const msg = `Cliente "${newClient.name}" cadastrado com sucesso!`
        toast({
          title: "Cliente Cadastrado",
          description: msg,
          variant: "success",
        })

        set((state) => ({
          clients: [newClient, ...state.clients],
          isFormOpen: false,
          notification: {
            message: msg,
            type: "success",
          },
        }))

        return newClient
      },

      updateClient: (id, data) => {
        const now = new Date().toISOString()
        const msg = "Cadastro do cliente atualizado com sucesso!"
        toast({
          title: "Cliente Atualizado",
          description: msg,
          variant: "success",
        })
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: now } : c
          ),
          isFormOpen: false,
          editingClient: null,
          notification: {
            message: msg,
            type: "success",
          },
        }))
      },

      deleteClient: (id) => {
        const client = get().clients.find((c) => c.id === id)
        const msg = client
          ? `Cliente "${client.name}" removido da carteira.`
          : "Cliente removido com sucesso."
        toast({
          title: "Cliente Removido",
          description: msg,
          variant: "destructive",
        })
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          historyClient: state.historyClient?.id === id ? null : state.historyClient,
          notification: {
            message: msg,
            type: "info",
          },
        }))
      },

      openCreateModal: () => set({ isFormOpen: true, editingClient: null }),
      openEditModal: (client) => set({ isFormOpen: true, editingClient: client }),
      openHistoryDrawer: (client) => set({ historyClient: client }),
      closeModals: () =>
        set({ isFormOpen: false, editingClient: null, historyClient: null }),

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
    }),
    {
      name: "@medipro:clients-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
      }),
    }
  )
)
