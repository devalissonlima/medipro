import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Send,
  XCircle,
  FolderPlus,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Building2,
  FolderKanban,
  MoreHorizontal,
  Share2,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore"
import { useBudgetsStore } from "@/stores/budgetsStore"
import { useBrandingStore } from "@/stores/brandingStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/utils/calculations"
import { formatShortDatePtBr } from "@/utils/dateGrouping"
import { getProjectUrl } from "@/utils/projectRoutes"
import { BUDGET_STATUS_CONFIG, BUDGET_TYPE_CONFIG } from "@/types/budget"
import type { CatalogItemType } from "@/types/catalog"

interface BudgetDetailPageProps {
  isPublicView?: boolean
}

const SECTION_META: Record<
  CatalogItemType,
  { title: string; badgeClass: string }
> = {
  labor: {
    title: "Serviços & Mão de Obra",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  material: {
    title: "Materiais & Insumos",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  subcontract: {
    title: "Equipe Auxiliar & Terceiros",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
}

export function BudgetDetailPage({ isPublicView = false }: BudgetDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useSmartBack("/orcamentos")

  const user = useAuthStore((state) => state.user)
  const {
    budgets,
    updateBudgetStatus,
    deleteBudget,
    convertBudgetToProject,
    ensureSeedData,
  } = useBudgetsStore()
  const getBrandIdentity = useBrandingStore((state) => state.getBrandIdentity)
  const clients = useClientsStore((state) => state.clients)
  const projects = useProjectsStore((state) => state.projects)

  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    ensureSeedData()
  }, [ensureSeedData])

  const budget = useMemo(
    () => budgets.find((b) => b.id === id) || null,
    [budgets, id]
  )

  if (!budget) {
    return (
      <PageContainer className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Orçamento / Proposta não encontrada
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          O link pode estar incorreto ou o orçamento foi removido do sistema.
        </p>
        {!isPublicView && (
          <Button variant="outline" onClick={() => goBack("/orcamentos")}>
            Voltar para Orçamentos
          </Button>
        )}
      </PageContainer>
    )
  }

  const brand = getBrandIdentity(budget.tenantId)
  const client = clients.find((c) => c.id === budget.clientId)
  const linkedProject = budget.projectId
    ? projects.find((p) => p.id === budget.projectId)
    : null

  const statusInfo = BUDGET_STATUS_CONFIG[budget.status]
  const typeInfo = BUDGET_TYPE_CONFIG[budget.budgetType]

  const isSupervisor = user?.role === "PROJECT_SUPERVISOR"
  const canManageStatus =
    !isPublicView &&
    (user?.role === "MANAGER" ||
      user?.role === "SOLO" ||
      user?.role === "MASTER")
  const canEdit = !isPublicView && (!isSupervisor || budget.status === "draft")
  const canConvert =
    canManageStatus && budget.status === "approved" && !budget.projectId

  const effectiveSignatureUrl = budget.signatureUrl || user?.signatureUrl
  const effectiveSignatureName =
    budget.signatureName || user?.signatureName || brand.companyName

  const groupedItems: Record<CatalogItemType, typeof budget.items> = {
    labor: budget.items.filter((i) => i.itemType === "labor"),
    material: budget.items.filter((i) => i.itemType === "material"),
    subcontract: budget.items.filter((i) => i.itemType === "subcontract"),
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/#/proposta/${budget.id}`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link de Compartilhamento Copiado!",
      description:
        "Envie este link pelo WhatsApp para que o cliente visualize a proposta timbrada.",
      variant: "success",
    })
  }

  const handleCopyDirectLink = () => {
    const fullUrl = `${window.location.origin}/#/orcamentos/${budget.id}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "Link Direto Copiado",
      description:
        "O link interno do orçamento foi copiado para sua área de transferência.",
      variant: "success",
    })
  }

  const handleConvert = () => {
    const maxMembers = user?.role === "SOLO" ? 1 : 5
    const createdProject = convertBudgetToProject(budget.id, { maxMembers })
    if (createdProject) {
      navigate(getProjectUrl(createdProject, "dashboard"))
    }
  }

  const handleDelete = () => {
    deleteBudget(budget.id)
    goBack("/orcamentos")
  }

  const content = (
    <>
      {/* 1. HEADER SUPERIOR RESPONSIVO (Padrão Visual de Visualização de Medição) */}
      {isPublicView ? (
        <div className="print:hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                #{budget.code}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${typeInfo.badgeClass}`}
              >
                {typeInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {budget.title}
            </h1>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-xs shrink-0"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Imprimir / Salvar PDF</span>
          </Button>
        </div>
      ) : (
        <div className="print:hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
          {/* Barra superior de status e navegação */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goBack()}
              className="h-8 -ml-2 text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
              title="Voltar para a página anterior"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                #{budget.code}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${typeInfo.badgeClass}`}
              >
                {typeInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Informações Principais + Barra de Ações Enxuta */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-1">
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug break-words">
                {budget.title}
              </h1>

              {/* Metadados rápidos em chips com quebra fluida */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{client?.name || "Cliente não informado"}</span>
                </div>

                {linkedProject && (
                  <Link
                    to={getProjectUrl(linkedProject, "dashboard")}
                    className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[220px]">
                      {linkedProject.title}
                    </span>
                  </Link>
                )}

                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Validade: {formatShortDatePtBr(budget.validUntil)}</span>
                </div>

                {budget.executionDeadline && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Prazo: {budget.executionDeadline}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Ações: Ação Primária Contextual + Editar + DropdownMenu */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-start justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
              {canManageStatus && budget.status === "draft" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => updateBudgetStatus(budget.id, "sent")}
                  className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex-1 sm:flex-initial"
                >
                  <Send className="h-3.5 w-3.5 text-white" />
                  <span>Enviar Proposta</span>
                </Button>
              ) : canManageStatus && budget.status === "sent" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => updateBudgetStatus(budget.id, "approved")}
                  className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex-1 sm:flex-initial"
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Aprovar Proposta</span>
                </Button>
              ) : null}

              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => navigate(`/orcamentos/${budget.id}/editar`)}
                  className="h-9 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs flex-1 sm:flex-initial"
                >
                  <Pencil className="h-3.5 w-3.5 text-amber-400" />
                  <span>Editar</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-slate-300 text-slate-600 hover:text-slate-900"
                    title="Opções do orçamento"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuItem onClick={handleCopyPublicLink}>
                    <Share2 className="h-4 w-4 text-emerald-600" />
                    <span>Link de Compartilhamento (Cliente)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="h-4 w-4 text-blue-600" />
                    <span>Imprimir / Salvar PDF</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleCopyDirectLink}>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>Copiar Link Direto</span>
                  </DropdownMenuItem>

                  {canManageStatus && (
                    <>
                      <DropdownMenuSeparator />

                      {budget.status === "draft" && (
                        <DropdownMenuItem
                          onClick={() => updateBudgetStatus(budget.id, "sent")}
                        >
                          <Send className="h-4 w-4 text-blue-600" />
                          <span>Marcar como Enviado</span>
                        </DropdownMenuItem>
                      )}

                      {(budget.status === "draft" || budget.status === "sent") && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateBudgetStatus(budget.id, "approved")
                          }
                          className="text-emerald-700 font-medium"
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>Aprovar Proposta</span>
                        </DropdownMenuItem>
                      )}

                      {canConvert && (
                        <DropdownMenuItem
                          onClick={handleConvert}
                          className="text-emerald-700 font-semibold"
                        >
                          <FolderPlus className="h-4 w-4 text-emerald-600" />
                          <span>Converter em Projeto (Obra)</span>
                        </DropdownMenuItem>
                      )}

                      {budget.status === "sent" && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateBudgetStatus(budget.id, "rejected")
                          }
                          className="text-rose-600"
                        >
                          <XCircle className="h-4 w-4 text-rose-500" />
                          <span>Marcar como Recusado</span>
                        </DropdownMenuItem>
                      )}

                      {(budget.status === "sent" ||
                        budget.status === "rejected") && (
                        <DropdownMenuItem
                          onClick={() => updateBudgetStatus(budget.id, "draft")}
                        >
                          <RotateCcw className="h-4 w-4 text-slate-500" />
                          <span>Retornar para Rascunho</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => setIsDeleting(true)}
                        className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                        <span>Excluir Orçamento</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão inline (igual à tela de medição) */}
      {!isPublicView && isDeleting && (
        <div className="print:hidden rounded-xl border border-rose-200 bg-rose-50/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
          <div>
            <strong className="block font-bold">
              Deseja realmente excluir este orçamento?
            </strong>
            <span>
              Esta ação não poderá ser desfeita. Todos os itens e condições desta proposta serão removidos.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsDeleting(false)}
              className="h-8 text-xs bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, Excluir Orçamento
            </Button>
          </div>
        </div>
      )}

      {/* DOCUMENTO EDITORIAL TIMBRADO (FOLHA A4) */}
      <article className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden print:rounded-none print:border-0 print:shadow-none">
        {/* Faixa Superior com Primary Color da Identidade Visual */}
        <div
          className="h-3 w-full"
          style={{ backgroundColor: brand.primaryColor }}
        />

        <div className="p-6 sm:p-10 space-y-8 print:p-6 print:space-y-6">
          {/* CABEÇALHO TIMBRADO DA EMPRESA */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-start gap-4">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.companyName}
                  className="h-16 w-24 object-contain rounded-lg border border-slate-100 p-1.5 bg-white shrink-0"
                />
              ) : (
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-white font-black text-xl shadow-xs"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {brand.companyName.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {brand.companyName}
                </h2>
                <p className="text-xs font-mono text-slate-600">
                  CNPJ/CPF: {brand.document}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  {brand.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {brand.phone}
                    </span>
                  )}
                  {brand.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {brand.email}
                    </span>
                  )}
                </div>
                {brand.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{brand.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right space-y-1.5 shrink-0">
              <span
                className="inline-block rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                Proposta Comercial
              </span>
              <p className="text-base font-mono font-black text-slate-900 pt-1">
                {budget.code}
              </p>
              <p className="text-xs text-slate-500">
                Emissão:{" "}
                <strong className="text-slate-700 font-mono">
                  {formatShortDatePtBr(budget.createdAt)}
                </strong>
              </p>
              <p className="text-xs text-slate-500">
                Válida até:{" "}
                <strong
                  className="font-mono"
                  style={{ color: brand.primaryColor }}
                >
                  {formatShortDatePtBr(budget.validUntil)}
                </strong>
              </p>
            </div>
          </header>

          {/* DADOS DO CLIENTE & TÍTULO DA PROPOSTA */}
          <section className="grid grid-cols-1 sm:grid-cols-12 gap-4 rounded-xl bg-slate-50/80 border border-slate-200/80 p-5">
            <div className="sm:col-span-7 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Objeto / Obra Orçada
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {budget.title}
              </h3>
              <p className="text-xs text-slate-500">
                Modalidade:{" "}
                <strong className="text-slate-700">
                  {budget.budgetType === "additive"
                    ? "Orçamento Aditivo de Obra"
                    : "Proposta Base de Execução"}
                </strong>
              </p>
            </div>

            <div className="sm:col-span-5 space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Preparado Para (Cliente)
              </span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{client?.name || "Cliente"}</span>
              </p>
              {client?.companyName && (
                <p className="text-xs text-slate-600">{client.companyName}</p>
              )}
              {client?.phone && (
                <p className="text-xs text-slate-500">{client.phone}</p>
              )}
            </div>
          </section>

          {/* TABELAS AGRUPADAS POR NATUREZA DA COMPOSIÇÃO */}
          <section className="space-y-6">
            {(["labor", "material", "subcontract"] as const).map((typeKey) => {
              const groupItems = groupedItems[typeKey]
              if (groupItems.length === 0) return null

              const meta = SECTION_META[typeKey]
              const groupSubtotal = groupItems.reduce(
                (sum, i) => sum + i.subtotal,
                0
              )

              return (
                <div key={typeKey} className="space-y-2.5 break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-bold ${meta.badgeClass}`}
                      >
                        {meta.title}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        ({groupItems.length}{" "}
                        {groupItems.length === 1 ? "item" : "itens"})
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      Subtotal: {formatCurrency(groupSubtotal)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[480px]">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-[22%]">Ambiente / Local</th>
                          <th className="p-3">Descrição</th>
                          <th className="p-3 text-center w-24">Qtd.</th>
                          <th className="p-3 text-right w-28">Unitário</th>
                          <th className="p-3 text-right w-28">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupItems.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 text-slate-600 font-medium">
                              {item.environment || "Geral"}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {item.description}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-700">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </section>

          {/* RESUMO FINANCEIRO & TOTAL GERAL */}
          <section className="break-inside-avoid rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {budget.laborTotal > 0 && (
                <div>
                  <span className="text-slate-500 block">Mão de Obra</span>
                  <strong className="font-mono text-slate-800">
                    {formatCurrency(budget.laborTotal)}
                  </strong>
                </div>
              )}
              {budget.materialTotal > 0 && (
                <div>
                  <span className="text-slate-500 block">Materiais</span>
                  <strong className="font-mono text-slate-800">
                    {formatCurrency(budget.materialTotal)}
                  </strong>
                </div>
              )}
              {budget.subcontractTotal > 0 && (
                <div>
                  <span className="text-slate-500 block">
                    Ajudantes / Terceiros
                  </span>
                  <strong className="font-mono text-slate-800">
                    {formatCurrency(budget.subcontractTotal)}
                  </strong>
                </div>
              )}
            </div>

            <div
              className="rounded-xl px-5 py-3 text-white flex items-baseline justify-between sm:justify-end gap-4 shadow-xs"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                Investimento Total:
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono">
                {formatCurrency(budget.totalAmount)}
              </span>
            </div>
          </section>

          {/* CONDIÇÕES COMERCIAIS E TERMOS */}
          <section className="break-inside-avoid space-y-4 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Prazo de Execução
                </span>
                <p className="font-semibold text-slate-800">
                  {budget.executionDeadline}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Forma de Pagamento
                </span>
                <p className="font-semibold text-slate-800">
                  {budget.paymentTerms}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Validade desta Proposta
                </span>
                <p className="font-semibold text-slate-800 font-mono">
                  Até {formatShortDatePtBr(budget.validUntil)}
                </p>
              </div>
            </div>

            {budget.termsAndConditions && (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Termos, Condições Gerais e Garantias
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {budget.termsAndConditions}
                </p>
              </div>
            )}

            {/* Assinaturas para Impressão / PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 text-center text-xs text-slate-600">
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
                  <p className="font-bold text-slate-800">
                    {effectiveSignatureName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Responsável Técnico / Proponente ({brand.companyName})
                  </p>
                </div>
              </div>
              <div>
                <div className="h-16" />
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">
                    {client?.name || "De Acordo - Cliente"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aprovação do Contratante / Data
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  )

  if (isPublicView) {
    return (
      <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 print:bg-white print:p-0 print:min-h-0">
        <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:space-y-0">
          {content}
        </div>
      </div>
    )
  }

  return (
    <PageContainer className="max-w-4xl space-y-6 pb-20 print:max-w-none print:p-0 print:space-y-0">
      {content}
    </PageContainer>
  )
}

export default BudgetDetailPage
