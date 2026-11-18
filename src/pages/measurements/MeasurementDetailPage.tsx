import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Share2,
  Pencil,
  Trash2,
  Printer,
  Download,
  AlertCircle,
  AlertTriangle,
  FolderKanban,
  User,
  Copy,
  Check,
  X,
  Camera,
  MoreHorizontal,
  FileText,
  Car,
  Hotel,
  Utensils,
  Wrench,
  ExternalLink,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MeasurementStatusBadge } from "./components/MeasurementStatusBadge"
import { ShareLinkModal } from "./components/ShareLinkModal"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useAuthStore } from "@/stores/authStore"
import { useRecentAccessStore } from "@/stores/recentAccessStore"
import { EXCEEDED_REASON_LABELS } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"
import { exportMeasurementToPDF, exportMeasurementsToCSV } from "@/utils/exportUtils"
import { toast } from "@/components/ui/use-toast"

export function MeasurementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useSmartBack("/medicoes")
  const {
    measurements,
    deleteMeasurement,
    openShareModal,
    shareModalMeasurement,
    closeShareModal,
    updateStatus,
    updateItemAuditStatus,
  } = useMeasurementsStore()
  const user = useAuthStore((s) => s.user)
  const trackMeasurementView = useRecentAccessStore((s) => s.trackMeasurementView)

  const [isDeleting, setIsDeleting] = useState(false)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)

  const canAudit =
    user?.role === "MANAGER" ||
    user?.role === "PROJECT_SUPERVISOR" ||
    user?.role === "MASTER"

  const measurement = measurements.find((m) => m.id === id)

  useEffect(() => {
    if (measurement && user?.id) {
      trackMeasurementView(measurement.id, user.id)
    }
  }, [measurement?.id, user?.id, trackMeasurementView])

  if (!measurement) {
    return (
      <PageContainer className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Medição não encontrada</h2>
        <p className="text-sm text-slate-500">
          A medição solicitada não existe ou foi removida.
        </p>
        <Button onClick={() => goBack("/medicoes")} variant="outline">
          Voltar para Medições
        </Button>
      </PageContainer>
    )
  }

  const canEdit = measurement.status !== "approved"
  const isDraft = measurement.status === "draft"
  const effectiveSignatureUrl = measurement.signatureUrl || user?.signatureUrl
  const effectiveSignatureName =
    measurement.signatureName ||
    user?.signatureName ||
    measurement.collaboratorName ||
    "Profissional Responsável"

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/#/medicoes/${measurement.id}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "Link Copiado",
      description: "O link direto da medição foi copiado para sua área de transferência.",
      variant: "success",
    })
  }

  const handleFinalize = () => {
    updateStatus(measurement.id, "pending")
  }

  const handleDelete = () => {
    deleteMeasurement(measurement.id)
    goBack("/medicoes")
  }

  return (
    <PageContainer className="max-w-4xl space-y-6 pb-20">
      {/* 1. Header Superior Responsivo: Navegação + Identificação + Ações */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
        {/* Barra superior de status e navegação */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBack()}
            className="h-8 -ml-2 text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
            title="Voltar para a página anterior"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              #{measurement.id}
            </span>
            <MeasurementStatusBadge status={measurement.status} />
          </div>
        </div>

        {/* Informações Principais da Medição */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-1">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug break-words">
              {measurement.title}
            </h1>

            {/* Metadados rápidos em chips com quebra fluida */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{measurement.clientName || "Cliente não informado"}</span>
              </div>

              {measurement.projectId && (
                <Link
                  to={`/projetos/${measurement.projectId}/dashboard`}
                  className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {measurement.projectTitle || "Ver Obra"}
                  </span>
                </Link>
              )}

              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{measurement.date}</span>
              </div>

              {measurement.location && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[220px]">{measurement.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Ações: Destaques e Dropdown "Mais Ações" */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-start justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Ação Primária: Finalizar se estiver como Rascunho */}
            {isDraft && (
              <Button
                size="sm"
                onClick={handleFinalize}
                className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex-1 sm:flex-initial"
              >
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Finalizar Medição</span>
              </Button>
            )}

            {/* Ação de Edição */}
            {canEdit && (
              <Button
                size="sm"
                onClick={() => navigate(`/medicoes/editar/${measurement.id}`)}
                className="h-9 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs flex-1 sm:flex-initial"
              >
                <Pencil className="h-3.5 w-3.5 text-amber-400" />
                <span>Editar</span>
              </Button>
            )}

            {/* Dropdown Menu com Ações Secundárias (Compartilhar, Exportar, Imprimir, Excluir) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-300 text-slate-600 hover:text-slate-900"
                  title="Opções do documento"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => openShareModal(measurement)}>
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  <span>Link de Compartilhamento</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    exportMeasurementToPDF({
                      ...measurement,
                      signatureUrl: effectiveSignatureUrl,
                      signatureName: effectiveSignatureName,
                    })
                  }
                >
                  <Printer className="h-4 w-4 text-blue-600" />
                  <span>Imprimir / Salvar PDF</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    exportMeasurementsToCSV([measurement], `medicao-${measurement.id}.csv`)
                  }
                >
                  <Download className="h-4 w-4 text-slate-600" />
                  <span>Exportar Planilha CSV</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span>Copiar Link Direto</span>
                </DropdownMenuItem>

                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleting(true)}
                      className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                      <span>Excluir Medição</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Confirmação de exclusão inline */}
      {isDeleting && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
          <div>
            <strong className="block font-bold">Deseja realmente excluir esta medição?</strong>
            <span>Esta ação não poderá ser desfeita. Todos os lançamentos deste documento serão removidos.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleting(false)}
              className="h-8 text-xs bg-white"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, Excluir Medição
            </Button>
          </div>
        </div>
      )}

      {/* Alerta de solicitação de ajuste (rework) */}
      {measurement.status === "rework" && measurement.reworkNote && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50/90 p-4 text-xs text-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-orange-800">
              Instruções de Ajuste do Encarregado / Gestor:
            </span>
            <p className="text-orange-900 leading-relaxed font-medium">{measurement.reworkNote}</p>
          </div>
        </div>
      )}

      {/* 2. DOCUMENTO PRINCIPAL (Estilo Laudo Técnico / Fatura) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-xs space-y-6">
        {/* Metadados Detalhados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                Obra / Projeto:
              </span>
              {measurement.projectId ? (
                <Link
                  to={`/projetos/${measurement.projectId}/dashboard`}
                  className="font-bold text-slate-900 hover:text-amber-600 transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{measurement.projectTitle || "Acessar Projeto"}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
              ) : (
                <span className="font-bold text-slate-800 block mt-0.5">
                  Avulsa (Sem obra vinculada)
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                Cliente / Faturamento:
              </span>
              <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{measurement.clientName || "Cliente não informado"}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                Profissional Responsável:
              </span>
              <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{measurement.collaboratorName || "Lançamento do Gestor"}</span>
              </p>
            </div>

            {measurement.location && (
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                  Localidade / Endereço:
                </span>
                <p className="text-slate-700 mt-0.5 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{measurement.location}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Itens e Serviços */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Serviços e Metragens Aferidas ({measurement.items.length})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-700">
              Subtotal: {formatCurrency(measurement.servicesTotal)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Serviço Cadastrado</th>
                  <th className="p-3.5">Variação / Material</th>
                  <th className="p-3.5 text-center">Quantidade</th>
                  <th className="p-3.5 text-right">Unitário</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurement.items.map((item, index) => {
                  const hasAuditAlert = item.isExceeded || item.isOutOfScope

                  return (
                    <tr key={item.id || index} className="group">
                      <td colSpan={5} className="p-0">
                        <div
                          className={`flex items-center justify-between p-3.5 ${
                            hasAuditAlert ? "bg-amber-50/25" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {item.serviceName}
                              </span>
                              {item.isOutOfScope && (
                                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase">
                                  Fora de Escopo
                                </Badge>
                              )}
                              {item.isExceeded && item.exceededQuantity && (
                                <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-bold">
                                  Excedente: +{item.exceededQuantity.toFixed(2)} {item.unit}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 text-slate-500 text-[11px]">
                              {item.materialName ? (
                                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                                  {item.materialName}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Padrão da obra</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0 text-right">
                            <div className="w-24 text-center font-mono font-semibold text-slate-800">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="w-24 font-mono text-slate-700">
                              {formatCurrency(item.unitPrice)}
                            </div>
                            <div className="w-28 font-mono font-bold text-slate-900">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        </div>

                        {/* Bloco de Auditoria do Item */}
                        {hasAuditAlert && (
                          <div className="bg-amber-50/30 px-3.5 pb-3 pt-0 border-b border-amber-100">
                            <div className="rounded-lg border border-amber-200/90 bg-white/95 p-3 text-xs space-y-2.5 shadow-2xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                    Auditoria de Item:
                                  </span>
                                  {item.auditStatus === "pending" && (
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                                      Auditoria Pendente
                                    </Badge>
                                  )}
                                  {item.auditStatus === "approved" && (
                                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-bold">
                                      Item Aprovado
                                    </Badge>
                                  )}
                                  {item.auditStatus === "rejected" && (
                                    <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px] font-bold">
                                      Item Rejeitado
                                    </Badge>
                                  )}
                                </div>

                                {canAudit && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={item.auditStatus === "approved"}
                                      onClick={() =>
                                        updateItemAuditStatus(
                                          measurement.id,
                                          item.id,
                                          "approved"
                                        )
                                      }
                                      className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 px-2.5"
                                    >
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      Aprovar {item.isOutOfScope ? "Extra" : "Excedente"}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={item.auditStatus === "rejected"}
                                      onClick={() =>
                                        updateItemAuditStatus(
                                          measurement.id,
                                          item.id,
                                          "rejected"
                                        )
                                      }
                                      className="h-7 text-[11px] font-semibold text-rose-700 border-rose-300 hover:bg-rose-50 gap-1 px-2.5"
                                    >
                                      <X className="h-3.5 w-3.5 text-rose-600" />
                                      Rejeitar {item.isOutOfScope ? "Extra" : "Excedente"}
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-9 space-y-1">
                                  {item.exceededReason && (
                                    <p className="text-[11px] text-slate-600">
                                      <strong>Motivo do Excedente:</strong>{" "}
                                      <span className="text-slate-800">
                                        {EXCEEDED_REASON_LABELS[item.exceededReason] ||
                                          item.exceededReason}
                                      </span>
                                    </p>
                                  )}
                                  {item.justificationNotes && (
                                    <p className="text-[11px] text-slate-600 italic">
                                      <strong>Justificativa do instalador:</strong> &ldquo;
                                      {item.justificationNotes}&rdquo;
                                    </p>
                                  )}
                                </div>

                                {item.evidencePhotoUrl && (
                                  <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
                                    <Button
                                      type="button"
                                      variant="unstyled"
                                      size="auto"
                                      onClick={() =>
                                        setPreviewPhotoUrl(item.evidencePhotoUrl || null)
                                      }
                                      className="group relative rounded-lg border border-slate-200 overflow-hidden hover:border-amber-400 transition-all shadow-2xs"
                                      title="Clique para ampliar a foto de evidência da obra"
                                    >
                                      <img
                                        src={item.evidencePhotoUrl}
                                        alt="Foto de Evidência"
                                        className="h-12 w-20 object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="h-3.5 w-3.5 text-white" />
                                      </div>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Despesas Operacionais de Campo */}
        {measurement.operationalCosts && measurement.costsTotal > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Car className="h-4 w-4 text-slate-400" />
                <span>Custos Operacionais e Despesas Anexadas</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700">
                Total Custos: {formatCurrency(measurement.costsTotal)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {measurement.operationalCosts.transport ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <Car className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Transporte</span>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(measurement.operationalCosts.transport)}
                      </strong>
                    </div>
                  </div>
                ) : null}

                {measurement.operationalCosts.lodging ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <Hotel className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Hospedagem</span>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(measurement.operationalCosts.lodging)}
                      </strong>
                    </div>
                  </div>
                ) : null}

                {measurement.operationalCosts.food ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <Utensils className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Alimentação</span>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(measurement.operationalCosts.food)}
                      </strong>
                    </div>
                  </div>
                ) : null}

                {measurement.operationalCosts.extraSetup ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <Wrench className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Setup / Risco</span>
                      <strong className="font-mono text-slate-900">
                        {formatCurrency(measurement.operationalCosts.extraSetup)}
                      </strong>
                    </div>
                  </div>
                ) : null}
              </div>

              {measurement.operationalCosts.notes && (
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 block text-[11px]">
                    Justificativa dos Custos Operacionais:
                  </span>
                  <p className="italic text-slate-800 leading-relaxed">
                    {measurement.operationalCosts.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Totais Finais e Fechamento */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Documento emitido pelo <strong>MediPro</strong> • Sistema de Medições &amp; Obras
          </div>

          <div className="flex items-baseline justify-between sm:justify-end gap-3 rounded-xl bg-slate-900 text-white p-3.5 px-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total do Documento:
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {formatCurrency(measurement.grandTotal)}
            </span>
          </div>
        </div>

        {/* Bloco de Assinaturas Digitais & Validação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          <div>
            <div className="h-16 flex items-end justify-center pb-1.5">
              {effectiveSignatureUrl && (
                <img
                  src={effectiveSignatureUrl}
                  alt={`Assinatura digital de ${effectiveSignatureName}`}
                  className="max-h-14 max-w-[220px] object-contain"
                />
              )}
            </div>
            <div className="border-t border-slate-300 pt-2">
              <p className="font-bold text-slate-800">{effectiveSignatureName}</p>
              <p className="text-[11px] text-slate-400">
                Executor / Responsável pela Medição
              </p>
            </div>
          </div>

          <div>
            <div className="h-16" />
            <div className="border-t border-slate-300 pt-2">
              <p className="font-bold text-slate-800">
                {measurement.clientName || "Cliente / Fiscal da Obra"}
              </p>
              <p className="text-[11px] text-slate-400">
                Aprovação / Conferência da Obra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compartilhamento WhatsApp */}
      <ShareLinkModal
        measurement={shareModalMeasurement}
        onClose={closeShareModal}
      />

      {/* Modal Lightbox para visualização de foto de evidência */}
      <Dialog
        open={!!previewPhotoUrl}
        onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}
      >
        <DialogContent
          onClose={() => setPreviewPhotoUrl(null)}
          className="max-w-2xl p-4 bg-white"
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-amber-600" />
              Foto de Evidência da Obra
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[70vh]">
            <img
              src={previewPhotoUrl || ""}
              alt="Foto de Evidência da Obra"
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default MeasurementDetailPage
