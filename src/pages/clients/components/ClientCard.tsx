import { useState } from "react"
import {
  Building2,
  MapPin,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  Plus,
  History,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import type { Client } from "@/types/client"
import { CLIENT_TYPE_CONFIG } from "@/types/client"
import { formatCurrency } from "@/utils/calculations"

interface ClientCardProps {
  client: Client
  onEdit: (client: Client) => void
  onOpenHistory: (client: Client) => void
  onCreateMeasurement: (client: Client) => void
  onDelete: (id: string) => void
}

export function ClientCard({
  client,
  onEdit,
  onOpenHistory,
  onCreateMeasurement,
  onDelete,
}: ClientCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const user = useAuthStore((state) => state.user)
  const isSolo = user?.role === "SOLO"

  const typeConfig = CLIENT_TYPE_CONFIG[client.type] || CLIENT_TYPE_CONFIG.residential
  const cleanPhone = client.phone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/55${cleanPhone}`

  const addressFormatted = client.address
    ? [client.address.street, client.address.number, client.address.neighborhood, client.address.city, client.address.state]
        .filter(Boolean)
        .join(", ")
    : ""

  return (
    <Card className="flex flex-col justify-between border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-all duration-200 relative group overflow-hidden">
      {/* Top Color Accent */}
      <div className="h-1 w-full bg-slate-200 group-hover:bg-amber-500 transition-colors" />

      <CardHeader className="p-4 sm:p-5 pb-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeConfig.badgeClass}`}
          >
            {typeConfig.label}
          </Badge>

          <span className="text-[11px] text-slate-400 font-mono">
            {client.id}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-800 transition-colors">
            {client.name}
          </h3>
          {client.companyName && (
            <p className="text-xs font-medium text-slate-600 mt-0.5 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{client.companyName}</span>
            </p>
          )}
        </div>

        {addressFormatted && (
          <p className="text-[11px] text-slate-500 flex items-start gap-1 leading-relaxed">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{addressFormatted}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 pb-3 space-y-3">
        {/* Atalhos Rápidos de Contato */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{client.phone}</span>
          </a>

          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
              title={client.email}
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate max-w-[140px]">{client.email}</span>
            </a>
          )}
        </div>

        {/* Resumo Financeiro & Medições */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Medições:
            </span>
            <span className="font-bold text-slate-800">
              {client.totalMeasurementsCount} {client.totalMeasurementsCount === 1 ? "medição" : "medições"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Total Faturado:
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatCurrency(client.totalBilledAmount)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
        {showConfirmDelete ? (
          <div className="flex items-center justify-between w-full gap-2 animate-in fade-in py-1">
            <span className="text-xs text-rose-600 font-medium">
              Excluir este cliente?
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
                onClick={() => onDelete(client.id)}
              >
                Sim
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              {isSolo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateMeasurement(client)}
                  className="h-8 text-xs font-semibold border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100 gap-1 px-2.5 shadow-2xs"
                  title="Lançar nova medição para este cliente"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-600" />
                  <span>Nova Medição</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenHistory(client)}
                className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 gap-1 px-2"
                title="Ver histórico de medições deste cliente"
              >
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Histórico</span>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(client)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                title="Editar cliente"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Excluir cliente"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
