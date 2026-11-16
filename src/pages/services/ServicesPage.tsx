import { useState, useMemo } from "react"
import { Plus, Layers, DollarSign, Sparkles } from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"
import { useMasterCatalogStore } from "@/stores/masterCatalogStore"
import { useServices } from "./hooks/useServices"
import { ServiceCard } from "./components/ServiceCard"
import { ServiceTable } from "./components/ServiceTable"
import { ServiceFilters } from "./components/ServiceFilters"
import { ServicesEmptyState } from "./components/ServicesEmptyState"
import { ServiceFormModal } from "./components/ServiceFormModal"
import { CompanyServicesTab } from "./components/CompanyServicesTab"
import { ServicePricingWizardModal } from "./components/ServicePricingWizardModal"
import type { MasterServiceType } from "@/types/catalog"

export function ServicesPage() {
  const user = useAuthStore((state) => state.user)
  const isMember = user?.role === "MEMBER"

  const masterServices = useMasterCatalogStore((state) => state.services)

  const {
    services,
    totalCount,
    filteredCount,
    categoryCounts,
    searchTerm,
    selectedCategory,
    viewMode,
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    openCreateModal,
    openEditModal,
    deleteService,
    clearFilters,
  } = useServices()

  // Controle de Abas exclusivo para o perfil MEMBER
  const [activeTab, setActiveTab] = useState<"my-services" | "company-services">("my-services")

  // Estado do Modal de Precificação Guiada (Wizard)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [servicesToPrice, setServicesToPrice] = useState<MasterServiceType[]>([])

  // Quantidade de serviços da empresa ainda não importados pelo membro
  const unimportedCount = useMemo(() => {
    if (!isMember) return 0
    const importedIds = new Set(services.map((s) => s.masterServiceId).filter(Boolean))
    const importedNames = new Set(services.map((s) => s.name.toLowerCase().trim()))
    return masterServices.filter(
      (m) => !importedIds.has(m.id) && !importedNames.has(m.name.toLowerCase().trim())
    ).length
  }, [isMember, masterServices, services])

  const handleStartWizard = (selectedServices: MasterServiceType[]) => {
    setServicesToPrice(selectedServices)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setServicesToPrice([])
  }

  const handleWizardComplete = () => {
    setIsWizardOpen(false)
    setServicesToPrice([])
    // Volta automaticamente para a aba "Meus Serviços"
    setActiveTab("my-services")
  }

  // Média de preços e métricas rápidas
  const averagePrice =
    totalCount > 0
      ? services.reduce((acc, s) => acc + s.basePrice, 0) / (services.length || 1)
      : 0

  const formattedAveragePrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(averagePrice)

  return (
    <PageContainer className="space-y-6 pb-20">
      {/* Header com Ação Principal */}
      <PageHeader
        title="Catálogo de Serviços"
        description="Tabela base de preços e serviços para mão de obra e acabamentos. Cadastre seus serviços para alimentar medições e orçamentos."
        actions={
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-xs font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            Novo Serviço Avulso
          </Button>
        }
      />

      {/* Navegação em Sub-abas (Exclusiva para MEMBER) */}
      {isMember && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("my-services")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === "my-services"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Meus Serviços</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "my-services"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("company-services")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === "company-services"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Serviços da Empresa</span>
            {unimportedCount > 0 ? (
              <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold">
                {unimportedCount} novos
              </span>
            ) : (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "company-services"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {masterServices.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Conteúdo da Aba Ativa */}
      {isMember && activeTab === "company-services" ? (
        <CompanyServicesTab onStartWizard={handleStartWizard} />
      ) : (
        <div className="space-y-6">
          {/* Métricas Rápidas do Catálogo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-slate-200/80 shadow-2xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Serviços Ativos</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Layers className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-2xs bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Preço Médio Unitário</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {formattedAveragePrice}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de Filtros e Categorias */}
          <ServiceFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            viewMode={viewMode}
            categoryCounts={categoryCounts}
            totalCount={totalCount}
            filteredCount={filteredCount}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
          />

          {/* Conteúdo Principal (Cards ou Tabela) */}
          {services.length === 0 ? (
            <ServicesEmptyState
              isFiltered={searchTerm !== "" || selectedCategory !== "Todas"}
              onResetFilters={clearFilters}
              onOpenCreate={openCreateModal}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={openEditModal}
                  onDelete={deleteService}
                />
              ))}
            </div>
          ) : (
            <ServiceTable
              services={services}
              onEdit={openEditModal}
              onDelete={deleteService}
            />
          )}
        </div>
      )}

      {/* Modal / Sheet de Cadastro e Edição Manual */}
      <ServiceFormModal />

      {/* Modal de Precificação Guiada (Wizard) */}
      <ServicePricingWizardModal
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onComplete={handleWizardComplete}
        servicesToPrice={servicesToPrice}
      />

      {/* Botão Flutuante (FAB) no Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <Button
          onClick={openCreateModal}
          size="icon"
          className="h-14 w-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800"
          aria-label="Adicionar novo serviço"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PageContainer>
  )
}
