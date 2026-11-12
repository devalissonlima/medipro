import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/calculations"

interface BulkApprovalBarProps {
  selectedCount: number
  totalAmount: number
  onClearSelection: () => void
  onBulkApprove: () => void
}

export function BulkApprovalBar({
  selectedCount,
  totalAmount,
  onClearSelection,
  onBulkApprove,
}: BulkApprovalBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl shadow-slate-950/40 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0">
            {selectedCount}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              {selectedCount} {selectedCount === 1 ? "medição selecionada" : "medições selecionadas"}
            </p>
            <p className="text-xs text-slate-400">
              Total consolidado:{" "}
              <strong className="text-emerald-400 font-mono text-sm">
                {formatCurrency(totalAmount)}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-9 px-3"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Desmarcar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onBulkApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 shadow-sm gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Aprovar Selecionadas ({selectedCount})</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
