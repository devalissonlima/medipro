import React from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  File,
  User,
  Wallet,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MeasurementStatusBadge } from "@/pages/measurements/components/MeasurementStatusBadge"
import { ProjectScopeTrackingCard } from "./ProjectScopeTrackingCard"
import { formatCurrency } from "@/utils/calculations"
import type { Measurement } from "@/types/measurement"
import type { Project, ProjectScopeItem } from "@/types/project"

interface ProjectDashboardTabProps {
  project: Project
  measurements: Measurement[]
  metrics: {
    approvedTotal: number
    pendingTotal: number
    reworkCount: number
    pendingCount: number
    totalCount: number
    draftCount?: number
    approvedCount?: number
  }
  scopeItems?: ProjectScopeItem[]
  isMember?: boolean
  canViewTeam?: boolean
  activeMembersCount?: number
  canCreateMeasurement?: boolean
  onNavigateToMeasurements: () => void
  onNavigateToTeam?: () => void
}

export const ProjectDashboardTab: React.FC<ProjectDashboardTabProps> = ({
  project,
  measurements,
  metrics,
  scopeItems = [],
  isMember = false,
  canViewTeam = false,
  activeMembersCount = 0,
  canCreateMeasurement = false,
  onNavigateToMeasurements,
  onNavigateToTeam,
}) => {
  const navigate = useNavigate()

  // 3 ou 5 medições mais recentes
  const recentMeasurements = React.useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4)
  }, [measurements])

  const grandTotalAll = metrics.approvedTotal + metrics.pendingTotal

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. KPIs Principais da Obra */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aprovado */}
        <Card className="border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Aprovado
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(metrics.approvedTotal)}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              {isMember
                ? "Valores aferidos e liberados para você"
                : "Medições aprovadas e liquidadas"}
            </p>
          </CardContent>
        </Card>

        {/* Aguardando Conferência */}
        <Card className="border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Aguardando Aprovação
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(metrics.pendingTotal)}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              {metrics.pendingCount}{" "}
              {metrics.pendingCount === 1 ? "medição pendente" : "medições pendentes"}
            </p>
          </CardContent>
        </Card>

        {/* Volume de Medições */}
        <Card className="border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total de Medições
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <File className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {metrics.totalCount}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              {metrics.reworkCount > 0 ? (
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {metrics.reworkCount}{" "}
                  {metrics.reworkCount === 1 ? "em revisão" : "em revisão"}
                </span>
              ) : (
                "Lançamentos na obra"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Movimentação Geral / Equipe */}
        <Card className="border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Volume Geral
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(grandTotalAll)}
            </p>
            <p className="text-[11px] text-slate-500">
              Aprovado + Em conferência
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Acompanhamento de Escopo Previsto do Projeto */}
      <ProjectScopeTrackingCard scopeItems={scopeItems} measurements={measurements} />

      {/* 3. Seção Inferior: Distribuição de Status + Últimos Lançamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel da Esquerda: Resumo Operacional da Obra (5 cols) */}
        <Card className="lg:col-span-5 border-slate-200/90 bg-white shadow-2xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Status Operacional</span>
              <Badge variant="outline" className="text-[10px] font-semibold">
                Visão Sintética
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {/* Barra de Distribuição */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Andamento das Medições</span>
                  <span>{metrics.totalCount} total</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {metrics.totalCount > 0 ? (
                    <>
                      <div
                        style={{
                          width: `${(metrics.approvedTotal > 0 ? (metrics.approvedTotal / (grandTotalAll || 1)) : 0) * 100}%`,
                        }}
                        className="bg-emerald-500 h-full"
                        title="Aprovadas"
                      />
                      <div
                        style={{
                          width: `${(metrics.pendingTotal > 0 ? (metrics.pendingTotal / (grandTotalAll || 1)) : 0) * 100}%`,
                        }}
                        className="bg-amber-400 h-full"
                        title="Pendentes"
                      />
                    </>
                  ) : (
                    <div className="w-full bg-slate-200 h-full" />
                  )}
                </div>
              </div>

              {/* Detalhamento em chips rápidos */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/80 p-2.5">
                  <span className="text-[10px] text-emerald-800 font-semibold block uppercase">
                    Aprovadas
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-900">
                    {formatCurrency(metrics.approvedTotal)}
                  </span>
                </div>

                <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-2.5">
                  <span className="text-[10px] text-amber-800 font-semibold block uppercase">
                    Em Análise
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-900">
                    {formatCurrency(metrics.pendingTotal)}
                  </span>
                </div>
              </div>

              {/* Informações da Equipe / Acesso */}
              {canViewTeam && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/70 text-slate-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Equipe Alocada
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {activeMembersCount} de {project.maxMembers} membros ativos
                      </span>
                    </div>
                  </div>

                  {onNavigateToTeam && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onNavigateToTeam}
                      className="text-xs h-7 text-amber-800 hover:text-amber-900 hover:bg-amber-100/50 gap-1 font-semibold"
                    >
                      <span>Gerenciar</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Button
                type="button"
                onClick={onNavigateToMeasurements}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-9 gap-1.5 shadow-2xs"
              >
                <File className="h-4 w-4 text-amber-400" />
                <span>Acessar Lista Completa de Medições</span>
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>

              {canCreateMeasurement && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/medicoes/nova?projectId=${project.id}`)}
                  className="w-full text-xs font-semibold h-9 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-600" />
                  <span>Nova Medição nesta Obra</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Painel da Direita: Lançamentos Recentes da Obra (7 cols) */}
        <Card className="lg:col-span-7 border-slate-200/90 bg-white shadow-2xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <File className="h-4 w-4 text-slate-400" />
              <span>Últimas Medições Lançadas ({recentMeasurements.length})</span>
            </CardTitle>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onNavigateToMeasurements}
              className="text-xs h-7 text-amber-800 hover:text-amber-900 hover:bg-amber-50 gap-1 font-semibold"
            >
              <span>Ver todas</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-2.5">
            {recentMeasurements.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <File className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Nenhuma medição lançada nesta obra ainda
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Assim que os profissionais executarem serviços na obra, os registros aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMeasurements.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/medicoes/${m.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-amber-300 transition-colors cursor-pointer gap-2 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-amber-900 truncate">
                          {m.title}
                        </span>
                        <MeasurementStatusBadge status={m.status} />
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          {m.collaboratorName || "Profissional da Obra"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {m.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(m.grandTotal)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
