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
import { CatalogItemTypeSelector } from "@/components/shared/CatalogItemTypeSelector"
import { useServiceForm } from "../hooks/useServiceForm"
import { useServicesStore } from "@/stores/servicesStore"
import type { ServiceCategory, ServiceUnit } from "@/types/service"
import {
  MEASUREMENT_UNIT_OPTIONS,
  SERVICE_CATEGORIES,
  SERVICE_UNIT_LABELS,
} from "@/types/service"
import { Plus, X, Tag, Wallet } from "lucide-react"

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
    itemType,
    setItemType,
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
      <DialogContent
        onClose={closeFormModal}
        className="max-w-2xl p-0 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90dvh] overflow-hidden"
      >
        <DialogHeader className="px-5 pt-5 pb-4 sm:px-7 sm:pt-6 border-b border-slate-100 shrink-0 mb-0">
          <DialogTitle>
            {isEditing ? "Editar Item do Catálogo" : "Novo Serviço ou Item Avulso"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o preço, a unidade de cobrança e as observações deste item no seu catálogo."
              : "Cadastre um serviço, material ou diária no seu catálogo pessoal para usar em orçamentos e medições."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Corpo com scroll interno exclusivo */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-6">
            {/* Seção 1: Tipo do Item */}
            <CatalogItemTypeSelector
              label="1. Qual é o tipo deste item?"
              value={itemType}
              onChange={setItemType}
            />

            {/* Seção 2: Identificação (Nome + Categoria) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1.5">
                <label
                  htmlFor="service-name"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  Nome do Serviço ou Material <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="service-name"
                  placeholder={
                    itemType === "material"
                      ? "Ex: Argamassa AC3 Branca 20kg"
                      : itemType === "subcontract"
                      ? "Ex: Diária de Ajudante / Auxiliar"
                      : "Ex: Assentamento de Mármore Travertino"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={
                    errors.name
                      ? "border-rose-400 focus-visible:ring-rose-400"
                      : ""
                  }
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label
                  htmlFor="service-category"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  Categoria / Grupo <span className="text-rose-500">*</span>
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
            </div>

            {/* Seção 3: Como você cobra por este item? */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">
                  2. Como você cobra por este item?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="service-unit"
                    className="text-xs font-semibold text-slate-700 block"
                  >
                    Unidade de Cobrança <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    id="service-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ServiceUnit)}
                  >
                    {MEASUREMENT_UNIT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="service-price"
                    className="text-xs font-semibold text-slate-700 block"
                  >
                    Seu Preço por Unidade (R$){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
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
                        errors.basePrice
                          ? "border-rose-400 focus-visible:ring-rose-400"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.basePrice && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {errors.basePrice}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Valor padrão sugerido por{" "}
                <strong className="text-slate-700">
                  {SERVICE_UNIT_LABELS[unit]}
                </strong>
                . Você poderá ajustá-lo livremente em cada orçamento ou medição.
              </p>
            </div>

            {/* Seção 4: Detalhes Opcionais (Etiquetas Rápidas + Observações) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
              {/* Etiquetas Rápidas */}
              <div className="md:col-span-6 space-y-2.5">
                <label
                  htmlFor="service-tags"
                  className="text-xs font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    Etiquetas Rápidas (Opcional)
                  </span>
                </label>

                <div className="flex gap-2">
                  <Input
                    id="service-tags"
                    placeholder="Ex: Andaime, Altura > 3m..."
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

                {/* Sugestões clicáveis */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {SUGGESTED_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="unstyled"
                      size="auto"
                      onClick={() => addTag(tag)}
                      disabled={complexityTags.includes(tag)}
                      className={`text-[10px] rounded-md px-2 py-0.5 border transition-colors ${
                        complexityTags.includes(tag)
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                      }`}
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>

                {/* Etiquetas selecionadas */}
                {complexityTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {complexityTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-[11px] py-0.5"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="unstyled"
                          size="auto"
                          onClick={() => removeTag(tag)}
                          className="text-amber-700 hover:text-rose-600"
                          aria-label={`Remover tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações / O que está incluso */}
              <div className="md:col-span-6 space-y-2.5">
                <label
                  htmlFor="service-description"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  Observações / O que está incluso (Opcional)
                </label>
                <Textarea
                  id="service-description"
                  rows={4}
                  placeholder="Descreva particularidades, ferramentas necessárias ou o que está incluso neste valor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[112px] text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-4 sm:px-7 border-t border-slate-100 bg-slate-50/70 shrink-0 mt-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeFormModal}
              className="text-xs h-10 px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm h-10 px-5"
            >
              {isEditing ? "Salvar Alterações" : "Salvar no Catálogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
