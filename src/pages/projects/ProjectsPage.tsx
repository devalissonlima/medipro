import React from "react"
import { Plus, Search, FolderKanban, X } from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "./components/ProjectCard"
import { ProjectFormModal } from "./components/ProjectFormModal"
import { useProjects } from "./hooks/useProjects"
import type { ProjectStatus } from "@/types/project"

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    totalCount,
    clients,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    canCreateProject,
    isSolo,
    isMember,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createProject,
  } = useProjects()

  const statusTabs: { label: string; value: ProjectStatus | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Em andamento", value: "active" },
    { label: "Pausados", value: "paused" },
    { label: "Concluídos", value: "completed" },
  ]

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={isMember ? "Meus Projetos" : "Projetos & Obras"}
          description={
            isMember
              ? "Obras e projetos onde você está alocado trabalhando no momento."
              : "Gerencie seus projetos, acompanhe medições vinculadas e controle a equipe alocada em cada obra."
          }
          badge={
            <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 gap-1 text-[10px]">
              <FolderKanban className="h-3 w-3" />
              {totalCount} {totalCount === 1 ? "Projeto" : "Projetos"}
            </Badge>
          }
        />

        {canCreateProject && (
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0 shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            + Novo Projeto
          </Button>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nome da obra ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50/50 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de Cards dos Projetos */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Nenhum projeto encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Tente ajustar sua busca ou filtro de status para visualizar suas obras."
                : isMember
                ? "Você ainda não foi vinculado a nenhum projeto no momento. Assim que um gestor ou supervisor alocar você em uma obra, ela aparecerá aqui com todos os detalhes e equipe."
                : "Crie o primeiro projeto para organizar suas medições e equipe de campo."}
            </p>
          </div>
          {canCreateProject && !searchQuery && statusFilter === "all" && (
            <Button
              onClick={openCreateModal}
              variant="outline"
              className="text-xs gap-1.5 border-slate-300"
            >
              <Plus className="h-3.5 w-3.5" />
              + Novo Projeto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSolo={isSolo}
            />
          ))}
        </div>
      )}

      {/* Modal de Novo Projeto */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        clients={clients}
        isSolo={isSolo}
        onClose={closeCreateModal}
        onSubmit={createProject}
      />
    </PageContainer>
  )
}

export default ProjectsPage
