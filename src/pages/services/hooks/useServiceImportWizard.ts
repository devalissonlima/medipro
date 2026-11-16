import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useServicesStore } from "@/stores/servicesStore"
import type { MasterServiceType } from "@/types/catalog"
import type { ServiceCategory, ServiceUnit } from "@/types/service"

interface UseServiceImportWizardProps {
  queue: MasterServiceType[]
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

/**
 * Converte valor numérico em centavos para string formatada em Real (BRL)
 * Ex: 22 -> "0,22", 220 -> "2,20", 15000 -> "150,00"
 */
export function formatCentsToCurrencyString(cents: number): string {
  if (cents <= 0) return ""
  const val = cents / 100
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

/**
 * Máscara financeira: extrai apenas os dígitos e divide por 100 (iniciando pelos centavos)
 * Ex: "2" -> "0,02", "22" -> "0,22", "220" -> "2,20", "2200" -> "22,00"
 */
export function parseRawInputToPrice(rawVal: string): { formatted: string; price: number } {
  const digits = rawVal.replace(/\D/g, "").slice(0, 10)
  if (!digits || parseInt(digits, 10) === 0) {
    return { formatted: "", price: 0 }
  }
  const cents = parseInt(digits, 10)
  const price = cents / 100
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
  return { formatted, price }
}

export function useServiceImportWizard({
  queue,
  isOpen,
  onClose,
  onComplete,
}: UseServiceImportWizardProps) {
  const importServices = useServicesStore((state) => state.importServices)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())
  const [inputVal, setInputVal] = useState<string>("")
  const [parsedPrice, setParsedPrice] = useState<number>(0)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const totalInQueue = queue.length
  const currentService = queue[currentIndex] || null
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalInQueue - 1

  const isValidPrice = parsedPrice > 0

  const progressPercent = useMemo(() => {
    if (totalInQueue === 0) return 0
    return Math.round(((currentIndex + 1) / totalInQueue) * 100)
  }, [currentIndex, totalInQueue])

  // Foca automaticamente no input do valor
  const focusInput = useCallback(() => {
    window.setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 50)
  }, [])

  // Manipulador de digitação com máscara monetária de centavos
  const handleInputChange = useCallback((rawVal: string) => {
    const { formatted, price } = parseRawInputToPrice(rawVal)
    setInputVal(formatted)
    setParsedPrice(price)
  }, [])

  // Inicializa o estado quando o modal abre ou a fila muda
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0)
      setPrices({})
      setSkippedIds(new Set())
      setInputVal("")
      setParsedPrice(0)
      focusInput()
    }
  }, [isOpen, queue, focusInput])

  // Atualiza o inputVal ao mudar de passo (preenche se já tiver digitado anteriormente)
  useEffect(() => {
    if (isOpen && currentService) {
      const existingPrice = prices[currentService.id]
      if (existingPrice && existingPrice > 0) {
        const cents = Math.round(existingPrice * 100)
        const formatted = formatCentsToCurrencyString(cents)
        setInputVal(formatted)
        setParsedPrice(existingPrice)
      } else {
        setInputVal("")
        setParsedPrice(0)
      }
      focusInput()
    }
  }, [currentIndex, isOpen, currentService, prices, focusInput])

  // Próximo passo (salva preço e avança na fila)
  const nextStep = useCallback(() => {
    if (!currentService || !isValidPrice) return

    setPrices((prev) => ({
      ...prev,
      [currentService.id]: parsedPrice,
    }))

    // Remove dos pulados se digitou um valor válido
    setSkippedIds((prev) => {
      const next = new Set(prev)
      next.delete(currentService.id)
      return next
    })

    if (!isLastStep) {
      setCurrentIndex((idx) => idx + 1)
    }
  }, [currentService, isValidPrice, parsedPrice, isLastStep])

  // Passo anterior (revisar item anterior)
  const prevStep = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1)
    }
  }, [currentIndex])

  // Pular o serviço atual
  const skipStep = useCallback(() => {
    if (!currentService) return

    setSkippedIds((prev) => new Set(prev).add(currentService.id))

    if (!isLastStep) {
      setCurrentIndex((idx) => idx + 1)
    } else {
      commitImport()
    }
  }, [currentService, isLastStep])

  // Conclui a importação e persiste na servicesStore
  const commitImport = useCallback(() => {
    // Inclui o item atual se tiver preço válido
    const finalPrices = { ...prices }
    if (currentService && isValidPrice && !skippedIds.has(currentService.id)) {
      finalPrices[currentService.id] = parsedPrice
    }

    const itemsToImport = queue
      .filter((s) => !skippedIds.has(s.id) && finalPrices[s.id] && finalPrices[s.id] > 0)
      .map((s) => ({
        masterServiceId: s.id,
        name: s.name,
        category: (s.category || "Outros") as ServiceCategory,
        unit: s.defaultUnit as ServiceUnit,
        basePrice: finalPrices[s.id],
        complexityTags: ["Padrão"],
        description: `Serviço padronizado importado do Catálogo da Empresa (${s.name}).`,
      }))

    if (itemsToImport.length > 0) {
      importServices(itemsToImport)
      onComplete()
    } else {
      onClose()
    }
  }, [
    prices,
    currentService,
    isValidPrice,
    skippedIds,
    parsedPrice,
    queue,
    importServices,
    onComplete,
    onClose,
  ])

  // Disparo ao pressionar Enter dentro do input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (isValidPrice) {
          if (isLastStep) {
            commitImport()
          } else {
            nextStep()
          }
        }
      }
    },
    [isValidPrice, isLastStep, commitImport, nextStep]
  )

  // Contagem de itens que serão importados com preço válido
  const validItemsCount = useMemo(() => {
    let count = 0
    queue.forEach((s) => {
      if (skippedIds.has(s.id)) return
      if (s.id === currentService?.id) {
        if (isValidPrice) count++
      } else if (prices[s.id] && prices[s.id] > 0) {
        count++
      }
    })
    return count
  }, [queue, skippedIds, currentService, isValidPrice, prices])

  return {
    currentIndex,
    totalInQueue,
    currentService,
    isFirstStep,
    isLastStep,
    inputVal,
    handleInputChange,
    parsedPrice,
    isValidPrice,
    progressPercent,
    validItemsCount,
    inputRef,
    nextStep,
    prevStep,
    skipStep,
    commitImport,
    handleKeyDown,
  }
}
