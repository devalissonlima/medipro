import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  ArrowLeft,
  Building2,
  Calendar,
  FolderKanban,
  MapPin,
  Plus,
  Ruler,
  Trash2,
  AlertCircle,
  Wrench,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import {
  CatalogServicePickerModal,
  type CatalogPickerItem,
} from "@/components/shared/CatalogServicePickerModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryFooter } from "@/pages/measurements/components/form/SummaryFooter"
import { useAuthStore } from "@/stores/authStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"
import { useServicesStore } from "@/stores/servicesStore"
import { useBrandingStore } from "@/stores/brandingStore"
import { useBudgetsStore, calculateBudgetTotals } from "@/stores/budgetsStore"
import {
  CATALOG_ITEM_TYPE_BADGES,
  MASTER_SERVICE_UNIT_LABELS,
  type CatalogItemType,
} from "@/types/catalog"
import {
  MEASUREMENT_UNIT_OPTIONS,
  SERVICE_UNIT_LABELS,
  normalizeMeasurementUnit,
} from "@/types/service"
import type { BudgetItem, BudgetStatus, BudgetType } from "@/types/budget"
import { formatCurrency } from "@/utils/calculations"

interface UnifiedCatalogEntry {
  key: string
  masterServiceId?: string
  itemType: CatalogItemType
  name: string
  category: string
  unit: string
  suggestedPrice: number
  description?: string
  tags?: string[]
}

