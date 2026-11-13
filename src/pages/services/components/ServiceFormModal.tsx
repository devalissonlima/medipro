import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useServiceForm } from "../hooks/useServiceForm"
import { useServicesStore } from "@/stores/servicesStore"
import type { ServiceCategory, ServiceUnit } from "@/types/service"
import { SERVICE_CATEGORIES, SERVICE_UNIT_LABELS } from "@/types/service"
import { Plus, X, Tag } from "lucide-react"

const SUGGESTED_TAGS = [
  "Material Nobre",
  "Alto Risco",
  "Precisão Milimétrica",
  "Padrão",
  "Acabamento Fino",
  "Grandes Formatos",
]

export function ServiceFormModal() {
  const isFormOpen = useServicesStore((state) => state.isFormOpen)
  const {
    isEditing,
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
  } = useServiceForm()

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={closeFormModal}>
      <DialogContent onClose={closeFormModal} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Serviço do Catálogo" : "Novo Serviço de Catálogo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações de precificação e detalhes operacionais deste serviço."
              : "Defina o nome, categoria, unidade de medida e preço de referência para utilização em medições e orçamentos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Serviço */}
          <div className="space-y-1.5">
            <label
              htmlFor="service-name"
              className="text-xs font-semibold text-slate-700"
            >
              Nome do Serviço <span className="text-rose-500">*</span>
            </label>
            <Input
              id="service-name"
              placeholder="Ex: Assentamento de Mármore Travertino"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Categoria e Unidade (Duas colunas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="service-category"
                className="text-xs font-semibold text-slate-700"
              >
                Categoria <span className="text-rose-500">*</span>
              </label>
              <Select
                id="service-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-unit"
                className="text-xs font-semibold text-slate-700"
              >
                Unidade de Medida <span className="text-rose-500">*</span>
              </label>
              <Select
                id="service-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as ServiceUnit)}
              >
                {Object.entries(SERVICE_UNIT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label} ({key})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Preço Base Unitário */}
          <div className="space-y-1.5">
            <label
              htmlFor="service-price"
              className="text-xs font-semibold text-slate-700"
            >
              Valor Base Unitário (R$) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                R$
              </span>
              <Input
                id="service-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={`pl-9 font-mono ${
                  errors.basePrice ? "border-rose-400 focus-visible:ring-rose-400" : ""
                }`}
              />
            </div>
            {errors.basePrice && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.basePrice}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Valor de referência por {SERVICE_UNIT_LABELS[unit]}. Pode sofrer ajustes
              nas medições.
            </p>
          </div>

          {/* Tags de Complexidade e Variação */}
          <div className="space-y-2">
            <label
              htmlFor="service-tags"
              className="text-xs font-semibold text-slate-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Tags de Complexidade / Variações
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Pressione Enter para adicionar
              </span>
            </label>

            <div className="flex gap-2">
              <Input
                id="service-tags"
                placeholder="Ex: Andaime, Altura > 3m, Piso Úmido, Noturno..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tagInput)}
                className="h-9 px-3 shrink-0 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Ex: Andaime, Altura &gt; 3m, Piso Úmido, Noturno (digite e pressione Enter ou clique em Adicionar).
            </p>

            {/* Sugestões rápidas */}
            <div className="flex flex-wrap gap-1 items-center pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Sugestões:</span>
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={complexityTags.includes(tag)}
                  className={`text-[10px] rounded px-1.5 py-0.5 border transition-colors ${
                    complexityTags.includes(tag)
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                  }`}
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Tags selecionadas */}
            {complexityTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {complexityTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs py-0.5"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-rose-600"
                      aria-label={`Remover tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Descrição / Detalhes Operacionais */}
          <div className="space-y-1.5">
            <label
              htmlFor="service-description"
              className="text-xs font-semibold text-slate-700"
            >
              Descrição & Detalhes Operacionais (Opcional)
            </label>
            <Textarea
              id="service-description"
              rows={3}
              placeholder="Descreva particularidades do serviço, ferramentas necessárias ou instruções para a equipe de campo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeFormModal}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm"
            >
              {isEditing ? "Salvar Alterações" : "Cadastrar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
