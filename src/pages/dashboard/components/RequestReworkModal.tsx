import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RequestReworkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => void
}

export function RequestReworkModal({
  isOpen,
  onClose,
  onConfirm,
}: RequestReworkModalProps) {
  const [note, setNote] = useState("")

  useEffect(() => {
    if (isOpen) {
      setNote("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(note.trim() || "Favor revisar os lançamentos de metragem ou despesas.")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 mb-2">
            <RotateCcw className="h-6 w-6" />
          </div>
          <DialogTitle>Solicitar Revisão ao Colaborador</DialogTitle>
          <DialogDescription>
            Informe o motivo ou a correção necessária para que o instalador ajuste a medição sem refazer todo o formulário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Instruções / Apontamento de Divergência
            </label>
            <Textarea
              rows={4}
              placeholder="Ex: Favor conferir a metragem do piso da cozinha e anexar o comprovante do pedágio..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none text-xs"
              autoFocus
            />
            <p className="text-[11px] text-slate-400">
              O colaborador receberá esta notificação no status da medição para correção.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Devolver para Ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
