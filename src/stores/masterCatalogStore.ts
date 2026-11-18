import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  CatalogItemType,
  MasterServiceType,
  MasterServiceUnit,
} from "@/types/catalog"
import { toast } from "@/components/ui/use-toast"

export const INITIAL_MASTER_SERVICES: MasterServiceType[] = [
  {
    id: "mst-001",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Assentamento de Mármore Travertino",
    category: "Assentamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-002",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Corte em Meia Esquadria 45°",
    category: "Corte",
    defaultUnit: "m_linear",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-003",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Furação e Recorte de Cuba Esculpida",
    category: "Furação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-004",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Polimento e Cristalização de Rochas",
    category: "Acabamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-005",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Instalação de Ilha Gourmet & Bancada",
    category: "Instalação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-006",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Revestimento Porcelanato Grandes Formatos",
    category: "Assentamento",
    defaultUnit: "m2",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-007",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Assentamento de Rodapé",
    category: "Assentamento",
    defaultUnit: "m_linear",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-008",
    tenantId: "tenant_01",
    itemType: "labor",
    name: "Corte e Instalação de Nicho",
    category: "Instalação",
    defaultUnit: "un",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "mst-009",
    tenantId: "tenant_01",
    itemType: "material",
    name: "Argamassa Colante AC3 Branca 20kg",
    category: "Materiais",
    defaultUnit: "saco",
    createdAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "mst-010",
    tenantId: "tenant_01",
    itemType: "material",
    name: "Massa Plástica & Selante PU Bicomponente",
    category: "Materiais",
    defaultUnit: "un",
    createdAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "mst-011",
    tenantId: "tenant_01",
    itemType: "subcontract",
    name: "Diária de Ajudante / Auxiliar de Obra",
    category: "Equipe Auxiliar",
    defaultUnit: "diaria",
    createdAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "mst-012",
    tenantId: "tenant_01",
    itemType: "subcontract",
    name: "Frete & Içamento Especial de Lastras",
    category: "Equipe Auxiliar",
    defaultUnit: "un",
    createdAt: "2026-10-02T10:00:00Z",
  },
]

export interface MasterCatalogFormData {
  itemType: CatalogItemType
  name: string
  category: string
  defaultUnit: MasterServiceUnit
}

interface MasterCatalogState {
  services: MasterServiceType[]
  searchTerm: string
  selectedCategory: string | "Todas"
  selectedItemType: CatalogItemType | "all"
  isModalOpen: boolean
  editingService: MasterServiceType | null

  setSearchTerm: (term: string) => void
  setSelectedCategory: (cat: string | "Todas") => void
  setSelectedItemType: (itemType: CatalogItemType | "all") => void
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
      selectedItemType: "all",
      isModalOpen: false,
      editingService: null,

      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedItemType: (selectedItemType) => set({ selectedItemType }),

      openCreateModal: () => set({ isModalOpen: true, editingService: null }),
      openEditModal: (service) => set({ isModalOpen: true, editingService: service }),
      closeModal: () => set({ isModalOpen: false, editingService: null }),

      addMasterService: (data, tenantId = "tenant_01") => {
        const now = new Date().toISOString()
        const newService: MasterServiceType = {
          id: `mst-${Date.now().toString(36)}`,
          tenantId,
          itemType: data.itemType || "labor",
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
          title: "Item Adicionado",
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
                  itemType: data.itemType ?? s.itemType ?? "labor",
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
          description: "O item foi atualizado no catálogo da empresa.",
          variant: "success",
        })
      },

      deleteMasterService: (id) => {
        const service = get().services.find((s) => s.id === id)
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }))

        toast({
          title: "Item Removido",
          description: service
            ? `"${service.name}" foi excluído do catálogo geral.`
            : "O item foi excluído do catálogo.",
          variant: "destructive",
        })
      },
    }),
    {
      name: "medipro_master_catalog",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MasterCatalogState> | undefined
        if (!persisted?.services) {
          return currentState
        }
        const migrated = persisted.services.map((s) => ({
          ...s,
          itemType: s.itemType || "labor",
        }))
        const existingIds = new Set(migrated.map((s) => s.id))
        const missingSeeds = INITIAL_MASTER_SERVICES.filter(
          (seed) => !existingIds.has(seed.id)
        )
        return {
          ...currentState,
          ...persisted,
          services: [...migrated, ...missingSeeds],
        }
      },
    }
  )
)
