import { useState, useMemo } from "react"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Ruler,
  FolderKanban,
  AlertTriangle,
  AlertCircle,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import {
  CatalogServicePickerModal,
  type CatalogPickerItem,
} from "@/components/shared/CatalogServicePickerModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMeasurementForm } from "./hooks/useMeasurementForm"
import { ClientSelector } from "./components/form/ClientSelector"
import { ServiceItemRow } from "./components/form/ServiceItemRow"
import { OutOfScopeServiceCard } from "./components/form/OutOfScopeServiceCard"
import { OperationalCostsCard } from "./components/form/OperationalCostsCard"
import { SummaryFooter } from "./components/form/SummaryFooter"
import { useServicesStore } from "@/stores/servicesStore"

export function NewMeasurementPage() {
  const goBack = useSmartBack("/medicoes")
  const { services: catalogServices } = useServicesStore()

  const {
    isEditing,
    isApproved,
    title,
    setTitle,
    date,
    setDate,
    location,
    setLocation,
    projectId,
    handleSelectProject,
    availableProjects,
    requiresProjectSelection,
    projectScopeItems,
    scopeItemExecutions,
    findScopeItem,
    clientId,
    clientName,
    setClientId,
    setClientName,
    isTeamContext,
    setIsTeamContext,
    items,
    operationalCosts,
    errors,
    isSubmitting,
    servicesTotal,
    laborTotal,
    materialTotal,
    subcontractTotal,
    inScopeTotal,
    auditPendingTotal,
    costsTotal,
    grandTotal,
    addItemFromService,
    addOutOfScopeItem,
    addManualItem,
    updateItem,
    updateItemAuditField,
    removeItem,
    updateOperationalCost,
    handleSaveDraft,
    handleFinalizeAndShare,
  } = useMeasurementForm()

  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false)
  const [isOutOfScopePickerOpen, setIsOutOfScopePickerOpen] = useState(false)

  const hasScope = projectScopeItems.length > 0

  // 1. Interseção de Serviços (Projeto ∩ Membro)
  const inScopeCatalog = useMemo(() => {
    if (!hasScope) return catalogServices
    return catalogServices.filter((service) => {
      return projectScopeItems.some(
        (scope) =>
          (scope.masterServiceId && scope.masterServiceId === service.id) ||
          scope.serviceName.toLowerCase() === service.name.toLowerCase()
      )
    })
  }, [hasScope, catalogServices, projectScopeItems])

  const inScopePickerItems = useMemo<CatalogPickerItem[]>(() => {
    return inScopeCatalog.map((service) => {
      const matchedScope = findScopeItem(service)
      const executed = matchedScope
        ? scopeItemExecutions.get(matchedScope.id) || 0
        : 0
      const inForm = items
        .filter(
          (i) =>
            !i.isOutOfScope &&
            ((matchedScope?.masterServiceId &&
              i.masterServiceId === matchedScope.masterServiceId) ||
              i.serviceName.toLowerCase() === service.name.toLowerCase())
        )
        .reduce((sum, i) => sum + i.quantity, 0)
      const remaining = matchedScope
        ? Math.max(0, matchedScope.maxQuantity - executed - inForm)
        : null

      return {
        id: service.id,
        itemType: service.itemType || "labor",
        name: service.name,
        category: service.category,
        unit: service.unit,
        price: service.basePrice,
        description: service.description,
        tags: service.complexityTags,
        environment: matchedScope?.environment,
        scopeRemaining: remaining,
        scopeMax: matchedScope?.maxQuantity ?? null,
        scopeUnit: matchedScope?.unit,
      }
    })
  }, [inScopeCatalog, findScopeItem, scopeItemExecutions, items])

  const outOfScopePickerItems = useMemo<CatalogPickerItem[]>(() => {
    return catalogServices.map((service) => ({
      id: service.id,
      itemType: service.itemType || "labor",
      name: service.name,
      category: service.category,
      unit: service.unit,
      price: service.basePrice,
      description: service.description,
      tags: service.complexityTags,
    }))
  }, [catalogServices])

  const handleSelectService = (picked: CatalogPickerItem) => {
    const service = catalogServices.find((s) => s.id === picked.id)
    if (!service) return
    addItemFromService(service)
    setIsServicePickerOpen(false)
  }

  const handleSelectOutOfScopeService = (picked: CatalogPickerItem) => {
    const service = catalogServices.find((s) => s.id === picked.id)
    if (!service) return
    addOutOfScopeItem(service)
    setIsOutOfScopePickerOpen(false)
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/60">
      <PageContainer className="flex-1 max-w-5xl space-y-6 pb-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goBack("/medicoes")}
              className="h-9 w-9 text-slate-600 hover:text-slate-900 border-slate-300"
              title="Voltar para a página anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {isEditing ? "Editar Medição" : "Nova Medição & Orçamento"}
                </h1>
                {isEditing && (
                  <Badge className="text-[10px] font-bold bg-blue-600 text-white">
                    Modo de Edição
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Altere itens, metragens ou salve como rascunho antes de enviar para conferência."
                  : "Lance os serviços e metragens executadas na obra para emissão de relatório e aprovação."}
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Medição Aprovada (Bloqueio de Edição) */}
        {isApproved && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 font-medium">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">
                Esta medição já foi aprovada e liquidada!
              </p>
              <p className="text-[11px] text-amber-800">
                Para manter a integridade dos pagamentos e da auditoria financeira, medições com status aprovado não podem mais sofrer alterações.
              </p>
            </div>
          </div>
        )}

        {/* BLOCO 1: Identificação & Vínculo */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                1
              </span>
              Identificação da Obra & Destinatário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Título da Medição (8 cols) */}
              <div className="sm:col-span-8 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Título da Medição <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Instalação Cozinha Ilha & Gourmet - Apto 82"
                  value={title}
                  disabled={isApproved}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`bg-white ${
                    errors.title ? "border-rose-400 focus-visible:ring-rose-400" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Data do Serviço (4 cols) */}
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Data da Execução <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  disabled={isApproved}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              {/* Seleção de Projeto */}
              <div className="sm:col-span-7 space-y-1.5">
                {requiresProjectSelection ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FolderKanban className="h-3.5 w-3.5 text-amber-600" />
                      Vincular a qual Projeto? <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={projectId}
                      disabled={isApproved}
                      onChange={(e) => handleSelectProject(e.target.value)}
                      className={`bg-white ${
                        errors.project ? "border-rose-400 focus-visible:ring-rose-400" : ""
                      }`}
                    >
                      <option value="">
                        {availableProjects.length > 0
                          ? "Selecione a obra onde você está alocado..."
                          : "Nenhum projeto ativo encontrado para seu usuário"}
                      </option>
                      {availableProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.title} {proj.clientName ? `(${proj.clientName})` : ""}
                        </option>
                      ))}
                    </Select>
                    {errors.project && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {errors.project}
                      </p>
                    )}
                    {clientName && (
                      <p className="text-[11px] text-slate-500">
                        Cliente da obra: <strong className="text-slate-700">{clientName}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableProjects.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <FolderKanban className="h-3.5 w-3.5 text-amber-600" />
                          Vincular a um Projeto (Opcional)
                        </label>
                        <Select
                          value={projectId}
                          disabled={isApproved}
                          onChange={(e) => handleSelectProject(e.target.value)}
                          className="bg-white h-9 text-xs"
                        >
                          <option value="">Sem vínculo específico de obra</option>
                          {availableProjects.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                              {proj.title}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    <ClientSelector
                      clientId={clientId}
                      clientName={clientName}
                      isTeamContext={isTeamContext}
                      error={errors.client}
                      onSelectClient={(id, name) => {
                        if (isApproved) return
                        setClientId(id)
                        setClientName(name)
                      }}
                      onToggleTeamContext={(val) => {
                        if (isApproved) return
                        setIsTeamContext(val)
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Local / Endereço da Obra (5 cols) */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Local / Endereço da Obra (Opcional)
                </label>
                <Input
                  placeholder="Ex: Condomínio Tamboré 10, Casa 42"
                  value={location}
                  disabled={isApproved}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 2: Itens da Medição (Serviços e Materiais) */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                2
              </span>
              Serviços, Materiais & Metragens ({items.length})
            </CardTitle>

            {!isApproved && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addManualItem("labor")}
                  className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-9 px-3"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  + Item Manual
                </Button>

                {hasScope && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOutOfScopePickerOpen(true)}
                    className="gap-1.5 border-dashed border-amber-400 text-amber-900 bg-amber-50/60 hover:bg-amber-100 text-xs font-semibold h-9 px-3"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-600" />
                    + Serviço Extra (Fora de Escopo)
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => setIsServicePickerOpen(true)}
                  className="gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-9 px-3.5 shadow-sm"
                >
                  <Plus className="h-4 w-4 text-amber-400" />
                  Adicionar Serviço {hasScope ? "do Escopo" : ""}
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {errors.items && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errors.items}</span>
              </div>
            )}

            {errors.audit && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errors.audit}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto">
                  <Ruler className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Nenhum serviço adicionado ainda
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {hasScope
                      ? "Esta obra possui escopo definido. Adicione serviços previstos ou lance serviços extras fora de escopo se necessário."
                      : "Clique em '+ Adicionar Serviço' para selecionar itens do catálogo base (cortes, assentamento, polimento)."}
                  </p>
                </div>
                {!isApproved && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsServicePickerOpen(true)}
                      className="text-xs border-slate-300 text-slate-800 hover:bg-slate-100 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Selecionar do Catálogo {hasScope ? "do Escopo" : ""}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addManualItem("labor")}
                      className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5 text-slate-500" />
                      + Item Manual
                    </Button>
                    {hasScope && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOutOfScopePickerOpen(true)}
                        className="text-xs border-dashed border-amber-400 text-amber-900 bg-amber-50/50 hover:bg-amber-100 gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5 text-amber-600" />
                        Lançar Extra (Fora de Escopo)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => {
                  if (item.isOutOfScope) {
                    return (
                      <OutOfScopeServiceCard
                        key={item.id}
                        index={idx}
                        item={item}
                        onUpdate={updateItem}
                        onUpdateAuditField={updateItemAuditField}
                        onRemove={removeItem}
                        isReadOnly={isApproved}
                      />
                    )
                  }

                  const matchedScope = findScopeItem(item)
                  const otherExecuted = matchedScope
                    ? scopeItemExecutions.get(matchedScope.id) || 0
                    : 0

                  return (
                    <ServiceItemRow
                      key={item.id}
                      index={idx}
                      item={item}
                      scopeItem={matchedScope}
                      otherExecutedInProject={otherExecuted}
                      onUpdate={updateItem}
                      onUpdateAuditField={updateItemAuditField}
                      onRemove={removeItem}
                      isReadOnly={isApproved}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BLOCO 3: Custos Operacionais & Despesas de Campo */}
        <div>
          <OperationalCostsCard
            costs={operationalCosts}
            onUpdateCost={updateOperationalCost}
          />
        </div>
      </PageContainer>

      {/* BLOCO 4: Barra Fixa de Resumo e Fechamento */}
      {!isApproved ? (
        <SummaryFooter
          servicesTotal={servicesTotal}
          laborTotal={laborTotal}
          materialTotal={materialTotal}
          subcontractTotal={subcontractTotal}
          inScopeTotal={inScopeTotal}
          auditPendingTotal={auditPendingTotal}
          costsTotal={costsTotal}
          grandTotal={grandTotal}
          isSubmitting={isSubmitting}
          onSaveDraft={handleSaveDraft}
          onFinalize={handleFinalizeAndShare}
        />
      ) : (
        <div className="sticky bottom-0 z-20 w-full border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 shadow-lg text-center">
          <p className="text-xs text-slate-600 font-semibold">
            Medição aprovada — Modo somente leitura.
          </p>
        </div>
      )}

      {/* Modal / Diálogo: Selecionar Serviço do Escopo ou Geral */}
      <CatalogServicePickerModal
        open={isServicePickerOpen}
        onOpenChange={setIsServicePickerOpen}
        title={
          hasScope
            ? "Serviços no Escopo da Obra"
            : "Selecionar Item do Catálogo"
        }
        description={
          hasScope
            ? "Exibindo os itens previstos na planilha orçamentária do projeto separados por Mão de Obra, Materiais e Terceiros."
            : "Navegue entre Mão de Obra, Materiais e Terceiros para lançar os itens executados."
        }
        items={inScopePickerItems}
        onSelect={handleSelectService}
        emptyContextAlert={
          hasScope && inScopeCatalog.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center space-y-3">
              <AlertTriangle className="h-7 w-7 text-amber-600 mx-auto" />
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-amber-950">
                  Nenhum serviço do seu catálogo coincide com o escopo desta obra
                </h5>
                <p className="text-[11px] sm:text-xs text-amber-900/80 mt-1 max-w-md mx-auto">
                  Os serviços cadastrados na sua tabela individual são diferentes dos itens previstos para esta obra. Caso tenha executado um serviço extra, você pode lançá-lo como item fora de escopo.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsServicePickerOpen(false)
                  setIsOutOfScopePickerOpen(true)
                }}
                className="text-xs border-amber-400 text-amber-950 bg-white hover:bg-amber-100 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600" />
                Lançar Serviço Extra (Fora de Escopo)
              </Button>
            </div>
          ) : undefined
        }
        footerAction={
          hasScope
            ? {
                label: "+ Serviço Extra (Fora de Escopo)",
                onClick: () => {
                  setIsServicePickerOpen(false)
                  setIsOutOfScopePickerOpen(true)
                },
              }
            : {
                label: "+ Adicionar Item Manual em Branco",
                onClick: () => {
                  setIsServicePickerOpen(false)
                  addManualItem("labor")
                },
              }
        }
      />

      {/* Modal / Diálogo: Lançar Serviço Extra (Fora de Escopo) */}
      <CatalogServicePickerModal
        open={isOutOfScopePickerOpen}
        onOpenChange={setIsOutOfScopePickerOpen}
        variant="out-of-scope"
        title="Lançar Serviço Extra (Fora de Escopo)"
        description="Selecione o serviço, material ou diária do seu catálogo. Como este item não consta no escopo previsto da obra, será obrigatório anexar foto de evidência e justificativa detalhada."
        items={outOfScopePickerItems}
        onSelect={handleSelectOutOfScopeService}
        footerAction={{
          label: "+ Adicionar Item Manual em Branco",
          onClick: () => {
            setIsOutOfScopePickerOpen(false)
            addManualItem("labor")
          },
        }}
      />
    </div>
  )
}

export default NewMeasurementPage