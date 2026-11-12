import { Clock, CheckCircle2, XCircle, RotateCcw, FileEdit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MeasurementStatus } from "@/types/measurement"
import { MEASUREMENT_STATUS_CONFIG } from "@/types/measurement"

interface MeasurementStatusBadgeProps {
  status: MeasurementStatus
  className?: string
}

export function MeasurementStatusBadge({
  status,
  className = "",
}: MeasurementStatusBadgeProps) {
  const config =
    MEASUREMENT_STATUS_CONFIG[status] || MEASUREMENT_STATUS_CONFIG.pending

  const icons: Record<MeasurementStatus, React.ReactNode> = {
    draft: <FileEdit className="h-3 w-3 text-slate-500" />,
    pending: <Clock className="h-3 w-3 text-amber-600" />,
    approved: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    rejected: <XCircle className="h-3 w-3 text-rose-600" />,
    rework: <RotateCcw className="h-3 w-3 text-orange-600" />,
  }

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-semibold text-xs px-2.5 py-0.5 rounded-full ${config.badgeClass} ${className}`}
    >
      {icons[status]}
      <span>{config.label}</span>
    </Badge>
  )
}
