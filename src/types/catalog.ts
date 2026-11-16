export type MasterServiceUnit = "m2" | "m_linear" | "cm" | "un" | "diaria"

export interface MasterServiceType {
  id: string
  tenantId: string
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
}
