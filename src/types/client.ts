export type ClientType = "residential" | "commercial" | "architect_partner"

export interface ClientAddress {
  street?: string
  number?: string
  neighborhood?: string
  city: string
  state?: string
}

export interface Client {
  id: string
  name: string
  companyName?: string
  type: ClientType
  phone: string
  whatsapp?: string
  email?: string
  document?: string
  address?: ClientAddress
  notes?: string
  totalMeasurementsCount: number
  totalBilledAmount: number
  createdAt: string
  updatedAt: string
}

export const CLIENT_TYPE_CONFIG: Record<
  ClientType,
  { label: string; badgeClass: string; color: string }
> = {
  residential: {
    label: "Residencial",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    color: "blue",
  },
  commercial: {
    label: "Construtora / Obra",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    color: "amber",
  },
  architect_partner: {
    label: "Arquiteto / Parceiro",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    color: "purple",
  },
}
