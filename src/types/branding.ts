export interface BrandIdentity {
  companyName: string // Nome Fantasia ou Nome Profissional
  document: string // CNPJ ou CPF
  phone: string // Telefone / WhatsApp Comercial
  email?: string
  address?: string
  logoUrl?: string // Preview base64 via upload local ou URL
  primaryColor: string // Hex code (ex: '#0f172a', '#059669', '#1d4ed8', '#b45309')
  defaultTerms?: string // Termos e condições padrão pré-preenchidos nos orçamentos
}

export const BRAND_COLOR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Grafite Executivo", hex: "#0f172a" },
  { name: "Azul Marinho", hex: "#1d4ed8" },
  { name: "Verde Esmeralda", hex: "#059669" },
  { name: "Âmbar Técnico", hex: "#b45309" },
]
