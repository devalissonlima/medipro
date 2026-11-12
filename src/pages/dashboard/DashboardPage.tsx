import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  Square,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardMetrics } from "./components/DashboardMetrics"
import { DashboardFilters } from "./components/DashboardFilters"
import { MeasurementReviewRow } from "./components/MeasurementReviewRow"
import { BulkApprovalBar } from "./components/BulkApprovalBar"
import { RequestReworkModal } from "./components/RequestReworkModal"
import { DashboardEmptyState } from "./components/DashboardEmptyState"
import { useDashboardMetrics } from "./hooks/useDashboardMetrics"
import { useDashboardFilters } from "./hooks/useDashboardFilters"

export function DashboardPage() {
  const {
    period,
    setPeriod,
    projectId,
    setProjectId,
    projects,
    memberId,
    setMemberId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredMeasurements,
    allMeasurements,
    selectedIds,
    pendingFilteredIds,
    bulkSelectedTotal,
    reworkMeasurementId,
    notification,
    toggleSelect,
    selectAllPending,
    clearSelection,
    executeBulkApproval,
    approveSingle,
    openReworkModal,
    closeReworkModal,
    confirmRework,
    clearFilters,
    dismissNotification,
  } = useDashboardFilters()

  // KPIs dinâmicos calculados a partir das medições no escopo
  const metrics = useDashboardMetrics(filteredMeasurements)

  // Contadores por status para as tabs
  const statusCounts = {
    all: allMeasurements.length,
    pending: allMeasurements.filter((m) => m.status === "pending").length,
    approved: allMeasurements.filter((m) => m.status === "approved").length,
    rework: allMeasurements.filter((m) => m.status === "rework").length,
  }

  const isAllPendingSelected =
    pendingFilteredIds.length > 0 &&
    selectedIds.length === pendingFilteredIds.length

  return (
    <PageContainer className="pb-28 space-y-6">
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

      {/* Cabeçalho da Central do Gestor */}
      <PageHeader
        title="Dashboard do Gestor"
        description="Auditoria de medições, conferência de metragens e liquidação financeira de serviços enviados pelas equipes de campo."
        badge={
          <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            Central de Comando
          </Badge>
        }
      />

      {/* 1. KPIs do Topo */}
      <DashboardMetrics metrics={metrics} />

      {/* 2. Filtros e Controle Temporal */}
      <DashboardFilters
        period={period}
        projectId={projectId}
        projects={projects}
        memberId={memberId}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        onPeriodChange={setPeriod}
        onProjectChange={setProjectId}
        onMemberChange={setMemberId}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      {/* 3. Painel de Gestão e Aprovação de Medições */}
      <div className="space-y-3">
        {/* Barra de controle da lista */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {pendingFilteredIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAllPending}
                className="text-xs text-slate-600 hover:text-slate-900 h-8 px-2 gap-1.5"
              >
                {isAllPendingSelected ? (
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>
                  {isAllPendingSelected
                    ? "Desmarcar Pendentes"
                    : `Selecionar Pendentes (${pendingFilteredIds.length})`}
                </span>
              </Button>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Exibindo {filteredMeasurements.length} de {allMeasurements.length} medições
          </span>
        </div>

        {/* Lista de Linhas Compactas Expansíveis */}
        {filteredMeasurements.length === 0 ? (
          <DashboardEmptyState onClearFilters={clearFilters} />
        ) : (
          <div className="space-y-2.5">
            {filteredMeasurements.map((measurement) => (
              <MeasurementReviewRow
                key={measurement.id}
                measurement={measurement}
                isSelected={selectedIds.includes(measurement.id)}
                onToggleSelect={toggleSelect}
                onApprove={approveSingle}
                onRequestRework={openReworkModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Barra Flutuante de Ação em Lote (Bulk Approval Bar) */}
      <BulkApprovalBar
        selectedCount={selectedIds.length}
        totalAmount={bulkSelectedTotal}
        onClearSelection={clearSelection}
        onBulkApprove={executeBulkApproval}
      />

      {/* Modal para Devolução / Solicitação de Revisão */}
      <RequestReworkModal
        isOpen={!!reworkMeasurementId}
        onClose={closeReworkModal}
        onConfirm={confirmRework}
      />
    </PageContainer>
  )
}
