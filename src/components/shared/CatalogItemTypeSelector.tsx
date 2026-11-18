import { Hammer, Package, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CatalogItemType } from "@/types/catalog"

interface CatalogItemTypeSelectorProps {
  value: CatalogItemType
  onChange: (value: CatalogItemType) => void
  label?: string
}

const ITEM_TYPE_OPTIONS: Array<{
  value: CatalogItemType
  title: string
  subtitle: string
  icon: typeof Hammer
  activeClasses: string
  iconClasses: string
}> = [
  {
    value: "labor",
    title: "Mão de Obra",
    subtitle: "Serviços e execução",
    icon: Hammer,
    activeClasses: "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/15",
    iconClasses: "bg-blue-100 text-blue-700",
  },
  {
    value: "material",
    title: "Material / Insumo",
    subtitle: "Produtos e insumos",
    icon: Package,
    activeClasses: "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/15",
    iconClasses: "bg-amber-100 text-amber-800",
  },
  {
    value: "subcontract",
    title: "Ajudante / Terceiro",
    subtitle: "Diárias e fretes",
    icon: Users,
    activeClasses: "border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/15",
    iconClasses: "bg-purple-100 text-purple-700",
  },
]

export function CatalogItemTypeSelector({
  value,
  onChange,
  label = "Tipo de Item",
}: CatalogItemTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 block">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {ITEM_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = value === opt.value
          return (
            <Button
              key={opt.value}
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                isSelected
                  ? opt.activeClasses
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? opt.iconClasses : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {opt.title}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {opt.subtitle}
                </span>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
