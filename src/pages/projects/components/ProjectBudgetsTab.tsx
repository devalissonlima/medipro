import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  ReceiptText,
  ExternalLink,
  Check,
  Calendar,
  Clock,
  Layers,
  Wallet,
  Sparkles,
  Search,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GroupedBudgetsList } from "@/components/shared/GroupedBudgetsList"
import { useAuthStore } from "@/stores/authStore"
import { useBudgetsStore } from "@/stores/budgetsStore"
import {
  BUDGET_STATUS_CONFIG,
  BUDGET_TYPE_CONFIG,
  type BudgetStatus,
} from "@/types/budget"
import type { Project } from "@/types/project"
import { formatCurrency } from "@/utils/calculations"
import { formatShortDatePtBr } from "@/utils/dateGrouping"

interface ProjectBudgetsTabProps {
  project: Project
}

export const ProjectBudgetsTab: React.FC<ProjectBudgetsTabProps> = ({
  project,
}) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { budgets, updateBudgetStatus } = useBudgetsStore()

  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const canApproveOrFinalize =
    user?.role === "MANAGER" || user?.role === "SOLO" || user?.role === "MASTER"

  const projectBudgets = useMemo(() => {
    return budgets.filter((b) => b.projectId === project.id)
  }, [budgets, project.id])

  const filteredProjectBudgets = useMemo(() => {
    return projectBudgets.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = b.title.toLowerCase().includes(query)
        const matchCode = b.code.toLowerCase().includes(query)
        const matchId = b.id.toLowerCase().includes(query)
        if (!matchTitle && !matchCode && !matchId) {
          return false
        }
      }

      return true
    })
  }, [projectBudgets, statusFilter, searchQuery])

  const statusCounts = useMemo(() => {
    return {
      all: projectBudgets.length,
      approved: projectBudgets.filter((b) => b.status === "approved").length,
      sent: projectBudgets.filter((b) => b.status === "sent").length,
      draft: projectBudgets.filter((b) => b.status === "draft").length,
      rejected: projectBudgets.filter((b) => b.status === "rejected").length,
    }
  }, [projectBudgets])

  const contractSummary = useMemo(() => {
    const approvedBase = projectBudgets
      .filter((b) => b.budgetType === "base" && b.status === "approved")
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const approvedAdditives = projectBudgets
      .filter((b) => b.budgetType === "additive" && b.status === "approved")
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const pendingAdditives = projectBudgets
      .filter(
        (b) =>
          b.budgetType === "additive" &&
          b.status !== "approved" &&
          b.status !== "rejected"
      )
      .reduce((sum, b) => sum + b.totalAmount, 0)

    const contractedTotal =
      approvedBase + approvedAdditives > 0
        ? approvedBase + approvedAdditives
        : project.budgetedAmount || 0

    return {
      approvedBase,
      approvedAdditives,
      pendingAdditives,
      contractedTotal,
    }
  }, [projectBudgets, project.budgetedAmount])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Resumo Contratual 1 Projeto : N Orçamentos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Contratado da Obra
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                {formatCurrency(contractSummary.contractedTotal)}
              </p>
              <span className="text-[11px] text-slate-500">
                Orçamento Base + Aditivos Aprovados
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Aditivos Aprovados
              </span>
              <p className="text-2xl font-black text-amber-700 font-mono mt-1">
                {formatCurrency(contractSummary.approvedAdditives)}
              </p>
              <span className="text-[11px] text-slate-500">
                Já incorporados ao escopo previsto
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Aditivos em Negociação
              </span>
              <p className="text-2xl font-black text-blue-700 font-mono mt-1">
                {formatCurrency(contractSummary.pendingAdditives)}
              </p>
              <span className="text-[11px] text-slate-500">
                Rascunhos e enviados aguardando cliente
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Barra de Título, Filtros e Ação */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Orçamento Base &amp; Aditivos ({projectBudgets.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ao aprovar um Orçamento Aditivo, seus itens e valores são somados automaticamente ao escopo desta obra.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => navigate(`/orcamentos/novo?projectId=${project.id}`)}
            className="h-9 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 shadow-2xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>+ Novo Orçamento Aditivo</span>
          </Button>
        </div>

        {/* Linha de Busca e Pills de Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] opacity-80">({statusCounts.all})</span>
            </Button>

            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <span>Aprovados</span>
              <span className="text-[10px] font-bold">({statusCounts.approved})</span>
            </Button>

            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setStatusFilter("sent")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "sent"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <span>Enviados</span>
              <span className="text-[10px] font-bold">({statusCounts.sent})</span>
            </Button>

            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === "draft"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>Rascunhos</span>
              <span className="text-[10px] font-bold">({statusCounts.draft})</span>
            </Button>

            {statusCounts.rejected > 0 && (
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  statusFilter === "rejected"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <span>Recusados</span>
                <span className="text-[10px] font-bold">({statusCounts.rejected})</span>
              </Button>
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por título, código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 text-xs h-8 bg-slate-50/50"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Lista de Orçamentos Vinculados Agrupados por Período */}
      {filteredProjectBudgets.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/60">
          <CardContent className="py-12 text-center space-y-2.5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
              <ReceiptText className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {projectBudgets.length === 0
                ? "Nenhum orçamento vinculado a este projeto ainda"
                : "Nenhum orçamento encontrado com os filtros selecionados"}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {projectBudgets.length === 0
                ? "Crie um orçamento aditivo para formalizar serviços ou materiais extras solicitados pelo cliente durante a execução."
                : "Tente limpar os filtros de status ou a busca por texto."}
            </p>
            {statusFilter !== "all" || searchQuery ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setSearchQuery("")
                }}
                className="text-xs mt-2 border-slate-300"
              >
                Limpar Filtros
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orcamentos/novo?projectId=${project.id}`)}
                className="text-xs mt-2 border-slate-300"
              >
                + Criar Orçamento Aditivo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <GroupedBudgetsList
          budgets={filteredProjectBudgets}
          renderItem={(budget) => {
            const statusInfo = BUDGET_STATUS_CONFIG[budget.status]
            const typeInfo = BUDGET_TYPE_CONFIG[budget.budgetType]
            const canApproveAdditive =
              canApproveOrFinalize &&
              budget.budgetType === "additive" &&
              (budget.status === "draft" || budget.status === "sent")
            const isUpdated =
              Boolean(budget.updatedAt) && budget.updatedAt !== budget.createdAt
            const dateLabel = isUpdated ? "Atualizado em" : "Criado em"
            const formattedDate = formatShortDatePtBr(
              budget.updatedAt || budget.createdAt
            )

            return (
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {budget.code}
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

                  <Button
                    type="button"
                    variant="unstyled"
                    size="auto"
                    onClick={() => navigate(`/orcamentos/${budget.id}`)}
                    className="text-sm font-bold text-slate-900 hover:text-amber-700 hover:underline text-left block pt-0.5"
                  >
                    {budget.title}
                  </Button>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {dateLabel}: {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      Validade: {formatShortDatePtBr(budget.validUntil)}
                    </span>
                    <span>
                      {budget.items.length}{" "}
                      {budget.items.length === 1 ? "item" : "itens"} na composição
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Valor da Proposta
                    </span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {formatCurrency(budget.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canApproveAdditive && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => updateBudgetStatus(budget.id, "approved")}
                        className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        title="Aprovar aditivo e somar itens ao escopo do projeto"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Aprovar &amp; Integrar</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orcamentos/${budget.id}`)}
                      className="h-8 text-xs border-slate-300 text-slate-700 gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                      <span>Ver Proposta</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          }}
        />
      )}
    </div>
  )
}
