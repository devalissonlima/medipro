import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClientMetrics } from "./components/ClientMetrics"
import { ClientFilters } from "./components/ClientFilters"
import { ClientCard } from "./components/ClientCard"
import { ClientTable } from "./components/ClientTable"
import { ClientFormModal } from "./components/ClientFormModal"
import { ClientHistoryDrawer } from "./components/ClientHistoryDrawer"
import { ClientsEmptyState } from "./components/ClientsEmptyState"
import { useClients } from "./hooks/useClients"

export function ClientsPage() {
  const {
    clients,
    allClients,
    metrics,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    typeCounts,
    viewMode,
    setViewMode,
    notification,
    openCreateModal,
    openEditModal,
    openHistoryDrawer,
    deleteClient,
    handleCreateMeasurementForClient,
    clearFilters,
    dismissNotification,
  } = useClients()

  return (
    <PageContainer className="space-y-6 pb-24">
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

      {/* Cabeçalho do Módulo */}
      <PageHeader
        title="Meus Clientes"
        description="Mini CRM operacional para autônomos e empreiteiras. Centralize os contatos, endereços de obras e histórico consolidado de medições."
        badge={
          <Badge variant="outline" className="text-purple-800 bg-purple-50 border-purple-300 gap-1.5 font-semibold text-xs">
            <Building2 className="h-3.5 w-3.5 text-purple-600" />
            Mini CRM & Carteira
          </Badge>
        }
        actions={
          <Button
            type="button"
            onClick={openCreateModal}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 px-4 shadow-sm"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Novo Cliente</span>
          </Button>
        }
      />

      {/* 1. KPIs Rápidos do Topo */}
      <ClientMetrics metrics={metrics} />

      {/* 2. Barra de Ferramentas e Filtros */}
      <ClientFilters
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        typeCounts={typeCounts}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onTypeChange={setTypeFilter}
        onViewModeChange={setViewMode}
        onOpenCreate={openCreateModal}
        onClearFilters={clearFilters}
      />

      {/* 3. Listagem de Clientes (Grid ou Tabela) */}
      {clients.length === 0 ? (
        <ClientsEmptyState
          onClearFilters={clearFilters}
          onOpenCreate={openCreateModal}
          isFiltered={searchQuery !== "" || typeFilter !== "all"}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              Clientes Listados ({clients.length})
            </span>
            <span className="text-xs text-slate-400">
              Total na carteira: {allClients.length}
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={openEditModal}
                  onOpenHistory={openHistoryDrawer}
                  onCreateMeasurement={handleCreateMeasurementForClient}
                  onDelete={deleteClient}
                />
              ))}
            </div>
          ) : (
            <ClientTable
              clients={clients}
              onEdit={openEditModal}
              onOpenHistory={openHistoryDrawer}
              onCreateMeasurement={handleCreateMeasurementForClient}
              onDelete={deleteClient}
            />
          )}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <ClientFormModal />

      {/* Drawer / Modal de Histórico de Medições do Cliente */}
      <ClientHistoryDrawer />
    </PageContainer>
  )
}