export function BudgetFormPage() {
  const { id: editId } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const goBack = useSmartBack("/orcamentos")

  const user = useAuthStore((state) => state.user)
  const tenantId = user?.tenantId || "tenant_01"
  const isSupervisor = user?.role === "PROJECT_SUPERVISOR"

  const clients = useClientsStore((state) => state.clients)
  const projects = useProjectsStore((state) => state.projects)
  const masterCatalog = useMasterCatalogStore((state) => state.services)
  const personalServices = useServicesStore((state) => state.services)
  const getBrandIdentity = useBrandingStore((state) => state.getBrandIdentity)
  const { budgets, addBudget, updateBudget } = useBudgetsStore()

  const existingBudget = useMemo(
    () => (editId ? budgets.find((b) => b.id === editId) || null : null),
    [budgets, editId]
  )

  const preselectedProjectId = searchParams.get("projectId") || ""
  const defaultBrand = useMemo(
    () => getBrandIdentity(tenantId),
    [getBrandIdentity, tenantId]
  )

  const tenantProjects = useMemo(
    () => projects.filter((p) => p.tenantId === tenantId),
    [projects, tenantId]
  )

  const defaultValidDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 15)
    return d.toISOString().split("T")[0]
  }

  // Estado do formulário
  const [budgetType, setBudgetType] = useState<BudgetType>(
    existingBudget?.budgetType || (preselectedProjectId ? "additive" : "base")
  )
  const [projectId, setProjectId] = useState<string>(
    existingBudget?.projectId || preselectedProjectId
  )
  const [clientId, setClientId] = useState<string>(
    existingBudget?.clientId || clients[0]?.id || ""
  )
  const [title, setTitle] = useState<string>(existingBudget?.title || "")
  const [validUntil, setValidUntil] = useState<string>(
    existingBudget?.validUntil || defaultValidDate()
  )
  const [executionDeadline, setExecutionDeadline] = useState<string>(
    existingBudget?.executionDeadline || "10 dias úteis"
  )
  const [paymentTerms, setPaymentTerms] = useState<string>(
    existingBudget?.paymentTerms || "50% na aprovação + 50% na entrega"
  )
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    existingBudget?.termsAndConditions || defaultBrand.defaultTerms || ""
  )
  const [items, setItems] = useState<BudgetItem[]>(existingBudget?.items || [])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal seletor do Catálogo Unificado
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Sincroniza projeto pré-selecionado na URL (?projectId=xxx)
  useEffect(() => {
    if (!editId && preselectedProjectId) {
      const proj = tenantProjects.find((p) => p.id === preselectedProjectId)
      if (proj) {
        setProjectId(proj.id)
        setClientId(proj.clientId)
        setBudgetType("additive")
        if (!title) {
          setTitle(`Aditivo - ${proj.title}`)
        }
      }
    }
  }, [preselectedProjectId, editId, tenantProjects])

  const handleSelectProject = (newProjId: string) => {
    setProjectId(newProjId)
    const proj = tenantProjects.find((p) => p.id === newProjId)
    if (proj) {
      setClientId(proj.clientId)
      if (!editId && budgetType === "additive" && !title.trim()) {
        setTitle(`Aditivo - ${proj.title}`)
      }
    }
  }

  // Catálogo unificado combinando Master Catalog (empresa) + preços sugeridos de personalServices
  const unifiedCatalog = useMemo<UnifiedCatalogEntry[]>(() => {
    const entries: UnifiedCatalogEntry[] = []
    const addedKeys = new Set<string>()

    if (user?.role === "SOLO") {
      personalServices.forEach((s) => {
        const key = (s.masterServiceId || s.name).toLowerCase()
        addedKeys.add(key)
        entries.push({
          key: `srv-${s.id}`,
          masterServiceId: s.masterServiceId || s.id,
          itemType: s.itemType || "labor",
          name: s.name,
          category: s.category,
          unit: SERVICE_UNIT_LABELS[s.unit] || s.unit,
          suggestedPrice: s.basePrice,
          description: s.description,
          tags: s.complexityTags,
        })
      })
    }

    masterCatalog.forEach((m) => {
      const matchPersonal = personalServices.find(
        (p) =>
          p.masterServiceId === m.id ||
          p.name.toLowerCase() === m.name.toLowerCase()
      )
      const key = m.id.toLowerCase()
      if (addedKeys.has(key) || addedKeys.has(m.name.toLowerCase())) return
      addedKeys.add(key)
      entries.push({
        key: `mst-${m.id}`,
        masterServiceId: m.id,
        itemType: m.itemType || "labor",
        name: m.name,
        category: m.category,
        unit: MASTER_SERVICE_UNIT_LABELS[m.defaultUnit] || m.defaultUnit,
        suggestedPrice: matchPersonal?.basePrice || 0,
        description: matchPersonal?.description,
        tags: matchPersonal?.complexityTags,
      })
    })

    return entries
  }, [user?.role, masterCatalog, personalServices])

  const pickerItems = useMemo<CatalogPickerItem[]>(() => {
    return unifiedCatalog.map((entry) => ({
      id: entry.key,
      itemType: entry.itemType,
      name: entry.name,
      category: entry.category,
      unit: entry.unit,
      price: entry.suggestedPrice,
      description: entry.description,
      tags: entry.tags,
    }))
  }, [unifiedCatalog])

  const totals = useMemo(() => calculateBudgetTotals(items), [items])

  const handleSelectPickerItem = (picked: CatalogPickerItem) => {
    const entry = unifiedCatalog.find((e) => e.key === picked.id)
    if (!entry) return
    const qty = 1
    const price = entry.suggestedPrice
    const newItem: BudgetItem = {
      id: `bi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      masterServiceId: entry.masterServiceId,
      itemType: entry.itemType,
      environment: "",
      description: entry.name,
      unit: normalizeMeasurementUnit(entry.unit),
      quantity: qty,
      unitPrice: price,
      subtotal: Number((qty * price).toFixed(2)),
    }
    setItems((prev) => [...prev, newItem])
    setIsPickerOpen(false)
    setError(null)
  }

  const handleAddCustomItem = (itemType: CatalogItemType = "labor") => {
    const newItem: BudgetItem = {
      id: `bi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      itemType,
      environment: "",
      description: "",
      unit: itemType === "subcontract" ? "diária" : itemType === "material" ? "unidade" : "m²",
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    }
    setItems((prev) => [...prev, newItem])
    setError(null)
  }

  const handleUpdateItem = (
    itemId: string,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const updated: BudgetItem = {
          ...item,
          [field]: value,
        }
        if (field === "quantity" || field === "unitPrice") {
          const qty = Number(updated.quantity) || 0
          const price = Number(updated.unitPrice) || 0
          updated.subtotal = Number((qty * price).toFixed(2))
        }
        return updated
      })
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const handleSave = (targetStatus: BudgetStatus) => {
    setError(null)

    if (!title.trim()) {
      setError("Informe um título para a proposta ou orçamento.")
      return
    }
    if (!clientId) {
      setError("Selecione o cliente destinatário do orçamento.")
      return
    }
    if (budgetType === "additive" && !projectId) {
      setError("Um orçamento aditivo deve estar vinculado a um projeto existente.")
      return
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um item à composição do orçamento.")
      return
    }
    const invalidItem = items.find(
      (i) => !i.description.trim() || i.quantity <= 0
    )
    if (invalidItem) {
      setError("Todos os itens devem possuir descrição e quantidade maior que zero.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      tenantId,
      clientId,
      projectId: projectId || undefined,
      budgetType,
      title: title.trim(),
      status: isSupervisor ? ("draft" as BudgetStatus) : targetStatus,
      validUntil,
      paymentTerms: paymentTerms.trim(),
      executionDeadline: executionDeadline.trim(),
      termsAndConditions: termsAndConditions.trim(),
      items,
      signatureUrl: user?.signatureUrl || existingBudget?.signatureUrl,
      signatureName:
        user?.signatureName || existingBudget?.signatureName || user?.name,
    }

    if (existingBudget) {
      updateBudget(existingBudget.id, payload)
      navigate(`/orcamentos/${existingBudget.id}`)
    } else {
      const created = addBudget(payload)
      navigate(`/orcamentos/${created.id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/60">
      <PageContainer className="flex-1 max-w-5xl space-y-6 pb-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goBack("/orcamentos")}
              className="h-9 w-9 text-slate-600 hover:text-slate-900 border-slate-300"
              title="Voltar para a página anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {existingBudget
                    ? `Editar Orçamento ${existingBudget.code}`
                    : "Novo Orçamento Comercial"}
                </h1>
                {existingBudget && (
                  <Badge className="text-[10px] font-bold bg-blue-600 text-white">
                    Modo de Edição
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {existingBudget
                  ? "Altere itens, prazos ou condições comerciais antes de enviar a proposta ao cliente."
                  : "Monte composições de Mão de Obra, Materiais e Terceiros para gerar uma proposta timbrada profissional."}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* BLOCO 1: Identificação da Obra & Destinatário */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                1
              </span>
              Identificação da Obra &amp; Destinatário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Título da Proposta (8 cols) */}
              <div className="sm:col-span-8 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Título da Proposta / Obra <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Bancadas Cozinha & Lavabos - Casa 14"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Validade da Proposta (4 cols) */}
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Validade da Proposta <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              <div className="sm:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Cliente (CRM) <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="h-9 text-xs bg-white"
                  >
                    <option value="" disabled>
                      Selecione o cliente...
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Tipo de Orçamento
                  </label>
                  <Select
                    value={budgetType}
                    onChange={(e) => {
                      const next = e.target.value as BudgetType
                      setBudgetType(next)
                      if (next === "base" && !preselectedProjectId) {
                        setProjectId("")
                      }
                    }}
                    className="h-9 text-xs bg-white"
                  >
                    <option value="base">Orçamento Base (Nova Obra)</option>
                    <option value="additive">Aditivo de Obra Existente</option>
                  </Select>
                </div>
              </div>

              <div className="sm:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Prazo de Execução
                  </label>
                  <Input
                    value={executionDeadline}
                    onChange={(e) => setExecutionDeadline(e.target.value)}
                    placeholder="Ex: 10 dias úteis"
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Pagamento
                  </label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="Ex: 50% + 50%"
                    className="h-9 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {budgetType === "additive" && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-amber-600" />
                  Projeto Vinculado ao Aditivo <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={projectId}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="h-9 text-xs bg-white"
                >
                  <option value="">
                    Selecione a obra que receberá este aditivo...
                  </option>
                  {tenantProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-amber-900/80">
                  Quando aprovado, os itens e valor deste aditivo serão somados automaticamente ao escopo e valor contratado da obra.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BLOCO 2: Serviços, Materiais & Composições */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                2
              </span>
              Serviços, Materiais &amp; Composições ({items.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddCustomItem("labor")}
                className="gap-1.5 border-dashed border-amber-400 text-amber-900 bg-amber-50/60 hover:bg-amber-100 text-xs font-semibold h-9 px-3"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600" />
                + Item Manual
              </Button>
              <Button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-9 px-3.5 shadow-sm"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                Adicionar do Catálogo
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto">
                  <Ruler className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Nenhum item adicionado ainda
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Clique em &ldquo;+ Adicionar do Catálogo&rdquo; para selecionar serviços, materiais e diárias padronizadas ou lance um item manualmente.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPickerOpen(true)}
                    className="text-xs border-slate-300 text-slate-800 hover:bg-slate-100 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Selecionar do Catálogo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddCustomItem("labor")}
                    className="text-xs border-dashed border-amber-400 text-amber-900 bg-amber-50/50 hover:bg-amber-100 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-600" />
                    + Item Manual
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const badgeInfo = CATALOG_ITEM_TYPE_BADGES[item.itemType]
                  const normalizedUnit = normalizeMeasurementUnit(item.unit)
                  const hasCustomUnit = !MEASUREMENT_UNIT_OPTIONS.some(
                    (o) => o.value === normalizedUnit
                  )

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4 relative group hover:border-slate-300 transition-colors"
                    >
                      {/* Cabeçalho do Item */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                            {item.description.trim() || "Novo Item do Orçamento"}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold shrink-0 ${badgeInfo.className}`}
                          >
                            {badgeInfo.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase font-semibold shrink-0"
                          >
                            {normalizedUnit}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={item.itemType}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "itemType",
                                e.target.value as CatalogItemType
                              )
                            }
                            className="h-8 text-[11px] font-semibold bg-white w-44"
                          >
                            <option value="labor">Mão de Obra</option>
                            <option value="material">Material / Insumo</option>
                            <option value="subcontract">Ajudante / Terceiro</option>
                          </Select>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* ZONA 1: O que será feito e onde */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-7 space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              Qual é o Serviço, Material ou Diária?{" "}
                              <span className="text-rose-500">*</span>
                            </span>
                          </label>
                          <Input
                            placeholder={
                              item.itemType === "material"
                                ? "Ex: Argamassa AC3 Branca, Selante PU..."
                                : item.itemType === "subcontract"
                                ? "Ex: Diária de Ajudante, Frete / Içamento..."
                                : "Ex: Assentamento de Mármore, Corte 45°..."
                            }
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="h-10 text-xs bg-white"
                          />
                        </div>

                        <div className="sm:col-span-5 space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Ambiente / Local de Aplicação (Opcional)</span>
                          </label>
                          <Input
                            placeholder="Ex: Cozinha Gourmet, Banheiro Suíte, Geral..."
                            value={item.environment || ""}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "environment",
                                e.target.value
                              )
                            }
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* ZONA 2: Cálculo de Quantidade e Preço */}
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">
                              Unidade de Medida
                            </label>
                            <Select
                              value={normalizedUnit}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "unit", e.target.value)
                              }
                              className="h-10 text-xs bg-white"
                            >
                              {MEASUREMENT_UNIT_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                              {hasCustomUnit && (
                                <option value={normalizedUnit}>
                                  {normalizedUnit}
                                </option>
                              )}
                            </Select>
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">
                              Quantidade / Metragem
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0,00"
                                value={item.quantity === 0 ? "" : item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "quantity",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-10 text-xs font-mono font-semibold text-slate-900 pr-16 bg-white"
                              />
                              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                {normalizedUnit}
                              </span>
                            </div>
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block">
                              Valor por {normalizedUnit}
                            </label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                R$
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0,00"
                                value={item.unitPrice === 0 ? "" : item.unitPrice}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-10 text-xs font-mono font-semibold text-slate-900 pl-9 bg-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block text-right sm:text-left">
                              Valor Total do Item
                            </label>
                            <div className="flex h-10 items-center justify-between rounded-lg bg-white border border-slate-200 px-3 font-mono font-black text-sm text-slate-900 shadow-2xs">
                              <span className="text-xs font-bold text-slate-400">
                                =
                              </span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BLOCO 3: Termos, Garantias & Condições Comerciais */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                3
              </span>
              Termos, Garantias &amp; Observações Comerciais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            <Textarea
              rows={4}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Informe observações técnicas, prazos de garantia e condições gerais..."
              className="text-xs leading-relaxed"
            />
          </CardContent>
        </Card>
      </PageContainer>

      {/* BLOCO 4: Barra Fixa de Resumo e Fechamento (Idêntica à Tela de Medição) */}
      <SummaryFooter
        servicesTotal={totals.totalAmount}
        laborTotal={totals.laborTotal}
        materialTotal={totals.materialTotal}
        subcontractTotal={totals.subcontractTotal}
        showCostsTotal={false}
        grandTotal={totals.totalAmount}
        totalLabel="VALOR TOTAL DO ORÇAMENTO:"
        finalizeLabel="Finalizar e Enviar"
        hideFinalize={isSupervisor}
        isSubmitting={isSubmitting}
        onSaveDraft={() => handleSave("draft")}
        onFinalize={() => handleSave("sent")}
      />

      {/* Modal Seletor do Catálogo Unificado */}
      <CatalogServicePickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        title="Selecionar Item do Catálogo"
        description="Navegue entre Mão de Obra, Materiais e Terceiros para montar a composição deste orçamento."
        items={pickerItems}
        onSelect={handleSelectPickerItem}
        footerAction={{
          label: "+ Adicionar Item Manual em Branco",
          onClick: () => {
            setIsPickerOpen(false)
            handleAddCustomItem("labor")
          },
        }}
      />
    </div>
  )
}

export default BudgetFormPage
