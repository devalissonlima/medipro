import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MASTER_SERVICE_UNIT_LABELS, type MasterServiceType, type MasterServiceUnit } from "@/types/catalog"

interface MasterServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; category: string; defaultUnit: MasterServiceUnit }) => void
  initialData?: MasterServiceType | null
}

const CATEGORY_SUGGESTIONS = [
  "Assentamento",
  "Corte",
  "Furação",
  "Acabamento",
  "Instalação",
  "Outros",
]

const UNIT_OPTIONS: { value: MasterServiceUnit; label: string }[] = [
  { value: "m2", label: "Metro Quadrado (m²)" },
  { value: "m_linear", label: "Metro Linear (m linear)" },
  { value: "un", label: "Unidade (un)" },
  { value: "cm", label: "Centímetro (cm)" },
  { value: "diaria", label: "Diária (diária)" },
]

export function MasterServiceModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: MasterServiceModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Assentamento")
  const [customCategory, setCustomCategory] = useState("")
  const [defaultUnit, setDefaultUnit] = useState<MasterServiceUnit>("m2")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      if (CATEGORY_SUGGESTIONS.includes(initialData.category)) {
        setCategory(initialData.category)
        setCustomCategory("")
      } else {
        setCategory("Outros")
        setCustomCategory(initialData.category)
      }
      setDefaultUnit(initialData.defaultUnit)
    } else {
      setName("")
      setCategory("Assentamento")
      setCustomCategory("")
      setDefaultUnit("m2")
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "O nome do serviço é obrigatório."
    }

    const finalCategory = category === "Outros" && customCategory.trim()
      ? customCategory.trim()
      : category

    if (!finalCategory) {
      newErrors.category = "Selecione ou informe uma categoria."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      name: name.trim(),
      category: finalCategory,
      defaultUnit,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Tipo de Serviço" : "Novo Serviço Padronizado"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Altere a nomenclatura ou unidade padrão deste serviço corporativo."
              : "Cadastre um tipo de serviço padronizado para uso nos escopos de projetos da empresa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nome do Serviço */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Nome do Serviço <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
              }}
              placeholder="Ex: Assentamento de Piso Porcelanato"
              className={errors.name ? "border-rose-300" : ""}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Categoria <span className="text-rose-500">*</span>
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs"
            >
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            {category === "Outros" && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Especifique a categoria personalizada"
                className="mt-2 text-xs"
              />
            )}
          </div>

          {/* Unidade Padrão */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Unidade de Medida Padrão <span className="text-rose-500">*</span>
            </label>
            <Select
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value as MasterServiceUnit)}
              className="w-full text-xs"
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({MASTER_SERVICE_UNIT_LABELS[opt.value]})
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-slate-400">
              Esta unidade será adotada automaticamente ao adicionar este serviço ao escopo de qualquer projeto.
            </p>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              {initialData ? "Salvar Alterações" : "Cadastrar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
