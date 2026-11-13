import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  X,
  Ruler,
  CheckCircle2,
  Clock,
  DollarSign,
  FileEdit,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useMeasurements } from "./hooks/useMeasurements"
import { MeasurementTable } from "./components/MeasurementTable"
import { MeasurementDetailModal } from "./components/MeasurementDetailModal"
import { ShareLinkModal } from "./components/ShareLinkModal"
import type { MeasurementStatus } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

export function MeasurementsPage() {
  const navigate = useNavigate()

  const {
    measurements,
    metrics,
    searchTerm,
    statusFilter,
    selectedMeasurement,
    shareModalMeasurement,
    setSearchTerm,
    setStatusFilter,
    deleteMeasurement,
    duplicateMeasurement,
    finalizeMeasurement,
    openDetailModal,
    closeDetailModal,
    openShareModal,
    closeShareModal,
    copyShareLink,
  } = useMeasurements()

  const statusOptions: {
    label: string
    value: MeasurementStatus | "all"
    count: number
  }[] = [
    { label: "Todas", value: "all", count: metrics.totalCount },
    { label: "Rascunhos", value: "draft", count: metrics.draftCount },
    { label: "Pendentes", value: "pending", count: metrics.pendingCount },
    { label: "Aprovadas", value: "approved", count: metrics.approvedCount },
    { label: "Para Ajustar", value: "rework", count: metrics.reworkCount },
  ]

  const handleEditMeasurement = (id: string) => {
    navigate(`/medicoes/editar/${id}`)
  }

  return (
    <PageContainer>
      {/* Header com Ação Principal */}
      <PageHeader
        title="Medições & Orçamentos"
        description="Gestão de medições de campo, rascunhos em elaboração e envio ágil para conferência e liquidação."
        actions={
          <Button
            onClick={() => navigate("/medicoes/nova")}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-xs font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            Nova Medição
          </Button>
        }
      />

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rascunhos em Elaboração */}
        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Rascunhos (Salvos)</p>
              <h3 className="text-2xl font-bold text-slate-700 mt-0.5">
                {metrics.draftCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileEdit className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Aguardando Aprovação</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-0.5">
                {metrics.pendingCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Aprovadas */}
        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Valor Aprovado</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5 font-mono">
                {formatCurrency(metrics.approvedValue)}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Faturamento Geral */}
        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Volume Total</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                {formatCurrency(metrics.totalValue)}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Busca Textual */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nome da obra, cliente ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-10 border-slate-200 bg-white shadow-2xs focus-visible:ring-amber-500 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Abas de Status com Rascunhos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? "bg-slate-800 text-amber-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal / Tabela */}
      {measurements.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-3">
            <Ruler className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Nenhuma medição encontrada
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
            {searchTerm || statusFilter !== "all"
              ? "Tente alterar os filtros de busca ou status para visualizar os orçamentos."
              : "Lance uma medição ou salve um rascunho para continuar editando e enviar mais tarde."}
          </p>
          <div className="mt-5">
            <Button
              onClick={() => navigate("/medicoes/nova")}
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Criar Nova Medição
            </Button>
          </div>
        </div>
      ) : (
        <MeasurementTable
          measurements={measurements}
          onOpenDetail={openDetailModal}
          onEdit={handleEditMeasurement}
          onOpenShare={openShareModal}
          onCopyLink={copyShareLink}
          onDuplicate={duplicateMeasurement}
          onDelete={deleteMeasurement}
          onFinalize={finalizeMeasurement}
        />
      )}

      {/* Modal de Detalhes da Medição */}
      <MeasurementDetailModal
        measurement={selectedMeasurement}
        onClose={closeDetailModal}
        onEdit={(m) => {
          closeDetailModal()
          handleEditMeasurement(m.id)
        }}
        onDelete={(id) => {
          deleteMeasurement(id)
          closeDetailModal()
        }}
        onOpenShare={(m) => {
          closeDetailModal()
          openShareModal(m)
        }}
      />

      {/* Modal de Link Compartilhável para WhatsApp */}
      <ShareLinkModal
        measurement={shareModalMeasurement}
        onClose={closeShareModal}
      />
    </PageContainer>
  )
}

export default MeasurementsPage
