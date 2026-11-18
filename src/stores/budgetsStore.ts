import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"
import { useProjectsStore } from "./projectsStore"
import { useClientsStore } from "./clientsStore"
import type {
  Budget,
  BudgetItem,
  BudgetStatus,
  BudgetType,
} from "@/types/budget"
import type { Project, ProjectScopeItem } from "@/types/project"

export function calculateBudgetTotals(items: BudgetItem[]): {
  laborTotal: number
  materialTotal: number
  subcontractTotal: number
  totalAmount: number
} {
  return items.reduce(
    (acc, item) => {
      const sub = Number(item.subtotal) || 0
      if (item.itemType === "material") acc.materialTotal += sub
      else if (item.itemType === "subcontract") acc.subcontractTotal += sub
      else acc.laborTotal += sub
      acc.totalAmount += sub
      return acc
    },
    {
      laborTotal: 0,
      materialTotal: 0,
      subcontractTotal: 0,
      totalAmount: 0,
    }
  )
}

export const INITIAL_BUDGETS: Budget[] = []

export type BudgetCreateInput = Omit<
  Budget,
  | "id"
  | "code"
  | "createdAt"
  | "updatedAt"
  | "laborTotal"
  | "materialTotal"
  | "subcontractTotal"
  | "totalAmount"
>

interface BudgetsState {
  budgets: Budget[]

  addBudget: (data: BudgetCreateInput) => Budget
  updateBudget: (id: string, data: Partial<BudgetCreateInput>) => void
  deleteBudget: (id: string) => void
  updateBudgetStatus: (id: string, status: BudgetStatus) => void
  convertBudgetToProject: (
    budgetId: string,
    options?: { maxMembers?: number }
  ) => Project | null
  ensureSeedData: () => void
}

function mergeAdditiveIntoProjectScope(
  project: Project,
  budget: Budget
): ProjectScopeItem[] {
  const currentScope = [...(project.scopeItems || [])]

  budget.items.forEach((bItem, idx) => {
    const existingIdx = currentScope.findIndex(
      (s) =>
        (bItem.masterServiceId && s.masterServiceId === bItem.masterServiceId) ||
        (s.serviceName.toLowerCase() === bItem.description.toLowerCase() &&
          (s.environment || "") === (bItem.environment || ""))
    )

    if (existingIdx >= 0) {
      const existing = currentScope[existingIdx]
      currentScope[existingIdx] = {
        ...existing,
        maxQuantity: Number((existing.maxQuantity + bItem.quantity).toFixed(2)),
      }
    } else {
      currentScope.push({
        id: `scope-add-${Date.now().toString(36)}-${idx}`,
        projectId: project.id,
        masterServiceId: bItem.masterServiceId || bItem.id,
        serviceName: bItem.description,
        environment: bItem.environment || undefined,
        unit: bItem.unit,
        maxQuantity: bItem.quantity,
        executedQuantity: 0,
      })
    }
  })

  return currentScope
}

