import type { CatalogItemType } from "./catalog"
export type { CatalogItemType } from "./catalog"
export {
  CATALOG_ITEM_TYPE_LABELS,
  CATALOG_ITEM_TYPE_SHORT_LABELS,
  CATALOG_ITEM_TYPE_BADGES,
} from "./catalog"

export type ServiceUnit = "m2" | "m_linear" | "cm" | "un" | "diaria" | "kg" | "saco"

export type ServiceCategory =
  | "Corte"
  | "Assentamento"
  | "Acabamento"
  | "Furação"
  | "Instalação"
  | "Materiais"
  | "Equipe Auxiliar"
  | "Outros"

export interface ServiceItem {
  id: string
  masterServiceId?: string
  itemType: CatalogItemType
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
  masterServiceId?: string
  itemType: CatalogItemType
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
  kg: "kg",
  saco: "saco",
}

export const MEASUREMENT_UNIT_OPTIONS: Array<{
  key: ServiceUnit
  value: string
  label: string
}> = [
  { key: "m2", value: "m²", label: "Metro Quadrado (m²)" },
  { key: "m_linear", value: "m linear", label: "Metro Linear (m linear)" },
  { key: "cm", value: "cm", label: "Centímetro (cm)" },
  { key: "un", value: "unidade", label: "Unidade / Peça (un)" },
  { key: "diaria", value: "diária", label: "Diária (diária)" },
  { key: "kg", value: "kg", label: "Quilograma (kg)" },
  { key: "saco", value: "saco", label: "Saco / Pacote (saco)" },
]

export function normalizeMeasurementUnit(unit?: string): string {
  if (!unit) return "m²"
  const trimmed = unit.trim()
  const lower = trimmed.toLowerCase()
  const keyMap: Record<string, string> = {
    m2: "m²",
    "m²": "m²",
    m_linear: "m linear",
    "m linear": "m linear",
    cm: "cm",
    un: "unidade",
    unidade: "unidade",
    diaria: "diária",
    "diária": "diária",
    kg: "kg",
    saco: "saco",
  }
  return keyMap[lower] || trimmed
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Corte",
  "Assentamento",
  "Acabamento",
  "Furação",
  "Instalação",
  "Materiais",
  "Equipe Auxiliar",
  "Outros",
]
