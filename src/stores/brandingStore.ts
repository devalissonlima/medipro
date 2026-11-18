import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"
import type { BrandIdentity } from "@/types/branding"

const DEFAULT_BRAND_IDENTITIES: Record<string, BrandIdentity> = {
  tenant_01: {
    companyName: "Marmoraria & Engenharia Mendes Ltda",
    document: "34.512.890/0001-42",
    phone: "(11) 98765-4321",
    email: "comercial@mendesengenharia.com.br",
    address: "Av. Empresarial Alphaville, 450 - Barueri/SP",
    primaryColor: "#0f172a",
    defaultTerms:
      "1. Validade desta proposta sujeita à confirmação de agenda de campo.\n2. O local de instalação deve estar limpo, desimpedido e com pontos elétricos e hidráulicos finalizados.\n3. Alterações de projeto ou serviços adicionais após aprovação serão cobrados via Orçamento Aditivo.\n4. Garantia de 12 meses sobre a instalação executada.",
  },
  tenant_solo_01: {
    companyName: "João Silva - Revestimentos & Bancadas",
    document: "389.451.228-90",
    phone: "(11) 99432-1180",
    email: "joao.silva@autonomo.com.br",
    address: "Atendimento Grande São Paulo & Interior",
    primaryColor: "#b45309",
    defaultTerms:
      "1. Execução realizada por profissional especializado com ferramental próprio.\n2. Materiais básicos não descritos na proposta são por conta do contratante.\n3. Prazo inicia-se após confirmação do sinal de entrada e liberação da obra.",
  },
}

export const FALLBACK_BRAND_IDENTITY: BrandIdentity = {
  companyName: "MediPro Engenharia & Acabamentos",
  document: "00.000.000/0001-00",
  phone: "(11) 99999-0000",
  email: "contato@medipro.com.br",
  address: "São Paulo - SP",
  primaryColor: "#0f172a",
  defaultTerms:
    "1. Proposta válida até a data indicada.\n2. Serviços extras solicitados em obra serão formalizados via aditivo.",
}

interface BrandingState {
  identitiesByTenant: Record<string, BrandIdentity>
  getBrandIdentity: (tenantId?: string) => BrandIdentity
  updateBrandIdentity: (tenantId: string, data: Partial<BrandIdentity>) => void
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      identitiesByTenant: DEFAULT_BRAND_IDENTITIES,

      getBrandIdentity: (tenantId = "tenant_01") => {
        const stored = get().identitiesByTenant[tenantId]
        if (stored) return stored
        return DEFAULT_BRAND_IDENTITIES[tenantId] || FALLBACK_BRAND_IDENTITY
      },

      updateBrandIdentity: (tenantId, data) => {
        set((state) => {
          const current =
            state.identitiesByTenant[tenantId] ||
            DEFAULT_BRAND_IDENTITIES[tenantId] ||
            FALLBACK_BRAND_IDENTITY

          return {
            identitiesByTenant: {
              ...state.identitiesByTenant,
              [tenantId]: {
                ...current,
                ...data,
              },
            },
          }
        })

        toast({
          title: "Identidade Visual Salva",
          description:
            "As configurações de Papel Timbrado foram atualizadas para todas as propostas e PDFs.",
          variant: "success",
        })
      },
    }),
    {
      name: "@medipro:branding-store-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