export const useBudgetsStore = create<BudgetsState>()(
  persist(
    (set, get) => ({
      budgets: INITIAL_BUDGETS,

      addBudget: (data) => {
        const totals = calculateBudgetTotals(data.items)
        const count = get().budgets.length + 1
        const year = new Date().getFullYear()
        const code = `ORC-${year}-${String(count).padStart(3, "0")}`
        const now = new Date().toISOString()

        const newBudget: Budget = {
          ...data,
          id: `bud-${Date.now().toString(36)}`,
          code,
          ...totals,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          budgets: [newBudget, ...state.budgets],
        }))

        toast({
          title: "Orçamento Criado",
          description: `Proposta ${newBudget.code} salva com sucesso!`,
          variant: "success",
        })

        return newBudget
      },

      updateBudget: (id, data) => {
        const now = new Date().toISOString()
        set((state) => ({
          budgets: state.budgets.map((b) => {
            if (b.id !== id) return b
            const updatedItems = data.items ?? b.items
            const totals = calculateBudgetTotals(updatedItems)
            return {
              ...b,
              ...data,
              items: updatedItems,
              ...totals,
              updatedAt: now,
            }
          }),
        }))

        toast({
          title: "Orçamento Atualizado",
          description: "Alterações da proposta comercial salvas com sucesso.",
          variant: "success",
        })
      },

      deleteBudget: (id) => {
        const target = get().budgets.find((b) => b.id === id)
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }))

        toast({
          title: "Orçamento Removido",
          description: target
            ? `Orçamento ${target.code} excluído.`
            : "Orçamento excluído.",
          variant: "destructive",
        })
      },

      updateBudgetStatus: (id, status) => {
        const target = get().budgets.find((b) => b.id === id)
        if (!target) return

        const wasAlreadyApproved = target.status === "approved"
        const now = new Date().toISOString()

        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, status, updatedAt: now } : b
          ),
        }))

        // Se for um Orçamento Aditivo aprovado vinculado a um projeto, soma automaticamente ao escopo e valor contratado
        if (
          status === "approved" &&
          !wasAlreadyApproved &&
          target.budgetType === "additive" &&
          target.projectId
        ) {
          const projectsStore = useProjectsStore.getState()
          const linkedProject = projectsStore.projects.find(
            (p) => p.id === target.projectId
          )
          if (linkedProject) {
            const mergedScope = mergeAdditiveIntoProjectScope(
              linkedProject,
              target
            )
            projectsStore.updateProject(linkedProject.id, {
              budgetedAmount:
                (linkedProject.budgetedAmount || 0) + target.totalAmount,
              laborCostCap:
                (linkedProject.laborCostCap || 0) + target.laborTotal,
              scopeItems: mergedScope,
            })

            toast({
              title: "Aditivo Aprovado e Integrado à Obra",
              description: `Os itens e valor de ${target.code} foram somados ao escopo previsto de "${linkedProject.title}".`,
              variant: "success",
            })
            return
          }
        }

        const statusMessages: Record<BudgetStatus, string> = {
          draft: "Orçamento retornado para rascunho.",
          sent: "Orçamento marcado como enviado ao cliente!",
          approved: "Proposta marcada como aprovada!",
          rejected: "Proposta marcada como recusada.",
        }

        toast({
          title: "Status Atualizado",
          description: statusMessages[status],
          variant: status === "rejected" ? "destructive" : "success",
        })
      },

      convertBudgetToProject: (budgetId, options) => {
        const state = get()
        const budget = state.budgets.find((b) => b.id === budgetId)
        if (!budget) return null

        const projectsStore = useProjectsStore.getState()
        if (budget.projectId) {
          const existing = projectsStore.projects.find(
            (p) => p.id === budget.projectId
          )
          if (existing) return existing
        }

        const client = useClientsStore
          .getState()
          .clients.find((c) => c.id === budget.clientId)

        const rawScopeItems: ProjectScopeItem[] = budget.items.map(
          (item, idx) => ({
            id: `scope-${Date.now().toString(36)}-${idx}`,
            projectId: "",
            masterServiceId: item.masterServiceId || item.id,
            serviceName: item.description,
            environment: item.environment || undefined,
            unit: item.unit,
            maxQuantity: item.quantity,
            executedQuantity: 0,
          })
        )

        const newProject = projectsStore.addProject({
          tenantId: budget.tenantId,
          clientId: budget.clientId,
          clientName: client?.name || "Cliente",
          title: budget.title,
          description: `Projeto convertido a partir da proposta aprovada ${budget.code}.`,
          status: "active",
          startDate: new Date().toISOString().split("T")[0],
          budgetedAmount: budget.totalAmount,
          laborCostCap: budget.laborTotal,
          maxMembers: options?.maxMembers || 5,
          scopeItems: rawScopeItems,
        })

        // Vincula o projectId em cada ProjectScopeItem criado
        const boundScope = rawScopeItems.map((s) => ({
          ...s,
          projectId: newProject.id,
        }))
        projectsStore.updateProjectScope(newProject.id, boundScope)

        const now = new Date().toISOString()
        set((prev) => ({
          budgets: prev.budgets.map((b) =>
            b.id === budget.id ? { ...b, projectId: newProject.id, updatedAt: now } : b
          ),
        }))

        toast({
          title: "Projeto Criado a Partir do Orçamento!",
          description: `"${newProject.title}" foi gerado com ${boundScope.length} itens no escopo previsto.`,
          variant: "success",
        })

        return newProject
      },

      ensureSeedData: () => {},
    }),
    {
      name: "@medipro:budgets-data-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        budgets: state.budgets,
      }),
    }
  )
)

export type { BudgetType }
