import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  File,
  Users,
  ArrowRight,
  Clock,
  Briefcase,
  Folder,
  FolderInput,
  MapPin,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PROJECT_STATUS_CONFIG } from "@/types/project"
import { getProjectUrl } from "@/utils/projectRoutes"
import type { EnrichedProject } from "../hooks/useProjects"

interface ProjectCardProps {
  project: EnrichedProject
  isSolo?: boolean
  canManageFolders?: boolean
  onRequestMoveFolder?: (project: EnrichedProject) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSolo = false,
  canManageFolders = false,
  onRequestMoveFolder,
}) => {
  const navigate = useNavigate()
  const statusInfo = PROJECT_STATUS_CONFIG[project.status]
  const projectDashboardUrl = getProjectUrl(project, "dashboard")

  return (
    <Card
      onClick={() => navigate(projectDashboardUrl)}
      className="group cursor-pointer border-slate-200/90 bg-white shadow-2xs transition-all hover:border-amber-400/80 hover:shadow-md"
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-3">
          {/* Topo: Ícone de Projeto (Briefcase) + Status Badge + Menu Dropdown */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-2xs">
              <Briefcase className="h-5 w-5" />
            </div>

            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className={`text-[11px] font-semibold ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    title="Opções do projeto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigate(projectDashboardUrl)}
                  >
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <span>Abrir Projeto</span>
                  </DropdownMenuItem>

                  {canManageFolders && onRequestMoveFolder && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onRequestMoveFolder(project)}
                      >
                        <FolderInput className="h-4 w-4 text-amber-600" />
                        <span>Mover para pasta</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Título, Cliente, Pasta e Endereço */}
          <div className="space-y-1.5">
            {project.folderName && (
              <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <Folder className="h-3 w-3 text-amber-600" />
                <span className="truncate max-w-[180px]">{project.folderName}</span>
              </div>
            )}

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

        {/* Rodapé: Contadores (Ícone File para Medições) e Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <File className="h-3.5 w-3.5 text-slate-400" />
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
