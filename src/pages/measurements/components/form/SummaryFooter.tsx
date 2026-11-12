import { FileText, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/calculations"

interface SummaryFooterProps {
  servicesTotal: number
  costsTotal: number
  grandTotal: number
  isSubmitting: boolean
  onSaveDraft: () => void
  onFinalize: () => void
}

export function SummaryFooter({
  servicesTotal,
  costsTotal,
  grandTotal,
  isSubmitting,
  onSaveDraft,
  onFinalize,
}: SummaryFooterProps) {
  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-8 shadow-lg shadow-slate-900/10 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Totalizadores em tempo real */}
        <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
          {/* Subtotal Serviços */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Serviços:
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {formatCurrency(servicesTotal)}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">+</span>

          {/* Subtotal Despesas */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Despesas / Campo:
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {formatCurrency(costsTotal)}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">=</span>

          {/* TOTAL GERAL */}
          <div className="space-y-0.5 pl-2 sm:pl-4 border-l border-slate-200">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
              VALOR TOTAL DA MEDIÇÃO:
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2.5 justify-end">
          {/* Botão Secundário: Finalizar e Enviar */}
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onFinalize}
            className="text-xs h-10 px-4 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold gap-2"
          >
            {isSubmitting ? (
              <span>Processando...</span>
            ) : (
              <>
                <Send className="h-4 w-4 text-slate-500" />
                <span>Finalizar e Enviar</span>
              </>
            )}
          </Button>

          {/* Botão Primário: Salvar Rascunho */}
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSaveDraft}
            className="text-xs h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md gap-2"
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span>Salvar Rascunho</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
