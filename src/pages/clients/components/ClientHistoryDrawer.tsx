import {
  History,
  Building2,
  MessageCircle,
  Mail,
  Plus,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { useAuthStore } from "@/stores/authStore"
import { useClientsStore } from "@/stores/clientsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { CLIENT_TYPE_CONFIG } from "@/types/client"
import { formatCurrency } from "@/utils/calculations"

export function ClientHistoryDrawer() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isSolo = user?.role === "SOLO"
  const { historyClient, closeModals } = useClientsStore()
  const { measurements } = useMeasurementsStore()

  if (!historyClient) return null

  const typeConfig =
    CLIENT_TYPE_CONFIG[historyClient.type] || CLIENT_TYPE_CONFIG.residential
  const cleanPhone = historyClient.phone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/55${cleanPhone}`

  // Filtra as medições vinculadas a este cliente
  const clientMeasurements = measurements.filter(
    (m) =>
      m.clientId === historyClient.id ||
      (m.clientName &&
        (m.clientName.toLowerCase().includes(historyClient.name.toLowerCase()) ||
          (historyClient.companyName &&
            m.clientName.toLowerCase().includes(historyClient.companyName.toLowerCase()))))
  )

  const totalBilled = clientMeasurements
    .filter((m) => m.status === "approved")
    .reduce((acc, m) => acc + m.grandTotal, 0)

  const handleCreateNew = () => {
    closeModals()
    navigate(`/medicoes/nova?clientId=${historyClient.id}`)
  }

  return (
    <Dialog open={!!historyClient} onOpenChange={closeModals}>
      <DialogContent onClose={closeModals} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeConfig.badgeClass}`}
            >
              {typeConfig.label}
            </Badge>

            <span className="text-xs text-slate-400 font-mono">
              Código: {historyClient.id}
            </span>
          </div>

          <DialogTitle className="text-xl pt-1">
            {historyClient.name}
          </DialogTitle>

          {historyClient.companyName && (
            <DialogDescription className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{historyClient.companyName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card de Contatos & Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                Contatos & Comunicação:
              </span>
              <div className="space-y-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-semibold text-emerald-700 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{historyClient.phone}</span>
                </a>
                {historyClient.email && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{historyClient.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1 text-xs">
              <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px]">
                Consolidado Aprovado:
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {formatCurrency(totalBilled)}
                </span>
                <span className="text-slate-500 text-[11px]">
                  ({clientMeasurements.length} medições registradas)
                </span>
              </div>
            </div>
          </div>

          {/* Notas do Cliente */}
          {historyClient.notes && (
            <div className="rounded-lg bg-slate-100/70 p-3 text-xs text-slate-600 border border-slate-200/60">
              <strong className="text-slate-800 block mb-0.5">Observações de Obra:</strong>
              <p className="italic">{historyClient.notes}</p>
            </div>
          )}

          {/* Lista de Medições Vinculadas */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-slate-500" />
                Histórico de Medições & Orçamentos
              </h4>

              {/* Botão de Criação Restrito a SOLO */}
              {isSolo && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateNew}
                  className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800 gap-1 px-2.5 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova Medição</span>
                </Button>
              )}
            </div>

            {clientMeasurements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 bg-slate-50">
                <p>Nenhuma medição registrada para este cliente ainda.</p>
                {isSolo && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="mt-3 text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Criar Primeiro Orçamento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {clientMeasurements.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      closeModals()
                      navigate(`/medicoes/${m.id}`)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        closeModals()
                        navigate(`/medicoes/${m.id}`)
                      }
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer group"
                    title="Clique para abrir detalhes da medição"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-amber-800 group-hover:underline text-xs transition-colors">
                          {m.title}
                        </span>
                        <MeasurementStatusBadge status={m.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {m.date}
                        </span>
                        <span>•</span>
                        <span>{m.items.length} itens</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {formatCurrency(m.grandTotal)}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeModals}
            className="w-full text-xs"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
