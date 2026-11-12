import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
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
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()

  const editId = params.id || searchParams.get("editId") || initialData?.id
  const preselectedClientId = searchParams.get("clientId")
  const preselectedProjectId = searchParams.get("projectId")

  const { measurements, addMeasurement, updateMeasurement, openShareModal, setNotification } =
    useMeasurementsStore()
  const clients = useClientsStore((state) => state.clients)
  const { projects, members } = useProjectsStore()
  const user = useAuthStore((state) => state.user)

  // Localiza a medição existente para edição, se houver
  const existingMeasurement = useMemo(() => {
    if (!editId) return null
    return measurements.find((m) => m.id === editId) || null
  }, [measurements, editId])

  const isApproved = existingMeasurement?.status === "approved"
  const isEditing = !!existingMeasurement

  // Regras RBAC do formulário
  const requiresProjectSelection =
    user?.role === "MEMBER" || user?.role === "PROJECT_SUPERVISOR"

  // Projetos disponíveis conforme o perfil
  const availableProjects = useMemo(() => {
    if (!user) return []
    const tenantProjects = projects.filter((p) => p.tenantId === user.tenantId)

    if (requiresProjectSelection) {
      const activeProjectIds = new Set(
        members
          .filter(
            (m) =>
              m.status === "active" &&
              (m.userId === user.id || m.userEmail === user.email)
          )
          .map((m) => m.projectId)
      )
      return tenantProjects.filter(
        (p) => activeProjectIds.has(p.id) && p.status !== "completed"
      )
    }

    return tenantProjects
  }, [projects, members, user, requiresProjectSelection])

  // Estados dos campos do formulário
  const [title, setTitle] = useState(
    existingMeasurement?.title || initialData?.title || ""
  )
  const [date, setDate] = useState(
    existingMeasurement?.date ||
      initialData?.date ||
      new Date().toISOString().split("T")[0]
  )
  const [location, setLocation] = useState(
    existingMeasurement?.location || initialData?.location || ""
  )
  const [projectId, setProjectId] = useState(
    existingMeasurement?.projectId || initialData?.projectId || ""
  )
  const [clientId, setClientId] = useState(
    existingMeasurement?.clientId || initialData?.clientId || ""
  )
  const [clientName, setClientName] = useState(
    existingMeasurement?.clientName || initialData?.clientName || ""
  )
  const [isTeamContext, setIsTeamContext] = useState(
    existingMeasurement?.isTeamContext ??
      initialData?.isTeamContext ??
      requiresProjectSelection
  )

  const [items, setItems] = useState<MeasurementServiceItem[]>(
    existingMeasurement?.items || initialData?.items || []
  )

  const [operationalCosts, setOperationalCosts] = useState<OperationalCosts>(
    existingMeasurement?.operationalCosts ||
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

  // Atualiza estados se a medição existente for carregada após render inicial
  useEffect(() => {
    if (existingMeasurement) {
      setTitle(existingMeasurement.title)
      setDate(existingMeasurement.date)
      setLocation(existingMeasurement.location || "")
      setProjectId(existingMeasurement.projectId || "")
      setClientId(existingMeasurement.clientId || "")
      setClientName(existingMeasurement.clientName || "")
      setIsTeamContext(existingMeasurement.isTeamContext)
      setItems(existingMeasurement.items)
      if (existingMeasurement.operationalCosts) {
        setOperationalCosts(existingMeasurement.operationalCosts)
      }
    }
  }, [existingMeasurement])

  const selectedProject = useMemo(
    () => availableProjects.find((p) => p.id === projectId) || null,
    [availableProjects, projectId]
  )

  // Pré-seleciona projeto vindo da URL (?projectId=xxx) se não estiver editando
  useEffect(() => {
    if (preselectedProjectId && !editId) {
      const found = availableProjects.find((p) => p.id === preselectedProjectId)
      if (found) {
        setProjectId(found.id)
        const linkedClient = clients.find((c) => c.id === found.clientId)
        if (linkedClient) {
          setClientId(linkedClient.id)
          setClientName(linkedClient.name)
        } else if (found.clientName) {
          setClientId(found.clientId)
          setClientName(found.clientName)
        }
      }
    }
  }, [preselectedProjectId, editId, availableProjects, clients])

  // Pré-seleciona cliente vindo da URL (?clientId=xxx) se não estiver editando
  useEffect(() => {
    if (preselectedClientId && !requiresProjectSelection && !editId) {
      const found = clients.find((c) => c.id === preselectedClientId)
      if (found) {
        setClientId(found.id)
        setClientName(found.name)
        setIsTeamContext(false)
        if (found.address) {
          const addressText = [
            found.address.street,
            found.address.neighborhood,
            found.address.city,
          ]
            .filter(Boolean)
            .join(", ")
          if (addressText) setLocation(addressText)
        }
      }
    }
  }, [preselectedClientId, editId, clients, requiresProjectSelection])

  const handleSelectProject = (newProjectId: string) => {
    if (isApproved) return
    setProjectId(newProjectId)
    const proj = availableProjects.find((p) => p.id === newProjectId)
    if (proj) {
      const linkedClient = clients.find((c) => c.id === proj.clientId)
      setClientId(proj.clientId)
      setClientName(linkedClient?.name || proj.clientName || "")
    }
    if (errors.project) {
      setErrors((prev) => {
        const rest = { ...prev }
        delete rest.project
        return rest
      })
    }
  }

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

  const addItemFromService = (service: ServiceItem) => {
    if (isApproved) return
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
    if (errors.items) {
      setErrors((prev) => {
        const rest = { ...prev }
        delete rest.items
        return rest
      })
    }
  }

  const updateItem = (
    itemId: string,
    field: "materialName" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    if (isApproved) return
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

        const updated = { ...item }

        if (field === "materialName") {
          updated.materialName = String(value)
        } else if (field === "quantity") {
          const num =
            typeof value === "number" ? value : parseFloat(String(value)) || 0
          updated.quantity = num
          updated.subtotal = calculateItemSubtotal(num, updated.unitPrice)
        } else if (field === "unitPrice") {
          const num =
            typeof value === "number" ? value : parseFloat(String(value)) || 0
          updated.unitPrice = num
          updated.subtotal = calculateItemSubtotal(updated.quantity, num)
        }

        return updated
      })
    )
  }

  const removeItem = (itemId: string) => {
    if (isApproved) return
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const updateOperationalCost = (
    field: keyof OperationalCosts,
    value: string | number
  ) => {
    if (isApproved) return
    setOperationalCosts((prev) => ({
      ...prev,
      [field]: field === "notes" ? String(value) : Number(value) || 0,
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Informe um título ou nome para a medição."
    }

    if (requiresProjectSelection && !projectId) {
      newErrors.project = "Selecione a qual projeto esta medição será vinculada."
    }

    if (!requiresProjectSelection && !isTeamContext && !clientName.trim()) {
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

  const buildPayload = (status: "draft" | "pending") => {
    const resolvedClientName =
      selectedProject?.clientName ||
      clientName ||
      (isTeamContext ? "Liderança de Campo / Obra" : "Cliente")

    return {
      title: title.trim(),
      date,
      location: location.trim(),
      projectId: projectId || undefined,
      projectTitle: selectedProject?.title || existingMeasurement?.projectTitle,
      clientId: selectedProject?.clientId || clientId || undefined,
      clientName: resolvedClientName,
      isTeamContext: requiresProjectSelection ? true : isTeamContext,
      collaboratorId: existingMeasurement?.collaboratorId || user?.id,
      collaboratorName: existingMeasurement?.collaboratorName || user?.name,
      collaboratorAvatar: existingMeasurement?.collaboratorAvatar || user?.avatarUrl,
      leaderId: isTeamContext ? user?.id : undefined,
      items,
      operationalCosts,
      servicesTotal,
      costsTotal,
      grandTotal,
      status,
    }
  }

  // 1. Salvar como RASCUNHO (status: "draft")
  const handleSaveDraft = async () => {
    if (isApproved) {
      setNotification({
        message: "Medições aprovadas não podem ser alteradas.",
        type: "error",
      })
      return
    }

    if (!title.trim()) {
      setErrors({
        title: "Informe ao menos um título para salvar como rascunho.",
      })
      return
    }

    setIsSubmitting(true)

    const isMember = user?.role === "MEMBER"

    if (existingMeasurement) {
      updateMeasurement(existingMeasurement.id, buildPayload("draft"))
      setNotification({
        message: isMember
          ? `Rascunho da medição "${title.trim()}" salvo com sucesso! Visível apenas para você na obra.`
          : `Rascunho da medição "${title.trim()}" atualizado com sucesso!`,
        type: "success",
      })
    } else {
      addMeasurement(buildPayload("draft"))
      setNotification({
        message: isMember
          ? `Medição salva como Rascunho! Visível apenas para você, pronta para continuar depois.`
          : `Medição salva como Rascunho! Você pode continuar editando depois.`,
        type: "success",
      })
    }

    setIsSubmitting(false)
    navigate(projectId ? `/projetos/${projectId}` : "/medicoes")
  }

  // 2. Finalizar e Enviar para Conferência / Cliente (status: "pending")
  const handleFinalizeAndShare = async () => {
    if (isApproved) {
      setNotification({
        message: "Medições aprovadas não podem ser alteradas.",
        type: "error",
      })
      return
    }

    if (!validate()) return

    setIsSubmitting(true)

    const isMember = user?.role === "MEMBER"

    if (existingMeasurement) {
      updateMeasurement(existingMeasurement.id, buildPayload("pending"))
      setNotification({
        message: isMember
          ? `Medição "${title.trim()}" finalizada e enviada para o projeto! Agora disponível para conferência do gestor.`
          : `Medição "${title.trim()}" finalizada com sucesso! Disponível no projeto e pronta para envio.`,
        type: "success",
      })
      setIsSubmitting(false)

      if (requiresProjectSelection) {
        navigate(projectId ? `/projetos/${projectId}` : "/medicoes")
      } else {
        openShareModal({
          ...existingMeasurement,
          ...buildPayload("pending"),
        })
        navigate(projectId ? `/projetos/${projectId}` : "/medicoes")
      }
    } else {
      const newMeasurement = addMeasurement(buildPayload("pending"))
      setNotification({
        message: isMember
          ? `Medição "${title.trim()}" finalizada e enviada para o projeto! Agora disponível para conferência do gestor.`
          : `Medição "${title.trim()}" finalizada com sucesso! Disponível no projeto e pronta para envio.`,
        type: "success",
      })
      setIsSubmitting(false)

      if (requiresProjectSelection) {
        navigate(projectId ? `/projetos/${projectId}` : "/medicoes")
      } else {
        openShareModal(newMeasurement)
        navigate(projectId ? `/projetos/${projectId}` : "/medicoes")
      }
    }
  }

  return {
    isEditing,
    isApproved,
    existingMeasurement,
    title,
    setTitle,
    date,
    setDate,
    location,
    setLocation,
    projectId,
    handleSelectProject,
    availableProjects,
    requiresProjectSelection,
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
