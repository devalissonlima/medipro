import { useState } from "react"
import { Check, Copy, MessageCircle, Share2 } from "lucide-react"
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
import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "@/utils/calculations"

interface ShareLinkModalProps {
  measurement: Measurement | null
  onClose: () => void
}

export function ShareLinkModal({ measurement, onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false)

  if (!measurement) return null

  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/medicao/${measurement.shareableUrlToken}`

  const whatsappMessage = encodeURIComponent(
    `Olá! Segue o link com a medição e orçamento detalhado da obra "${measurement.title}":\n\n` +
      `📌 *Total:* ${formatCurrency(measurement.grandTotal)}\n` +
      `🔗 *Acesse os detalhes:* ${shareUrl}\n\n` +
      `_Gerado via Medipro SaaS_`
  )

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
    }
  }

  const handleOpenWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${whatsappMessage}`, "_blank")
  }

  return (
    <Dialog open={!!measurement} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
            <Share2 className="h-6 w-6" />
          </div>
          <DialogTitle>Compartilhar Medição</DialogTitle>
          <DialogDescription>
            Envie este link direto para o cliente ou para a liderança aprovar a medição sem burocracia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Resumo */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 text-sm">
                {measurement.title}
              </span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {formatCurrency(measurement.grandTotal)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Destinatário:{" "}
              <strong className="text-slate-700">
                {measurement.clientName || "Liderança de Campo"}
              </strong>
            </p>
          </div>

          {/* Campo de Link com Copiar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Link de Acesso Público
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="text-xs font-mono bg-slate-50 select-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0 gap-1.5 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 font-semibold animate-in fade-in">
                Link copiado para a área de transferência!
              </p>
            )}
          </div>

          {/* Botão de Envio Direto WhatsApp */}
          <Button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 gap-2 shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar via WhatsApp
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full text-xs"
          >
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
