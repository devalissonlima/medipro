import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  Pencil,
  Trash2,
  Building2,
  Copy,
  Check,
  MoreHorizontal,
  Printer,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MeasurementStatusBadge } from "./MeasurementStatusBadge"
import { exportMeasurementToPDF } from "@/utils/exportUtils"
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface MeasurementTableProps {
  measurements: Measurement[]
  onOpenDetail?: (measurement: Measurement) => void
  onEdit: (id: string) => void
  onOpenShare?: (measurement: Measurement) => void
  onCopyLink: (measurement: Measurement) => void
  onDuplicate?: (id: string) => void
  onDelete: (id: string) => void
  onFinalize?: (id: string) => void
}

export function MeasurementTable({
  measurements,
  onEdit,
  onCopyLink,
  onDelete,
  onFinalize,
}: MeasurementTableProps) {
  const navigate = useNavigate()
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
            <TableHead className="font-semibold text-slate-700 text-xs w-32 text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {measurements.map((measurement) => {
            const canEdit = measurement.status !== "approved"
            const canDelete = measurement.status !== "approved"
            const isDraft = measurement.status === "draft"

            return (
              <TableRow
                key={measurement.id}
                className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
              >
                {/* Título & Localização com hover:underline */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/medicoes/${measurement.id}`)}
                      className="font-bold text-slate-900 text-sm hover:text-amber-800 hover:underline transition-colors text-left"
                      title="Ver detalhes da medição"
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

                {/* Ações via DropdownMenu + Botão Rápido Finalizar */}
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
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Botão de Finalizar imediato para rascunhos */}
                      {isDraft && onFinalize && (
                        <Button
                          size="sm"
                          onClick={() => onFinalize(measurement.id)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 px-2.5 shadow-2xs"
                          title="Finalizar e enviar medição para conferência"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Finalizar</span>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Opções da medição"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {canEdit && (
                            <DropdownMenuItem onClick={() => onEdit(measurement.id)}>
                              <Pencil className="h-4 w-4 text-amber-500" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                          )}

                          {isDraft && onFinalize && (
                            <DropdownMenuItem
                              onClick={() => onFinalize(measurement.id)}
                              className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50 font-medium"
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                              <span>Finalizar Medição</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => exportMeasurementToPDF(measurement)}>
                            <Printer className="h-4 w-4 text-blue-500" />
                            <span>Imprimir / PDF</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => navigate(`/medicoes/${measurement.id}`)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                            <span>Visualizar Detalhes</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleCopy(measurement)}>
                            {copiedId === measurement.id ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-500" />
                            )}
                            <span>
                              {copiedId === measurement.id ? "Link Copiado!" : "Copiar Link Direto"}
                            </span>
                          </DropdownMenuItem>

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingId(measurement.id)}
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4 text-rose-500" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
