import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useAuthStore } from "@/stores/authStore"
import {
  normalizeMeasurementUnit,
  type CatalogItemType,
  type ServiceItem,
} from "@/types/service"
import type {
  MeasurementServiceItem,
  OperationalCosts,
  Measurement,
  AuditStatus,
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

  // Escopo do Projeto Selecionado
  const projectScopeItems = useMemo(() => {
    return selectedProject?.scopeItems || []
  }, [selectedProject])

  // Quantidade já executada para cada item de escopo por outras medições da obra
  const scopeItemExecutions = useMemo(() => {
    if (!projectId) return new Map<string, number>()
    const map = new Map<string, number>()

    measurements
      .filter(
        (m) =>
          m.projectId === projectId &&
          m.id !== editId &&
          m.status !== "rejected"
      )
      .forEach((m) => {
        m.items?.forEach((serviceItem) => {
          const match = projectScopeItems.find(
            (s) =>
              (serviceItem.masterServiceId &&
                s.masterServiceId === serviceItem.masterServiceId) ||
              s.serviceName.toLowerCase() ===
                serviceItem.serviceName.toLowerCase()
          )
          if (match) {
            const current = map.get(match.id) || 0
            map.set(match.id, current + serviceItem.quantity)
          }
        })
      })
    return map
  }, [measurements, projectId, editId, projectScopeItems])

  const findScopeItem = (service: {
    name?: string
    serviceName?: string
    id?: string
    masterServiceId?: string
  }) => {
    const sName = service.name || service.serviceName || ""
    const sId = service.masterServiceId || service.id
    return projectScopeItems.find(
      (s) =>
        (sName && s.serviceName.toLowerCase() === sName.toLowerCase()) ||
        (sId && s.masterServiceId === sId)
    )
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

  // Quebra de totais por natureza da composição (Mão de Obra / Materiais / Terceiros)
  const typeBreakdown = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const t = item.itemType || "labor"
        if (t === "material") acc.material += item.subtotal
        else if (t === "subcontract") acc.subcontract += item.subtotal
        else acc.labor += item.subtotal
        return acc
      },
      { labor: 0, material: 0, subcontract: 0 }
    )
  }, [items])

  // Separação financeira: No Escopo vs. Em Auditoria (Excedente + Fora de Escopo)
  const inScopeTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.isOutOfScope) return sum
      if (item.isExceeded && item.exceededQuantity) {
        const withinQty = Math.max(0, item.quantity - item.exceededQuantity)
        return sum + calculateItemSubtotal(withinQty, item.unitPrice)
      }
      return sum + item.subtotal
    }, 0)
  }, [items])

  const auditPendingTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.isOutOfScope) {
        return sum + item.subtotal
      }
      if (item.isExceeded && item.exceededQuantity) {
        return sum + calculateItemSubtotal(item.exceededQuantity, item.unitPrice)
      }
      return sum
    }, 0)
  }, [items])

  const addItemFromService = (service: ServiceItem, forceOutOfScope = false) => {
    if (isApproved) return
    const matchedScope = !forceOutOfScope ? findScopeItem(service) : undefined

    let isExceeded = false
    let exceededQuantity: number | undefined = undefined
    let auditStatus: AuditStatus = "not_required"

    if (forceOutOfScope || !matchedScope) {
      if (forceOutOfScope || (projectScopeItems.length > 0 && !matchedScope)) {
        auditStatus = "pending"
      }
    } else {
      const otherQty = scopeItemExecutions.get(matchedScope.id) || 0
      const existingInForm = items
        .filter(
          (i) =>
            !i.isOutOfScope &&
            (i.masterServiceId === matchedScope.masterServiceId ||
              i.serviceName.toLowerCase() === matchedScope.serviceName.toLowerCase())
        )
        .reduce((sum, i) => sum + i.quantity, 0)

      const totalWithNew = otherQty + existingInForm + 1
      if (totalWithNew > matchedScope.maxQuantity) {
        isExceeded = true
        exceededQuantity = totalWithNew - matchedScope.maxQuantity
        auditStatus = "pending"
      }
    }

    const newItem: MeasurementServiceItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      masterServiceId: matchedScope?.masterServiceId,
      serviceId: service.id,
      itemType: service.itemType || "labor",
      serviceName: service.name,
      materialName: "",
      unit: normalizeMeasurementUnit(matchedScope ? matchedScope.unit : service.unit),
      quantity: 1,
      unitPrice: service.basePrice,
      subtotal: calculateItemSubtotal(1, service.basePrice),
      isOutOfScope: forceOutOfScope,
      isExceeded,
      exceededQuantity,
      exceededReason: isExceeded ? "client_additive" : undefined,
      auditStatus: forceOutOfScope ? "pending" : auditStatus,
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

  const addOutOfScopeItem = (service: ServiceItem) => {
    addItemFromService(service, true)
  }

  const addManualItem = (itemType: CatalogItemType = "labor") => {
    if (isApproved) return
    const isOutOfScopeContext = projectScopeItems.length > 0
    const newItem: MeasurementServiceItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      serviceId: `manual-${Date.now().toString(36)}`,
      itemType,
      serviceName: "",
      materialName: "",
      unit:
        itemType === "subcontract"
          ? "diária"
          : itemType === "material"
          ? "unidade"
          : "m²",
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
      isOutOfScope: isOutOfScopeContext,
      isExceeded: false,
      auditStatus: isOutOfScopeContext ? "pending" : "not_required",
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
    field:
      | "serviceName"
      | "materialName"
      | "unit"
      | "itemType"
      | "quantity"
      | "unitPrice",
    value: string | number
  ) => {
    if (isApproved) return
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

        const updated = { ...item }

        if (field === "serviceName") {
          updated.serviceName = String(value)
        } else if (field === "materialName") {
          updated.materialName = String(value)
        } else if (field === "unit") {
          updated.unit = String(value)
        } else if (field === "itemType") {
          updated.itemType = value as CatalogItemType
        } else if (field === "quantity") {
          const num =
            typeof value === "number" ? value : parseFloat(String(value)) || 0
          updated.quantity = num
          updated.subtotal = calculateItemSubtotal(num, updated.unitPrice)

          // Recalcula trava elástica se não for fora de escopo
          if (!updated.isOutOfScope) {
            const matchedScope = findScopeItem(updated)
            if (matchedScope) {
              const otherInProject = scopeItemExecutions.get(matchedScope.id) || 0
              const otherInForm = items
                .filter(
                  (i) =>
                    i.id !== itemId &&
                    !i.isOutOfScope &&
                    (i.masterServiceId === matchedScope.masterServiceId ||
                      i.serviceName.toLowerCase() === matchedScope.serviceName.toLowerCase())
                )
                .reduce((sum, i) => sum + i.quantity, 0)

              const totalCombined = otherInProject + otherInForm + num
              if (totalCombined > matchedScope.maxQuantity) {
                updated.isExceeded = true
                updated.exceededQuantity = totalCombined - matchedScope.maxQuantity
                updated.auditStatus = "pending"
                if (!updated.exceededReason) {
                  updated.exceededReason = "client_additive"
                }
              } else {
                updated.isExceeded = false
                updated.exceededQuantity = undefined
                updated.auditStatus = "not_required"
              }
            }
          }
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

  const updateItemAuditField = <K extends keyof MeasurementServiceItem>(
    itemId: string,
    field: K,
    value: MeasurementServiceItem[K]
  ) => {
    if (isApproved) return
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
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
      const hasInvalidItem = items.some(
        (i) => !i.serviceName?.trim() || i.quantity <= 0
      )
      if (hasInvalidItem) {
        newErrors.items =
          "Todos os itens devem possuir nome e quantidade maior que zero."
      }

      // Validação de itens com excesso (trava elástica)
      const missingPhotoExceeded = items.find(
        (i) => i.isExceeded && !i.evidencePhotoUrl
      )
      if (missingPhotoExceeded) {
        newErrors.audit = `O item excedente "${missingPhotoExceeded.serviceName}" requer o envio de foto de evidência da obra para liberação.`
      }

      // Validação de itens fora de escopo (serviço extra)
      const missingDetailsOutOfScope = items.find(
        (i) =>
          i.isOutOfScope && (!i.justificationNotes?.trim() || !i.evidencePhotoUrl)
      )
      if (missingDetailsOutOfScope) {
        if (!missingDetailsOutOfScope.justificationNotes?.trim()) {
          newErrors.audit = `O item fora de escopo "${missingDetailsOutOfScope.serviceName}" requer uma justificativa textual detalhada.`
        } else if (!missingDetailsOutOfScope.evidencePhotoUrl) {
          newErrors.audit = `O item fora de escopo "${missingDetailsOutOfScope.serviceName}" requer o envio de foto de evidência da obra.`
        }
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
      signatureUrl: user?.signatureUrl || existingMeasurement?.signatureUrl,
      signatureName:
        user?.signatureName || existingMeasurement?.signatureName || user?.name,
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
    selectedProject,
    projectScopeItems,
    scopeItemExecutions,
    findScopeItem,
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
    laborTotal: typeBreakdown.labor,
    materialTotal: typeBreakdown.material,
    subcontractTotal: typeBreakdown.subcontract,
    inScopeTotal,
    auditPendingTotal,
    costsTotal,
    grandTotal,
    addItemFromService,
    addOutOfScopeItem,
    addManualItem,
    updateItem,
    updateItemAuditField,
    removeItem,
    updateOperationalCost,
    handleSaveDraft,
    handleFinalizeAndShare,
  }
}
