import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  X,
  ReceiptText,
  Clock,
  CheckCircle2,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  FolderPlus,
  Send,
  Check,
  XCircle,
  ExternalLink,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { GroupedBudgetsList } from "@/components/shared/GroupedBudgetsList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore"
import { useBudgetsStore } from "@/stores/budgetsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/utils/calculations"
import { formatShortDatePtBr } from "@/utils/dateGrouping"
import { getProjectUrl } from "@/utils/projectRoutes"
import {
  BUDGET_STATUS_CONFIG,
  BUDGET_TYPE_CONFIG,
  type Budget,
  type BudgetStatus,
} from "@/types/budget"

export function BudgetsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const {
    budgets,
    updateBudgetStatus,
    deleteBudget,
    convertBudgetToProject,
    ensureSeedData,
  } = useBudgetsStore()
  const clients = useClientsStore((state) => state.clients)
  const projects = useProjectsStore((state) => state.projects)

  useEffect(() => {
    ensureSeedData()
  }, [ensureSeedData])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "all">("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canConvertOrApprove =
    user?.role === "MANAGER" || user?.role === "SOLO" || user?.role === "MASTER"
  const isSupervisor = user?.role === "PROJECT_SUPERVISOR"

  // Orçamentos isolados do Tenant atual
  const tenantBudgets = useMemo(() => {
    if (!user) return []
    return budgets.filter((b) => b.tenantId === user.tenantId)
  }, [budgets, user])

  // KPIs
  const metrics = useMemo(() => {
    const openOrSentTotal = tenantBudgets
      .filter((b) => b.status === "sent" || b.status === "draft")
      .reduce((sum, b) => sum + b.totalAmount, 0)

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const approvedMonthTotal = tenantBudgets
      .filter((b) => {
        if (b.status !== "approved") return false
        const d = new Date(b.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, b) => sum + b.totalAmount, 0)

    const approvedCount = tenantBudgets.filter((b) => b.status === "approved").length
    const closedCount = tenantBudgets.filter(
      (b) => b.status === "approved" || b.status === "rejected" || b.status === "sent"
    ).length
    const conversionRate =
      closedCount > 0 ? Math.round((approvedCount / closedCount) * 100) : 0

    return {
      openOrSentTotal,
      approvedMonthTotal,
      conversionRate,
      approvedCount,
      totalCount: tenantBudgets.length,
    }
  }, [tenantBudgets])

  // Filtragem
  const filteredBudgets = useMemo(() => {
    return tenantBudgets.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false

      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase()
        const clientName =
          clients.find((c) => c.id === b.clientId)?.name?.toLowerCase() || ""
        const matchTitle = b.title.toLowerCase().includes(q)
        const matchCode = b.code.toLowerCase().includes(q)
        const matchClient = clientName.includes(q)
        if (!matchTitle && !matchCode && !matchClient) return false
      }
      return true
    })
  }, [tenantBudgets, statusFilter, searchTerm, clients])

  const statusTabs: Array<{ label: string; value: BudgetStatus | "all"; count: number }> = [
    { label: "Todos", value: "all", count: tenantBudgets.length },
    {
      label: "Rascunho",
      value: "draft",
      count: tenantBudgets.filter((b) => b.status === "draft").length,
    },
    {
      label: "Enviado",
      value: "sent",
      count: tenantBudgets.filter((b) => b.status === "sent").length,
    },
    {
      label: "Aprovado",
      value: "approved",
      count: tenantBudgets.filter((b) => b.status === "approved").length,
    },
    {
      label: "Recusado",
      value: "rejected",
      count: tenantBudgets.filter((b) => b.status === "rejected").length,
    },
  ]

  const handleCopyClientLink = (budget: Budget) => {
    const url = `${window.location.origin}/#/proposta/${budget.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link da Proposta Copiado",
      description: `Link público do orçamento ${budget.code} copiado para enviar ao cliente.`,
      variant: "success",
    })
  }

  const handleConvertToProject = (budget: Budget) => {
    const planMax = user?.role === "SOLO" ? 1 : 5
    const createdProject = convertBudgetToProject(budget.id, {
      maxMembers: planMax,
    })
    if (createdProject) {
      navigate(`/projetos/${createdProject.id}/visao-geral`)
    }
  }

  return (
    <PageContainer className="space-y-6 pb-20">
      <PageHeader
        title="Orçamentos & Propostas"
        description="Elabore orçamentos comerciais com composições unificadas, envie propostas timbradas ao cliente e converta obras aprovadas em 1 clique."
        actions={
          <Button
            onClick={() => navigate("/orcamentos/novo")}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-xs font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            Novo Orçamento
          </Button>
        }
      />

      {/* 1. KPIs do Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Em Aberto / Enviados
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                {formatCurrency(metrics.openOrSentTotal)}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Aprovados no Mês
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5 font-mono">
                {formatCurrency(metrics.approvedMonthTotal)}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Taxa de Conversão
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-2xl font-bold text-amber-700 font-mono">
                  {metrics.conversionRate}%
                </h3>
                <span className="text-xs text-slate-400">
                  ({metrics.approvedCount} aprovados)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por código, cliente ou título da proposta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50/50 focus:bg-white"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value
            return (
              <Button
                key={tab.value}
                type="button"
                variant="unstyled"
                size="auto"
                onClick={() => setStatusFilter(tab.value)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected
                      ? "bg-slate-800 text-amber-400"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 3. Tabela de Orçamentos */}
      {filteredBudgets.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Nenhum orçamento encontrado
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar o filtro de status ou a busca textual."
                : "Crie seu primeiro orçamento comercial com papel timbrado para enviar ao cliente."}
            </p>
          </div>
          <Button
            onClick={() => navigate("/orcamentos/novo")}
            className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            Criar Novo Orçamento
          </Button>
        </div>
      ) : (
        <GroupedBudgetsList
          budgets={filteredBudgets}
          renderGroupContent={(groupItems) => (
            <div className="rounded-xl border border-slate-200/90 bg-white overflow-x-auto shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="text-xs font-semibold text-slate-700 w-32">
                      Código
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Título &amp; Cliente
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-24 text-center">
                      Tipo
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-28">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-28">
                      Validade
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-36 text-right">
                      Valor Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-28 text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 w-44 text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupItems.map((budget) => {
                    const clientName =
                      clients.find((c) => c.id === budget.clientId)?.name ||
                      "Cliente"
                    const linkedProject = budget.projectId
                      ? projects.find((p) => p.id === budget.projectId)
                      : null
                    const statusInfo = BUDGET_STATUS_CONFIG[budget.status]
                    const typeInfo = BUDGET_TYPE_CONFIG[budget.budgetType]
                    const canConvert =
                      canConvertOrApprove &&
                      budget.status === "approved" &&
                      !budget.projectId

                    return (
                      <TableRow
                        key={budget.id}
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="py-3.5 font-mono text-xs font-bold text-slate-700">
                          {budget.code}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <Button
                              type="button"
                              variant="unstyled"
                              size="auto"
                              onClick={() => navigate(`/orcamentos/${budget.id}`)}
                              className="font-bold text-slate-900 text-sm hover:text-amber-700 hover:underline text-left block"
                            >
                              {budget.title}
                            </Button>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{clientName}</span>
                              {linkedProject && (
                                <Button
                                  type="button"
                                  variant="unstyled"
                                  size="auto"
                                  onClick={() =>
                                    navigate(getProjectUrl(linkedProject, "dashboard"))
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {linkedProject.title}
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${typeInfo.badgeClass}`}
                          >
                            {typeInfo.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-slate-600 font-mono whitespace-nowrap">
                          {formatShortDatePtBr(budget.updatedAt || budget.createdAt)}
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {formatShortDatePtBr(budget.validUntil)}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(budget.totalAmount)}
                        </TableCell>

                        <TableCell className="py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          {deletingId === budget.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs px-2"
                                onClick={() => setDeletingId(null)}
                              >
                                Não
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
                                onClick={() => {
                                  deleteBudget(budget.id)
                                  setDeletingId(null)
                                }}
                              >
                                Excluir
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {canConvert && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConvertToProject(budget)}
                                  className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 px-2.5 shadow-2xs"
                                  title="Converter orçamento aprovado em nova obra"
                                >
                                  <FolderPlus className="h-3.5 w-3.5" />
                                  <span>Converter</span>
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    title="Ações do orçamento"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/orcamentos/${budget.id}`)}
                                  >
                                    <Eye className="h-4 w-4 text-slate-500" />
                                    <span>Visualizar Proposta / PDF</span>
                                  </DropdownMenuItem>

                                  {(!isSupervisor || budget.status === "draft") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/orcamentos/${budget.id}/editar`)
                                      }
                                    >
                                      <Pencil className="h-4 w-4 text-amber-500" />
                                      <span>Editar Orçamento</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    onClick={() => handleCopyClientLink(budget)}
                                  >
                                    <Copy className="h-4 w-4 text-blue-500" />
                                    <span>Copiar Link do Cliente</span>
                                  </DropdownMenuItem>

                                  {canConvertOrApprove && (
                                    <>
                                      <DropdownMenuSeparator />
                                      {budget.status === "draft" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            updateBudgetStatus(budget.id, "sent")
                                          }
                                        >
                                          <Send className="h-4 w-4 text-blue-600" />
                                          <span>Marcar como Enviado</span>
                                        </DropdownMenuItem>
                                      )}
                                      {(budget.status === "draft" ||
                                        budget.status === "sent") && (
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
                                      {canConvert && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleConvertToProject(budget)
                                          }
                                          className="text-emerald-700 font-semibold"
                                        >
                                          <FolderPlus className="h-4 w-4 text-emerald-600" />
                                          <span>Converter em Projeto (Obra)</span>
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setDeletingId(budget.id)}
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
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        />
      )}
    </PageContainer>
  )
}

export default BudgetsPage
