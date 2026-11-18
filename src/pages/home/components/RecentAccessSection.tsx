import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Briefcase,
  File,
  History,
  Building2,
  ArrowUpRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useRecentAccessStore } from "@/stores/recentAccessStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useClientsStore } from "@/stores/clientsStore"
import { PROJECT_STATUS_CONFIG, type Project } from "@/types/project"
import { getProjectUrl } from "@/utils/projectRoutes"
import type { Measurement } from "@/types/measurement"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { formatCurrency } from "@/utils/calculations"

export const RecentAccessSection: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { recentProjectsByUser, recentMeasurementsByUser } = useRecentAccessStore()
  const { projects } = useProjectsStore()
  const { measurements } = useMeasurementsStore()
  const { clients } = useClientsStore()

  const recentProjects = useMemo(() => {
    if (!user?.id) return []
    const ids = recentProjectsByUser[user.id] || []
    return ids
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is Project => Boolean(p && p.tenantId === user.tenantId))
      .slice(0, 4)
  }, [user, recentProjectsByUser, projects])

  const recentMeasurements = useMemo(() => {
    if (!user?.id) return []
    const ids = recentMeasurementsByUser[user.id] || []
    return ids
      .map((id) => measurements.find((m) => m.id === id))
      .filter((m): m is Measurement => Boolean(m))
      .slice(0, 4)
  }, [user, recentMeasurementsByUser, measurements])

  if (recentProjects.length === 0 && recentMeasurements.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 1. Últimos Projetos Acessados */}
      {recentProjects.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Últimos Projetos Acessados
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentProjects.map((project) => {
              const statusInfo = PROJECT_STATUS_CONFIG[project.status]
              const resolvedClient =
                project.clientName ||
                clients.find((c) => c.id === project.clientId)?.name ||
                "Cliente"

              return (
                <Button
                  key={project.id}
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => navigate(getProjectUrl(project, "dashboard"))}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-amber-400 hover:shadow-sm"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                        <Briefcase className="h-3.5 w-3.5" />
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold px-2 py-0 ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-1 pt-0.5">
                      {project.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 w-full text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{resolvedClient}</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Últimas Medições Acessadas */}
      {recentMeasurements.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Últimas Medições Acessadas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentMeasurements.map((measurement) => (
              <Button
                key={measurement.id}
                type="button"
                variant="unstyled"
                size="auto"
                onClick={() => navigate(`/medicoes/${measurement.id}`)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-amber-400 hover:shadow-sm"
              >
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <File className="h-4 w-4" />
                    </span>
                    <MeasurementStatusBadge status={measurement.status} />
                  </div>

                  <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-1 pt-0.5">
                    {measurement.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {measurement.projectTitle ||
                      measurement.clientName ||
                      "Medição Avulsa"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 w-full">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {formatCurrency(measurement.grandTotal)}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
