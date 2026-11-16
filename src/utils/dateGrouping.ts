import type { Measurement } from "@/types/measurement"

export interface MeasurementDateGroup {
  id: string
  label: string
  items: Measurement[]
}

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

  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim())
  if (ymdMatch) {
    const year = Number(ymdMatch[1])
    const month = Number(ymdMatch[2]) - 1
    const day = Number(ymdMatch[3])
    return new Date(year, month, day)
  }

  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

/**
 * Classifica cada medição nos grupos temporais estilo Outlook:
 * 1. "Hoje"
 * 2. "Ontem"
 * 3. "Últimos 7 dias" (entre 2 e 7 dias atrás)
 * 4. Agrupamento Mensal ("Novembro de 2026", "Outubro de 2026", etc.)
 * Não retorna grupos vazios.
 */
export function groupMeasurementsByDate(
  measurements: Measurement[],
  referenceDate: Date = new Date()
): MeasurementDateGroup[] {
  if (!measurements || measurements.length === 0) return []

  const todayMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )

  const todayItems: Measurement[] = []
  const yesterdayItems: Measurement[] = []
  const last7DaysItems: Measurement[] = []
  const monthlyBuckets = new Map<
    string,
    { sortKey: number; label: string; items: Measurement[] }
  >()

  // Ordena todas as medições da mais recente para a mais antiga antes de agrupar
  const sorted = [...measurements].sort((a, b) => {
    const dA = parseToLocalMidnight(a.date || a.createdAt).getTime()
    const dB = parseToLocalMidnight(b.date || b.createdAt).getTime()
    if (dB !== dA) return dB - dA
    return (b.createdAt || "").localeCompare(a.createdAt || "")
  })

  for (const m of sorted) {
    const itemDate = parseToLocalMidnight(m.date || m.createdAt)
    const diffMs = todayMidnight.getTime() - itemDate.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      todayItems.push(m)
    } else if (diffDays === 1) {
      yesterdayItems.push(m)
    } else if (diffDays >= 2 && diffDays <= 7) {
      last7DaysItems.push(m)
    } else {
      const year = itemDate.getFullYear()
      const month = itemDate.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, "0")}`
      const label = `${PT_BR_MONTHS[month]} de ${year}`
      const sortKey = year * 12 + month

      const existing = monthlyBuckets.get(key)
      if (existing) {
        existing.items.push(m)
      } else {
        monthlyBuckets.set(key, {
          sortKey,
          label,
          items: [m],
        })
      }
    }
  }

  const result: MeasurementDateGroup[] = []

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
