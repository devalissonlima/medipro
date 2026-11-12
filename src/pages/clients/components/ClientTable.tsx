import { useState } from "react"
import {
  Building2,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  Plus,
  History,
  MapPin,
} from "lucide-react"
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
import type { Client } from "@/types/client"
import { CLIENT_TYPE_CONFIG } from "@/types/client"
import { formatCurrency } from "@/utils/calculations"

interface ClientTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onOpenHistory: (client: Client) => void
  onCreateMeasurement: (client: Client) => void
  onDelete: (id: string) => void
}

export function ClientTable({
  clients,
  onEdit,
  onOpenHistory,
  onCreateMeasurement,
  onDelete,
}: ClientTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 text-xs">
              Cliente & Empresa
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-36">
              Categoria
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs w-48">
              Contatos
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs">
              Cidade / Localidade
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs text-center w-28">
              Medições
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs text-right w-36">
              Total Faturado
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-xs text-center w-36">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clients.map((client) => {
            const typeConfig =
              CLIENT_TYPE_CONFIG[client.type] || CLIENT_TYPE_CONFIG.residential
            const cleanPhone = client.phone.replace(/\D/g, "")
            const whatsappUrl = `https://wa.me/55${cleanPhone}`

            const cityLocation = client.address
              ? `${client.address.city}${client.address.state ? `/${client.address.state}` : ""}`
              : "São Paulo/SP"

            return (
              <TableRow
                key={client.id}
                className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
              >
                {/* Nome & Empresa */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => onOpenHistory(client)}
                      className="font-bold text-slate-900 text-sm hover:text-amber-800 transition-colors text-left"
                    >
                      {client.name}
                    </button>
                    {client.companyName && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{client.companyName}</span>
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Categoria */}
                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeConfig.badgeClass}`}
                  >
                    {typeConfig.label}
                  </Badge>
                </TableCell>

                {/* Contatos */}
                <TableCell className="py-3.5">
                  <div className="space-y-1">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{client.phone}</span>
                    </a>
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 truncate max-w-[170px]"
                      >
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Localidade */}
                <TableCell className="py-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{cityLocation}</span>
                  </div>
                  {client.address?.neighborhood && (
                    <span className="text-[11px] text-slate-400 block pl-4">
                      {client.address.neighborhood}
                    </span>
                  )}
                </TableCell>

                {/* Medições */}
                <TableCell className="py-3.5 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {client.totalMeasurementsCount}
                  </span>
                </TableCell>

                {/* Total Faturado */}
                <TableCell className="py-3.5 text-right font-mono">
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(client.totalBilledAmount)}
                  </span>
                </TableCell>

                {/* Ações */}
                <TableCell className="py-3.5 text-center">
                  {deletingId === client.id ? (
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
                          onDelete(client.id)
                          setDeletingId(null)
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      {/* Nova Medição */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCreateMeasurement(client)}
                        className="h-8 w-8 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                        title="Nova Medição Direta"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      {/* Ver Histórico */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenHistory(client)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Histórico de medições"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>

                      {/* Editar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(client)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Editar cliente"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      {/* Excluir */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(client.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Excluir cliente"
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
