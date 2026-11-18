import type { Measurement } from "@/types/measurement"
import type { Budget } from "@/types/budget"

export interface DateGroup<T> {
  id: string
  label: string
  items: T[]
}

export type MeasurementDateGroup = DateGroup<Measurement>
export type BudgetDateGroup = DateGroup<Budget>

const PT_BR_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function parseToLocalMidnight(dateStr?: string): Date {
  if (!dateStr) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  const trimmed = dateStr.trim()
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const month = Number(dateOnlyMatch[2]) - 1
    const day = Number(dateOnlyMatch[3])
    return new Date(year, month, day)
  }

  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) {
    const ymdFallback = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
    if (ymdFallback) {
      return new Date(
        Number(ymdFallback[1]),
        Number(ymdFallback[2]) - 1,
        Number(ymdFallback[3])
      )
    }
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

/**
 * Formata uma string ISO ou YYYY-MM-DD para DD/MM/YYYY respeitando o dia calendário local.
 */
export function formatShortDatePtBr(dateStr?: string): string {
  if (!dateStr) return "—"
  const d = parseToLocalMidnight(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Motor genérico de agrupamento temporal estilo Outlook:
 * 1. "Hoje"
 * 2. "Ontem"
 * 3. "Últimos 7 dias" (entre 2 e 7 dias atrás)
 * 4. Agrupamento Mensal ("Novembro de 2026", "Outubro de 2026", etc.)
 * Não retorna grupos vazios.
 */
function groupItemsByDate<T>(
  items: T[],
  getReferenceDateStr: (item: T) => string | undefined,
  getTieBreakerStr: (item: T) => string | undefined,
  referenceDate: Date = new Date()
): DateGroup<T>[] {
  if (!items || items.length === 0) return []

  const todayMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )

  const todayItems: T[] = []
  const yesterdayItems: T[] = []
  const last7DaysItems: T[] = []
  const monthlyBuckets = new Map<
    string,
    { sortKey: number; label: string; items: T[] }
  >()

  // Ordena todos os itens do mais recente para o mais antigo antes de agrupar
  const sorted = [...items].sort((a, b) => {
    const refA = getReferenceDateStr(a)
    const refB = getReferenceDateStr(b)
    const dA = parseToLocalMidnight(refA).getTime()
    const dB = parseToLocalMidnight(refB).getTime()
    if (dB !== dA) return dB - dA

    const refCmp = (refB || "").localeCompare(refA || "")
    if (refCmp !== 0) return refCmp

    return (getTieBreakerStr(b) || "").localeCompare(getTieBreakerStr(a) || "")
  })

  for (const item of sorted) {
    const itemDate = parseToLocalMidnight(getReferenceDateStr(item))
    const diffMs = todayMidnight.getTime() - itemDate.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      todayItems.push(item)
    } else if (diffDays === 1) {
      yesterdayItems.push(item)
    } else if (diffDays >= 2 && diffDays <= 7) {
      last7DaysItems.push(item)
    } else {
      const year = itemDate.getFullYear()
      const month = itemDate.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, "0")}`
      const label = `${PT_BR_MONTHS[month]} de ${year}`
      const sortKey = year * 12 + month

      const existing = monthlyBuckets.get(key)
      if (existing) {
        existing.items.push(item)
      } else {
        monthlyBuckets.set(key, {
          sortKey,
          label,
          items: [item],
        })
      }
    }
  }

  const result: DateGroup<T>[] = []

  if (todayItems.length > 0) {
    result.push({
      id: "today",
      label: "Hoje",
      items: todayItems,
    })
  }

  if (yesterdayItems.length > 0) {
    result.push({
      id: "yesterday",
      label: "Ontem",
      items: yesterdayItems,
    })
  }

  if (last7DaysItems.length > 0) {
    result.push({
      id: "last_7_days",
      label: "Últimos 7 dias",
      items: last7DaysItems,
    })
  }

  const sortedMonthly = Array.from(monthlyBuckets.entries()).sort(
    (a, b) => b[1].sortKey - a[1].sortKey
  )

  for (const [key, bucket] of sortedMonthly) {
    if (bucket.items.length > 0) {
      result.push({
        id: `month_${key}`,
        label: bucket.label,
        items: bucket.items,
      })
    }
  }

  return result
}

/**
 * Classifica cada medição nos grupos temporais estilo Outlook,
 * considerando data da última alteração ou lançamento.
 */
export function groupMeasurementsByDate(
  measurements: Measurement[],
  referenceDate: Date = new Date()
): MeasurementDateGroup[] {
  return groupItemsByDate(
    measurements,
    (m) => m.updatedAt || m.date || m.createdAt,
    (m) => m.createdAt,
    referenceDate
  )
}

/**
 * Classifica cada orçamento nos grupos temporais estilo Outlook,
 * considerando data de última alteração ou geração (updatedAt || createdAt).
 */
export function groupBudgetsByDate(
  budgets: Budget[],
  referenceDate: Date = new Date()
): BudgetDateGroup[] {
  return groupItemsByDate(
    budgets,
    (b) => b.updatedAt || b.createdAt,
    (b) => b.createdAt,
    referenceDate
  )
}
