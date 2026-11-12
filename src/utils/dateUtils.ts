import { format, differenceInMinutes, differenceInHours, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Retorna a saudação baseada na hora atual:
 * - 05:00 às 11:59: "Bom dia"
 * - 12:00 às 17:59: "Boa tarde"
 * - 18:00 às 04:59: "Boa noite"
 */
export function getGreetingByHour(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) {
    return "Bom dia"
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde"
  } else {
    return "Boa noite"
  }
}

/**
 * Formata a data atual por extenso no padrão brasileiro:
 * Ex: "Quarta-feira, 11 de Novembro de 2026"
 */
export function formatFullDate(date: Date = new Date()): string {
  const formatted = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  // Capitaliza a primeira letra do dia da semana
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Verifica se uma data ISO está dentro da janela das últimas 24 horas.
 */
export function isWithinLast24Hours(isoString: string): boolean {
  try {
    const timestamp = parseISO(isoString).getTime()
    const now = Date.now()
    const diffMs = now - timestamp
    return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

/**
 * Retorna o tempo decorrido relativo amigável em português:
 * Ex: "Agora mesmo", "Há 15 minutos", "Há 3 horas", "Ontem às 17:40"
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    const now = new Date()
    const minutes = differenceInMinutes(now, date)

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `Há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`

    const hours = differenceInHours(now, date)
    if (hours < 24) return `Há ${hours} ${hours === 1 ? "hora" : "horas"}`

    return `Ontem às ${format(date, "HH:mm")}`
  } catch {
    return "Recente"
  }
}
