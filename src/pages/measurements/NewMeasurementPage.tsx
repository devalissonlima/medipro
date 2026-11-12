import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Ruler,
  Search,
  FolderKanban,
  AlertTriangle,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useMeasurementForm } from "./hooks/useMeasurementForm"
import { ClientSelector } from "./components/form/ClientSelector"
import { ServiceItemRow } from "./components/form/ServiceItemRow"
import { OperationalCostsCard } from "./components/form/OperationalCostsCard"
import { SummaryFooter } from "./components/form/SummaryFooter"
import { useServicesStore } from "@/stores/servicesStore"
import type { ServiceItem } from "@/types/service"
import { formatCurrency } from "@/utils/calculations"

export function NewMeasurementPage() {
  const navigate = useNavigate()
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
    costsTotal,
    grandTotal,
    addItemFromService,
    updateItem,
    removeItem,
    updateOperationalCost,
    handleSaveDraft,
    handleFinalizeAndShare,
  } = useMeasurementForm()

  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false)
  const [servicePickerSearch, setServicePickerSearch] = useState("")

  const filteredCatalog = catalogServices.filter(
    (s) =>
      s.name.toLowerCase().includes(servicePickerSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(servicePickerSearch.toLowerCase())
  )

  const handleSelectService = (service: ServiceItem) => {
    addItemFromService(service)
    setIsServicePickerOpen(false)
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
              onClick={() => navigate("/medicoes")}
              className="h-9 w-9 text-slate-600 hover:text-slate-900 border-slate-300"
              title="Voltar para medições"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {isEditing ? "Editar Medição" : "Nova Medição & Orçamento"}
                </h1>
                <Badge
                  className={`text-[10px] font-bold ${
                    isEditing
                      ? "bg-blue-600 text-white"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  }`}
                >
                  {isEditing ? "Modo de Edição" : "Cálculo Instantâneo"}
                </Badge>
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
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                2
              </span>
              Serviços, Materiais & Metragens ({items.length})
            </CardTitle>

            {!isApproved && (
              <Button
                type="button"
                onClick={() => setIsServicePickerOpen(true)}
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-9 px-3.5 shadow-sm"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                Adicionar Serviço
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {errors.items && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {errors.items}
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
                    Clique em "+ Adicionar Serviço" para selecionar itens do catálogo base (cortes, assentamento, polimento).
                  </p>
                </div>
                {!isApproved && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsServicePickerOpen(true)}
                    className="text-xs border-slate-300 text-slate-800 hover:bg-slate-100 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Selecionar do Catálogo de Serviços
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <ServiceItemRow
                    key={item.id}
                    index={idx}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
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

      {/* Modal / Diálogo Seletor de Serviços do Catálogo */}
      <Dialog open={isServicePickerOpen} onOpenChange={setIsServicePickerOpen}>
        <DialogContent onClose={() => setIsServicePickerOpen(false)} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar Serviço do Catálogo</DialogTitle>
            <DialogDescription>
              Selecione o serviço executado para puxar a unidade e o preço base cadastrado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Filtrar por nome ou categoria..."
                value={servicePickerSearch}
                onChange={(e) => setServicePickerSearch(e.target.value)}
                className="pl-9 text-xs"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleSelectService(service)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 text-left hover:border-amber-400 hover:bg-amber-50/40 transition-colors group shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs group-hover:text-amber-900">
                        {service.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50 text-slate-600 border-slate-200"
                      >
                        {service.category}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono font-bold text-slate-900 text-xs block">
                      {formatCurrency(service.basePrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      por {service.unit}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewMeasurementPage
