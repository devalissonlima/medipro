import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { MasterServiceType, MasterServiceUnit } from "@/types/catalog"
import { toast } from "@/components/ui/use-toast"

export const INITIAL_MASTER_SERVICES: MasterServiceType[] = [
  {
    id: "mst-001",
    tenantId: "tenant_01",
    name: "Assentamento de Mármore Travertino",
    category: "Assentamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-002",
    tenantId: "tenant_01",
    name: "Corte em Meia Esquadria 45°",
    category: "Corte",
    defaultUnit: "m_linear",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-003",
    tenantId: "tenant_01",
    name: "Furação e Recorte de Cuba Esculpida",
    category: "Furação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-004",
    tenantId: "tenant_01",
    name: "Polimento e Cristalização de Rochas",
    category: "Acabamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-005",
    tenantId: "tenant_01",
    name: "Instalação de Ilha Gourmet & Bancada",
    category: "Instalação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-006",
    tenantId: "tenant_01",
    name: "Revestimento Porcelanato Grandes Formatos",
    category: "Assentamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-007",
    tenantId: "tenant_01",
    name: "Assentamento de Rodapé",
    category: "Assentamento",
    defaultUnit: "m_linear",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-008",
    tenantId: "tenant_01",
    name: "Corte e Instalação de Nicho",
    category: "Instalação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
]

export interface MasterCatalogFormData {
  name: string
  category: string
  defaultUnit: MasterServiceUnit
}

interface MasterCatalogState {
  services: MasterServiceType[]
  searchTerm: string
  selectedCategory: string | "Todas"
  isModalOpen: boolean
  editingService: MasterServiceType | null

  setSearchTerm: (term: string) => void
  setSelectedCategory: (cat: string | "Todas") => void
  openCreateModal: () => void
  openEditModal: (service: MasterServiceType) => void
  closeModal: () => void
  addMasterService: (data: MasterCatalogFormData, tenantId?: string) => MasterServiceType
  updateMasterService: (id: string, data: Partial<MasterCatalogFormData>) => void
  deleteMasterService: (id: string) => void
}

export const useMasterCatalogStore = create<MasterCatalogState>()(
  persist(
    (set, get) => ({
      services: INITIAL_MASTER_SERVICES,
      searchTerm: "",
      selectedCategory: "Todas",
      isModalOpen: false,
      editingService: null,

      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

      openCreateModal: () => set({ isModalOpen: true, editingService: null }),
      openEditModal: (service) => set({ isModalOpen: true, editingService: service }),
      closeModal: () => set({ isModalOpen: false, editingService: null }),

      addMasterService: (data, tenantId = "tenant_01") => {
        const now = new Date().toISOString()
        const newService: MasterServiceType = {
          id: `mst-${Date.now().toString(36)}`,
          tenantId,
          name: data.name.trim(),
          category: data.category.trim() || "Outros",
          defaultUnit: data.defaultUnit,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          services: [newService, ...state.services],
          isModalOpen: false,
          editingService: null,
        }))

        toast({
          title: "Serviço Adicionado",
          description: `"${newService.name}" foi cadastrado no catálogo geral da empresa.`,
          variant: "success",
        })

        return newService
      },

      updateMasterService: (id, data) => {
        const now = new Date().toISOString()
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...data,
                  name: data.name !== undefined ? data.name.trim() : s.name,
                  category: data.category !== undefined ? data.category.trim() : s.category,
                  updatedAt: now,
                }
              : s
          ),
          isModalOpen: false,
          editingService: null,
        }))

        toast({
          title: "Catálogo Atualizado",
          description: "O serviço foi atualizado no catálogo da empresa.",
          variant: "success",
        })
      },

      deleteMasterService: (id) => {
        const service = get().services.find((s) => s.id === id)
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }))

        toast({
          title: "Serviço Removido",
          description: service
            ? `"${service.name}" foi excluído do catálogo geral.`
            : "O serviço foi excluído do catálogo.",
          variant: "destructive",
        })
      },
    }),
    {
      name: "medipro_master_catalog",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
