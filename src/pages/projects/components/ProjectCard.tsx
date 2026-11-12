import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  Ruler,
  Users,
  ArrowRight,
  Clock,
  FolderKanban,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PROJECT_STATUS_CONFIG, type Project } from "@/types/project"

interface ProjectCardProps {
  project: Project & {
    resolvedClientName: string
    measurementsCount: number
    pendingMeasurementsCount: number
    activeMembersCount: number
  }
  isSolo?: boolean
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSolo = false,
}) => {
  const navigate = useNavigate()
  const statusInfo = PROJECT_STATUS_CONFIG[project.status]

  return (
    <Card
      onClick={() => navigate(`/projetos/${project.id}`)}
      className="group cursor-pointer border-slate-200/90 bg-white shadow-2xs transition-all hover:border-amber-400/80 hover:shadow-md"
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-3">
          {/* Topo: Ícone + Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>

            <Badge
              variant="outline"
              className={`text-[11px] font-semibold ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </Badge>
          </div>

          {/* Título, Cliente e Endereço */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{project.resolvedClientName}</span>
            </div>
            {project.address && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé: Contadores e Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Ruler className="h-3.5 w-3.5 text-slate-400" />
              {project.measurementsCount}{" "}
              {project.measurementsCount === 1 ? "medição" : "medições"}
            </span>

            {!isSolo && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {project.activeMembersCount}/{project.maxMembers}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {project.pendingMeasurementsCount > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200"
                title="Medições aguardando conferência"
              >
                <Clock className="h-2.5 w-2.5" />
                {project.pendingMeasurementsCount}
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
