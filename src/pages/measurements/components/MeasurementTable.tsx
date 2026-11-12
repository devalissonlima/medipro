import { useState } from "react"
import {
  Eye,
  Pencil,
  Share2,
  Trash2,
  CopyPlus,
  Building2,
  Check,
  Copy,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MeasurementStatusBadge } from "./MeasurementStatusBadge"
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementTableProps {
  measurements: Measurement[]
  onOpenDetail: (measurement: Measurement) => void
  onEdit: (id: string) => void
  onOpenShare: (measurement: Measurement) => void
  onCopyLink: (measurement: Measurement) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function MeasurementTable({
  measurements,
  onOpenDetail,
  onEdit,
  onOpenShare,
  onCopyLink,
  onDuplicate,
  onDelete,
}: MeasurementTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (m: Measurement) => {
    onCopyLink(m)
    setCopiedId(m.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 text-xs">
              Medição / Obra
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs">
              Destinatário
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-28">
              Data
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs text-center w-20">
              Itens
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-36 text-right">
              Valor Total
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-32 text-center">
              Status
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-44 text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {measurements.map((measurement) => {
            const canEdit = measurement.status !== "approved"

            return (
              <TableRow
                key={measurement.id}
                className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
              >
                {/* Título & Localização */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <button
                      onClick={() => onOpenDetail(measurement)}
                      className="font-bold text-slate-900 text-sm hover:text-amber-800 transition-colors text-left"
                    >
                      {measurement.title}
                    </button>
                    {measurement.location && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {measurement.location}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Destinatário */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate max-w-[180px]">
                      {measurement.clientName || "Liderança de Campo"}
                    </span>
                  </div>
                </TableCell>

                {/* Data */}
                <TableCell className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
                  {measurement.date}
                </TableCell>

                {/* Qtd. Itens */}
                <TableCell className="py-3.5 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {measurement.items.length}
                  </span>
                </TableCell>

                {/* Valor Total */}
                <TableCell className="py-3.5 text-right font-mono">
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(measurement.grandTotal)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5 text-center">
                  <MeasurementStatusBadge status={measurement.status} />
                </TableCell>

                {/* Ações */}
                <TableCell className="py-3.5 text-center">
                  {deletingId === measurement.id ? (
                    <div className="flex items-center justify-center gap-1 animate-in fade-in">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => setDeletingId(null)}
                      >
                        Não
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
                        onClick={() => {
                          onDelete(measurement.id)
                          setDeletingId(null)
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      {/* Ver Detalhes */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenDetail(measurement)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Editar Medição (disponível se não estiver aprovada) */}
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(measurement.id)}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                          title={
                            measurement.status === "draft"
                              ? "Continuar editando rascunho"
                              : "Editar medição"
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div
                          className="h-8 w-8 flex items-center justify-center opacity-30 cursor-not-allowed text-slate-400"
                          title="Medição aprovada não pode ser editada"
                        >
                          <Pencil className="h-4 w-4" />
                        </div>
                      )}

                      {/* Compartilhar WhatsApp / Modal */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenShare(measurement)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Compartilhar via WhatsApp"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>

                      {/* Copiar Link Rápido */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(measurement)}
                        className={`h-8 w-8 p-0 transition-colors ${
                          copiedId === measurement.id
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                        title="Copiar link para WhatsApp"
                      >
                        {copiedId === measurement.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Duplicar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(measurement.id)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Duplicar medição"
                      >
                        <CopyPlus className="h-4 w-4" />
                      </Button>

                      {/* Excluir */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(measurement.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Excluir medição"
                      >
                        <Trash2 className="h-4 w-4" />
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
