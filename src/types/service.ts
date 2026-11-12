export type ServiceUnit = "m2" | "m_linear" | "cm" | "un" | "diaria"

export type ServiceCategory =
  | "Corte"
  | "Assentamento"
  | "Acabamento"
  | "Furação"
  | "Instalação"
  | "Outros"

export interface ServiceItem {
  id: string
  name: string
  category: ServiceCategory
  unit: ServiceUnit
  basePrice: number
  complexityTags?: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceFormData {
  name: string
  category: ServiceCategory
  unit: ServiceUnit
  basePrice: number
  complexityTags: string[]
  description: string
}

export type ServiceViewMode = "grid" | "table"

export const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
  m2: "m²",
  m_linear: "m linear",
  cm: "cm",
  un: "unidade",
  diaria: "diária",
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Corte",
  "Assentamento",
  "Acabamento",
  "Furação",
  "Instalação",
  "Outros",
]
