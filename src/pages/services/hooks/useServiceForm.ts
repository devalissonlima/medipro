import { useState, useEffect } from "react"
import { useServicesStore } from "@/stores/servicesStore"
import type { ServiceCategory, ServiceUnit } from "@/types/service"

export function useServiceForm() {
  const { isFormOpen, editingService, closeFormModal, addService, updateService } =
    useServicesStore()

  const [name, setName] = useState("")
  const [category, setCategory] = useState<ServiceCategory>("Assentamento")
  const [unit, setUnit] = useState<ServiceUnit>("m2")
  const [basePrice, setBasePrice] = useState<string>("100.00")
  const [complexityTags, setComplexityTags] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reseta ou popula campos ao abrir modal
  useEffect(() => {
    if (editingService) {
      setName(editingService.name)
      setCategory(editingService.category)
      setUnit(editingService.unit)
      setBasePrice(editingService.basePrice.toFixed(2))
      setComplexityTags(editingService.complexityTags || [])
      setDescription(editingService.description || "")
    } else {
      setName("")
      setCategory("Assentamento")
      setUnit("m2")
      setBasePrice("")
      setComplexityTags([])
      setDescription("")
    }
    setTagInput("")
    setErrors({})
  }, [editingService, isFormOpen])

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim()
    if (!trimmed) return
    if (!complexityTags.includes(trimmed)) {
      setComplexityTags((prev) => [...prev, trimmed])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setComplexityTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "O nome do serviço é obrigatório."
    }

    const priceNum = parseFloat(basePrice.replace(",", "."))
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.basePrice = "Informe um valor numérico válido maior que zero."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const priceNum = parseFloat(basePrice.replace(",", "."))

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        category,
        unit,
        basePrice: priceNum,
        complexityTags,
        description: description.trim(),
      })
    } else {
      addService({
        name: name.trim(),
        category,
        unit,
        basePrice: priceNum,
        complexityTags,
        description: description.trim(),
      })
    }
  }

  return {
    isEditing: !!editingService,
    name,
    setName,
    category,
    setCategory,
    unit,
    setUnit,
    basePrice,
    setBasePrice,
    complexityTags,
    description,
    setDescription,
    tagInput,
    setTagInput,
    errors,
    addTag,
    removeTag,
    handleSubmit,
    closeFormModal,
  }
}
