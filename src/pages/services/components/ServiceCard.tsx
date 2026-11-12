import { useState } from "react"
import {
  Pencil,
  Trash2,
  Layers,
  Ruler,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ServiceItem, ServiceCategory } from "@/types/service"
import { SERVICE_UNIT_LABELS } from "@/types/service"

interface ServiceCardProps {
  service: ServiceItem
  onEdit: (service: ServiceItem) => void
  onDelete: (id: string) => void
}

const CATEGORY_COLORS: Record<ServiceCategory, { bg: string; text: string; border: string }> = {
  Assentamento: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Corte: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Acabamento: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Furação: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Instalação: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Outros: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(service.basePrice)

  const categoryStyle = CATEGORY_COLORS[service.category] || CATEGORY_COLORS.Outros

  return (
    <Card className="flex flex-col justify-between border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200 relative group overflow-hidden">
      {/* Top Category Banner / Accent */}
      <div className="h-1 w-full bg-slate-200 group-hover:bg-amber-500 transition-colors" />

      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} font-medium text-xs px-2.5 py-0.5 rounded-md`}
          >
            {service.category}
          </Badge>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Ruler className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-700">
              {SERVICE_UNIT_LABELS[service.unit]}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-800 transition-colors">
          {service.name}
        </h3>

        {service.description && (
          <div>
            <p
              className={`text-xs text-slate-500 leading-relaxed ${
                !isExpanded ? "line-clamp-2" : ""
              }`}
            >
              {service.description}
            </p>
            {service.description.length > 80 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-[11px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
              >
                {isExpanded ? (
                  <>
                    Menos <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Mais detalhes <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 pb-3 space-y-3">
        {/* Tags de Complexidade */}
        {service.complexityTags && service.complexityTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {service.complexityTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Preço Unitário em Destaque */}
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Preço Base:
          </span>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-xs text-slate-500 ml-1">
              / {SERVICE_UNIT_LABELS[service.unit]}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        {showConfirmDelete ? (
          <div className="flex items-center justify-between w-full gap-2 animate-in fade-in">
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Excluir?
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setShowConfirmDelete(false)}
              >
                Não
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs px-2.5 bg-rose-600 hover:bg-rose-700"
                onClick={() => onDelete(service.id)}
              >
                Sim
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {service.id}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
                className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 gap-1.5 px-2.5"
                aria-label={`Editar ${service.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                aria-label={`Excluir ${service.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
