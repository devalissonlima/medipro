export type CatalogItemType = "labor" | "material" | "subcontract"

export const CATALOG_ITEM_TYPE_LABELS: Record<CatalogItemType, string> = {
  labor: "Mão de Obra",
  material: "Material / Insumo",
  subcontract: "Ajudante / Terceiro",
}

export const CATALOG_ITEM_TYPE_SHORT_LABELS: Record<CatalogItemType, string> = {
  labor: "Mão de Obra",
  material: "Material",
  subcontract: "Ajudante / Terceiro",
}

export const CATALOG_ITEM_TYPE_BADGES: Record<
  CatalogItemType,
  { label: string; className: string }
> = {
  labor: {
    label: "Mão de Obra",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  material: {
    label: "Material",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  subcontract: {
    label: "Ajudante / Terceiro",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
}

export type MasterServiceUnit = "m2" | "m_linear" | "cm" | "un" | "diaria" | "kg" | "saco"

export interface MasterServiceType {
  id: string
  tenantId: string
  itemType: CatalogItemType
  name: string
  category: string
  defaultUnit: MasterServiceUnit
  createdAt: string
  updatedAt?: string
}

export const MASTER_SERVICE_UNIT_LABELS: Record<MasterServiceUnit, string> = {
  m2: "m²",
  m_linear: "m linear",
  cm: "cm",
  un: "unidade",
  diaria: "diária",
  kg: "kg",
  saco: "saco",
}
