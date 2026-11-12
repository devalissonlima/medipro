import { Plus, CheckCircle2, AlertCircle, Layers, DollarSign, Tag } from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useServices } from "./hooks/useServices"
import { ServiceCard } from "./components/ServiceCard"
import { ServiceTable } from "./components/ServiceTable"
import { ServiceFilters } from "./components/ServiceFilters"
import { ServicesEmptyState } from "./components/ServicesEmptyState"
import { ServiceFormModal } from "./components/ServiceFormModal"

export function ServicesPage() {
  const {
    services,
    totalCount,
    filteredCount,
    categoryCounts,
    searchTerm,
    selectedCategory,
    viewMode,
    notification,
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    openCreateModal,
    openEditModal,
    deleteService,
    dismissNotification,
    clearFilters,
  } = useServices()

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
    <PageContainer>
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs shadow-sm border transition-all animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : notification.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-slate-100 text-slate-800 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-xs font-semibold hover:underline px-2 py-0.5"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header com Ação Principal */}
      <PageHeader
        title="Catálogo de Serviços"
        description="Tabela base de preços para mão de obra e acabamentos. Estes serviços alimentam o lançamento de medições e orçamentos."
        badge={
          <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-300">
            Tabela de Referência
          </Badge>
        }
        actions={
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-xs font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        }
      />

      {/* Métricas Rápidas do Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Categorias em Uso</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {Object.keys(categoryCounts).length - 1}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Tag className="h-5 w-5" />
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

      {/* Modal / Sheet de Cadastro e Edição */}
      <ServiceFormModal />

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
