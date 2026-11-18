import React, { useState, useEffect, useRef } from "react"
import {
  Building2,
  Upload,
  X,
  Palette,
  Save,
  FileText,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/stores/authStore"
import { useBrandingStore } from "@/stores/brandingStore"
import { BRAND_COLOR_PRESETS } from "@/types/branding"

export function BrandIdentityFormTab() {
  const user = useAuthStore((state) => state.user)
  const tenantId = user?.tenantId || "tenant_01"

  const { getBrandIdentity, updateBrandIdentity } = useBrandingStore()
  const currentBrand = getBrandIdentity(tenantId)

  const [companyName, setCompanyName] = useState(currentBrand.companyName)
  const [document, setDocument] = useState(currentBrand.document)
  const [phone, setPhone] = useState(currentBrand.phone)
  const [email, setEmail] = useState(currentBrand.email || "")
  const [address, setAddress] = useState(currentBrand.address || "")
  const [logoUrl, setLogoUrl] = useState(currentBrand.logoUrl || "")
  const [primaryColor, setPrimaryColor] = useState(currentBrand.primaryColor)
  const [defaultTerms, setDefaultTerms] = useState(
    currentBrand.defaultTerms || ""
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const brand = getBrandIdentity(tenantId)
    setCompanyName(brand.companyName)
    setDocument(brand.document)
    setPhone(brand.phone)
    setEmail(brand.email || "")
    setAddress(brand.address || "")
    setLogoUrl(brand.logoUrl || "")
    setPrimaryColor(brand.primaryColor || "#0f172a")
    setDefaultTerms(brand.defaultTerms || "")
  }, [tenantId, getBrandIdentity])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !document.trim()) return

    updateBrandIdentity(tenantId, {
      companyName: companyName.trim(),
      document: document.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      primaryColor: primaryColor || "#0f172a",
      defaultTerms: defaultTerms.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Identidade Visual (7 colunas) */}
        <Card className="lg:col-span-7 border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-600" />
              <span>Dados Comerciais &amp; Papel Timbrado</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Personalize o cabeçalho oficial que aparece nos orçamentos compartilhados por link e na impressão em PDF (A4).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload de Logotipo */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logotipo da Empresa"
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 text-center px-2">
                      Sem Logotipo
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Logotipo Oficial
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Envie um arquivo PNG ou JPG para destacar sua marca no topo do documento.
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs gap-1.5 bg-white border-slate-300"
                    >
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>{logoUrl ? "Trocar Logo" : "Enviar Logo"}</span>
                    </Button>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoUrl("")}
                        className="h-8 text-xs text-rose-600 hover:bg-rose-50 gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Remover</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nome Comercial & CNPJ/CPF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Nome Fantasia / Profissional <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Mendes Engenharia & Obras"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    CNPJ ou CPF <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Telefone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Telefone / WhatsApp Comercial
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    E-mail Comercial
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orcamentos@empresa.com.br"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Endereço Comercial */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Endereço / Área de Atendimento
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Exemplo, 100 - Centro, São Paulo/SP"
                  className="h-9 text-xs"
                />
              </div>

              {/* Seletor de Cor Primária */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cor Principal da Marca (Papel Timbrado)</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      primaryColor.toLowerCase() === preset.hex.toLowerCase()
                    return (
                      <Button
                        key={preset.hex}
                        type="button"
                        variant="unstyled"
                        size="auto"
                        onClick={() => setPrimaryColor(preset.hex)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </Button>
                    )
                  })}

                  <label
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                    title="Escolher cor personalizada"
                  >
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0 shadow-none"
                    />
                    <span className="font-mono text-[11px] uppercase">
                      {primaryColor}
                    </span>
                  </label>
                </div>
              </div>

              {/* Termos e Condições Padrão */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Termos e Condições Padrão dos Orçamentos</span>
                </label>
                <Textarea
                  rows={4}
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                  placeholder="Informe cláusulas de garantia, prazo de validade e condições gerais..."
                  className="text-xs leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Este texto será pré-carregado automaticamente sempre que você criar um novo orçamento comercial.
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-10 px-5 shadow-xs"
                >
                  <Save className="h-4 w-4 text-amber-400" />
                  <span>Salvar Identidade Visual</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mini Preview ao Vivo (5 colunas) */}
        <Card className="lg:col-span-5 border-slate-200/90 shadow-2xs bg-white sticky top-20">
          <CardHeader className="p-4 pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Preview ao Vivo do Cabeçalho Timbrado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-slate-100/70">
            {/* Simulação de Folha A4 */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Barra Superior da Cor Primária */}
              <div
                className="h-2.5 w-full transition-colors"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="h-12 w-16 object-contain rounded border border-slate-100 p-1 bg-white shrink-0"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white font-black text-base"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {(companyName || "MP").slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {companyName || "Nome da Sua Empresa"}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        {document || "00.000.000/0001-00"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mt-1">
                        {phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" />
                            {phone}
                          </span>
                        )}
                        {email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-2.5 w-2.5" />
                            {email}
                          </span>
                        )}
                      </div>
                      {address && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Proposta
                    </span>
                    <p className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                      ORC-2026-001
                    </p>
                  </div>
                </div>

                {/* Corpo Simulado */}
                <div className="space-y-2.5 opacity-80">
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="rounded-lg border border-slate-100 p-2.5 space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                      <div className="h-2.5 w-16 rounded bg-slate-200" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-2.5 w-2/5 rounded bg-slate-100" />
                      <div className="h-2.5 w-14 rounded bg-slate-100" />
                    </div>
                  </div>

                  {defaultTerms && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Termos Pré-configurados:
                      </span>
                      <p className="text-[10px] text-slate-500 whitespace-pre-line line-clamp-3">
                        {defaultTerms}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
