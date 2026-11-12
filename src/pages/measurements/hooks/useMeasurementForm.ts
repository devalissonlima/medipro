import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useAuthStore } from "@/stores/authStore"
import type { ServiceItem } from "@/types/service"
import type {
  MeasurementServiceItem,
  OperationalCosts,
  Measurement,
} from "@/types/measurement"
import {
  calculateItemSubtotal,
  calculateServicesTotal,
  calculateOperationalCostsTotal,
  calculateGrandTotal,
} from "@/utils/calculations"

export function useMeasurementForm(initialData?: Partial<Measurement>) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedClientId = searchParams.get("clientId")
  const clients = useClientsStore((state) => state.clients)

  const { addMeasurement, openShareModal } = useMeasurementsStore()
  const user = useAuthStore((state) => state.user)

  // Default context baseado no perfil do usuário
  const isTeamMember = user?.role === "prestador"

  const [title, setTitle] = useState(
    initialData?.title || ""
  )
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0]
  )
  const [location, setLocation] = useState(initialData?.location || "")
  const [clientId, setClientId] = useState(initialData?.clientId || "")
  const [clientName, setClientName] = useState(initialData?.clientName || "")
  const [isTeamContext, setIsTeamContext] = useState(
    initialData?.isTeamContext ?? isTeamMember
  )

  // Pré-seleciona cliente vindo da URL (?clientId=xxx)
  useEffect(() => {
    if (preselectedClientId) {
      const found = clients.find((c) => c.id === preselectedClientId)
      if (found) {
        setClientId(found.id)
        setClientName(found.name)
        setIsTeamContext(false)
        if (found.address) {
          const addressText = [found.address.street, found.address.neighborhood, found.address.city]
            .filter(Boolean)
            .join(", ")
          if (addressText) setLocation(addressText)
        }
      }
    }
  }, [preselectedClientId, clients])

  const [items, setItems] = useState<MeasurementServiceItem[]>(
    initialData?.items || []
  )

  const [operationalCosts, setOperationalCosts] = useState<OperationalCosts>(
    initialData?.operationalCosts || {
      transport: 0,
      lodging: 0,
      food: 0,
      extraSetup: 0,
      notes: "",
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cálculos reativos em tempo real
  const servicesTotal = useMemo(() => calculateServicesTotal(items), [items])
  const costsTotal = useMemo(
    () => calculateOperationalCostsTotal(operationalCosts),
    [operationalCosts]
  )
  const grandTotal = useMemo(
    () => calculateGrandTotal(servicesTotal, costsTotal),
    [servicesTotal, costsTotal]
  )

  // Adicionar item a partir do catálogo de Serviços
  const addItemFromService = (service: ServiceItem) => {
    const newItem: MeasurementServiceItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      serviceId: service.id,
      serviceName: service.name,
      materialName: "",
      unit: service.unit,
      quantity: 1,
      unitPrice: service.basePrice,
      subtotal: calculateItemSubtotal(1, service.basePrice),
    }

    setItems((prev) => [...prev, newItem])
    // Limpa erro de itens se houver
    if (errors.items) {
      setErrors((prev) => {
        const { items: _, ...rest } = prev
        return rest
      })
    }
  }

  // Atualizar campo de um item
  const updateItem = (
    itemId: string,
    field: "materialName" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

        const updated = { ...item }

        if (field === "materialName") {
          updated.materialName = String(value)
        } else if (field === "quantity") {
          const num = typeof value === "number" ? value : parseFloat(String(value)) || 0
          updated.quantity = num
          updated.subtotal = calculateItemSubtotal(num, updated.unitPrice)
        } else if (field === "unitPrice") {
          const num = typeof value === "number" ? value : parseFloat(String(value)) || 0
          updated.unitPrice = num
          updated.subtotal = calculateItemSubtotal(updated.quantity, num)
        }

        return updated
      })
    )
  }

  // Remover item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  // Atualizar custos operacionais
  const updateOperationalCost = (
    field: keyof OperationalCosts,
    value: string | number
  ) => {
    setOperationalCosts((prev) => ({
      ...prev,
      [field]: field === "notes" ? String(value) : Number(value) || 0,
    }))
  }

  // Validação
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Informe um título ou nome para a medição."
    }

    if (!isTeamContext && !clientName.trim()) {
      newErrors.client = "Selecione ou informe o cliente ou construtora."
    }

    if (items.length === 0) {
      newErrors.items = "Adicione ao menos um serviço na medição."
    } else {
      const hasInvalidItem = items.some((i) => i.quantity <= 0)
      if (hasInvalidItem) {
        newErrors.items = "Todos os itens devem ter quantidade maior que zero."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar rascunho
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setErrors({ title: "Informe ao menos um título para salvar como rascunho." })
      return
    }

    setIsSubmitting(true)
    const newMeasurement = addMeasurement({
      title: title.trim(),
      date,
      location: location.trim(),
      clientId: isTeamContext ? undefined : clientId,
      clientName: isTeamContext ? "Liderança de Campo / Matriz" : clientName,
      isTeamContext,
      leaderId: isTeamContext ? user?.id : undefined,
      items,
      operationalCosts,
      servicesTotal,
      costsTotal,
      grandTotal,
      status: "pending",
    })

    setIsSubmitting(false)
    navigate("/medicoes")
    return newMeasurement
  }

  // Finalizar e Gerar Link
  const handleFinalizeAndShare = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    const newMeasurement = addMeasurement({
      title: title.trim(),
      date,
      location: location.trim(),
      clientId: isTeamContext ? undefined : clientId,
      clientName: isTeamContext ? "Liderança de Campo / Matriz" : clientName,
      isTeamContext,
      leaderId: isTeamContext ? user?.id : undefined,
      items,
      operationalCosts,
      servicesTotal,
      costsTotal,
      grandTotal,
      status: "pending",
    })

    setIsSubmitting(false)
    // Abre modal de link compartilhado diretamente
    openShareModal(newMeasurement)
    navigate("/medicoes")
  }

  return {
    title,
    setTitle,
    date,
    setDate,
    location,
    setLocation,
    clientId,
    setClientId,
    clientName,
    setClientName,
    isTeamContext,
    setIsTeamContext,
    items,
    operationalCosts,
    errors,
    isSubmitting,
    servicesTotal,
    costsTotal,
    grandTotal,
    addItemFromService,
    updateItem,
    removeItem,
    updateOperationalCost,
    handleSaveDraft,
    handleFinalizeAndShare,
  }
}
