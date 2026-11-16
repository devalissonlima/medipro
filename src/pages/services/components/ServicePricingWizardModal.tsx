import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Layers,
  SkipForward,
} from "lucide-react"
import { useServiceImportWizard } from "../hooks/useServiceImportWizard"
import {
  MASTER_SERVICE_UNIT_LABELS,
  type MasterServiceType,
} from "@/types/catalog"

interface ServicePricingWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  servicesToPrice: MasterServiceType[]
}

export function ServicePricingWizardModal({
  isOpen,
  onClose,
  onComplete,
  servicesToPrice,
}: ServicePricingWizardModalProps) {
  const {
    currentIndex,
    totalInQueue,
    currentService,
    isFirstStep,
    isLastStep,
    inputVal,
    handleInputChange,
    isValidPrice,
    progressPercent,
    validItemsCount,
    inputRef,
    nextStep,
    prevStep,
    skipStep,
    commitImport,
    handleKeyDown,
  } = useServiceImportWizard({
    queue: servicesToPrice,
    isOpen,
    onClose,
    onComplete,
  })

  if (!isOpen || !currentService) {
    return null
  }

  const unitLabel =
    MASTER_SERVICE_UNIT_LABELS[currentService.defaultUnit] ||
    currentService.defaultUnit

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-w-lg p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl"
      >
        {/* Barra de Progresso Superior */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-amber-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Cabeçalho de Navegação e Contador */}
          <DialogHeader className="p-0 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Precificação Guiada
              </span>
              <span className="font-mono text-slate-600 font-bold">
                Serviço {currentIndex + 1} de {totalInQueue}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 pt-1">
              Defina seu valor de mão de obra
            </DialogTitle>
          </DialogHeader>

          {/* Card de Contexto do Serviço Atual */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <Layers className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {currentService.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-white text-slate-600 border-slate-200 font-semibold"
                    >
                      {currentService.category}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Unidade: <strong className="text-slate-700">{unitLabel}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HERO INPUT: Entrada de Valor em Destaque */}
          <div className="space-y-2">
            <label
              htmlFor="hero-price-input"
              className="text-xs font-bold text-slate-700 block uppercase tracking-wider"
            >
              Qual o seu valor por {unitLabel}? <span className="text-rose-500">*</span>
            </label>

            <div className="relative rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 shadow-xs focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all flex items-center gap-2 group">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-400 group-focus-within:text-amber-600 select-none transition-colors">
                R$
              </span>
              <input
                id="hero-price-input"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0,00"
                value={inputVal}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-3xl sm:text-4xl font-black font-mono text-slate-900 bg-transparent outline-none tracking-tight placeholder:text-slate-300"
              />
            </div>

            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>Informe o seu preço padrão cobrado por {unitLabel}.</span>
              <span className="text-slate-400 hidden sm:inline text-[10px]">
                Pressione <strong>Enter ↵</strong> para avançar
              </span>
            </p>
          </div>

          {/* Rodapé e Navegação */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="h-9 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Voltar</span>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={skipStep}
                className="h-9 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-1"
                title="Pular este serviço e não importá-lo"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span>Pular este</span>
              </Button>
            </div>

            <div className="flex items-center justify-end">
              {!isLastStep ? (
                <Button
                  type="button"
                  disabled={!isValidPrice}
                  onClick={nextStep}
                  className="w-full sm:w-auto h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2 shadow-sm disabled:opacity-40"
                >
                  <span>Próximo Serviço</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!isValidPrice && validItemsCount === 0}
                  onClick={commitImport}
                  className="w-full sm:w-auto h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-sm disabled:opacity-40"
                >
                  <Check className="h-4 w-4 text-white" />
                  <span>
                    Finalizar e Importar ({validItemsCount || (isValidPrice ? 1 : 0)})
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
