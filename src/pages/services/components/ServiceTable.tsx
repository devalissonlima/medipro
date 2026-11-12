import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ServiceItem, ServiceCategory } from "@/types/service"
import { SERVICE_UNIT_LABELS } from "@/types/service"

interface ServiceTableProps {
  services: ServiceItem[]
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

export function ServiceTable({ services, onEdit, onDelete }: ServiceTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 text-xs">
              Serviço & Descrição
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-36">
              Categoria
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-28">
              Unidade
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-40 text-right">
              Preço Base
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs">
              Variações / Tags
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-28 text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const categoryStyle =
              CATEGORY_COLORS[service.category] || CATEGORY_COLORS.Outros

            return (
              <TableRow
                key={service.id}
                className="hover:bg-slate-50/80 transition-colors border-b border-slate-100"
              >
                {/* Nome & Descrição */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {service.name}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                        {service.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Categoria */}
                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className={`${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} text-xs font-medium`}
                  >
                    {service.category}
                  </Badge>
                </TableCell>

                {/* Unidade */}
                <TableCell className="py-3.5">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {SERVICE_UNIT_LABELS[service.unit]}
                  </span>
                </TableCell>

                {/* Preço Base */}
                <TableCell className="py-3.5 text-right font-mono">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-900 text-sm">
                      {formatPrice(service.basePrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      por {SERVICE_UNIT_LABELS[service.unit]}
                    </span>
                  </div>
                </TableCell>

                {/* Tags */}
                <TableCell className="py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {service.complexityTags && service.complexityTags.length > 0 ? (
                      service.complexityTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="py-3.5 text-center">
                  {deletingId === service.id ? (
                    <div className="flex items-center justify-center gap-1 animate-in fade-in">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => setDeletingId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
                        onClick={() => {
                          onDelete(service.id)
                          setDeletingId(null)
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(service)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Editar serviço"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(service.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Excluir serviço"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
