import React, { useState } from "react"
import { useNavigate, useParams, Navigate } from "react-router-dom"
import {
  Plus,
  Search,
  Briefcase,
  Folder,
  FolderPlus,
  FolderOpen,
  X,
  History,
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  ArrowUpRight,
  Check,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ProjectCard } from "./components/ProjectCard"
import {
  useProjects,
  type EnrichedProject,
  type EnrichedFolder,
} from "./hooks/useProjects"
import { getProjectUrl } from "@/utils/projectRoutes"
import { PROJECT_STATUS_CONFIG, type ProjectStatus } from "@/types/project"

const FOLDER_COLOR_STYLES: Record<
  string,
  { iconBg: string; iconText: string; dot: string; label: string }
> = {
  amber: {
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconText: "text-amber-600",
    dot: "bg-amber-500",
    label: "Âmbar",
  },
  blue: {
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconText: "text-blue-600",
    dot: "bg-blue-500",
    label: "Azul",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconText: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Verde",
  },
  purple: {
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconText: "text-purple-600",
    dot: "bg-purple-500",
    label: "Roxo",
  },
  slate: {
    iconBg: "bg-slate-500/10 border-slate-500/20",
    iconText: "text-slate-600",
    dot: "bg-slate-500",
    label: "Cinza",
  },
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { folderId: routeFolderId } = useParams<{ folderId?: string }>()

  const {
    projects,
    recentProjects,
    folders,
    selectedFolderId,
    selectedFolder,
    matchedDirectProject,
    setSelectedFolderId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    canCreateProject,
    canManageFolders,
    isSolo,
    isMember,
    createFolder,
    renameFolder,
    deleteFolder,
    moveProjectToFolder,
  } = useProjects(routeFolderId)

  // Estados para modais de pasta
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<EnrichedFolder | null>(null)
  const [folderNameInput, setFolderNameInput] = useState("")
  const [folderColorInput, setFolderColorInput] = useState("amber")

  const [deletingFolder, setDeletingFolder] = useState<EnrichedFolder | null>(
    null
  )

  // Estado para modal de mover projeto para pasta
  const [movingProject, setMovingProject] = useState<EnrichedProject | null>(
    null
  )
  const [targetFolderId, setTargetFolderId] = useState<string>("")

  // Redirecionamento retrocompatível caso /projetos/:folderId receba um ID direto de projeto
  if (matchedDirectProject) {
    return (
      <Navigate to={getProjectUrl(matchedDirectProject, "dashboard")} replace />
    )
  }

  // Se houver um routeFolderId na URL que não existe mais nas pastas, volta para /projetos
  if (routeFolderId && !selectedFolder) {
    return <Navigate to="/projetos" replace />
  }

  const statusTabs: { label: string; value: ProjectStatus | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Em andamento", value: "active" },
    { label: "Pausados", value: "paused" },
    { label: "Concluídos", value: "completed" },
  ]

  const openCreateFolderModal = () => {
    setEditingFolder(null)
    setFolderNameInput("")
    setFolderColorInput("amber")
    setIsFolderModalOpen(true)
  }

  const openRenameFolderModal = (folder: EnrichedFolder) => {
    setEditingFolder(folder)
    setFolderNameInput(folder.name)
    setFolderColorInput(folder.color || "amber")
    setIsFolderModalOpen(true)
  }

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderNameInput.trim()) return

    if (editingFolder) {
      renameFolder(editingFolder.id, folderNameInput.trim(), folderColorInput)
    } else {
      createFolder(folderNameInput.trim(), folderColorInput)
    }
    setIsFolderModalOpen(false)
    setEditingFolder(null)
    setFolderNameInput("")
  }

  const handleConfirmDeleteFolder = () => {
    if (!deletingFolder) return
    deleteFolder(deletingFolder.id)
    setDeletingFolder(null)
  }

  const openMoveModal = (project: EnrichedProject) => {
    setMovingProject(project)
    setTargetFolderId(project.folderId || "")
  }

  const handleConfirmMoveProject = () => {
    if (!movingProject) return
    moveProjectToFolder(movingProject.id, targetFolderId || null)
    setMovingProject(null)
  }

  const isSearching = searchQuery.trim() !== ""

  return (
    <PageContainer className="space-y-6 pb-20">
      {/* CABEÇALHO DINÂMICO: Na raiz exibe "Projetos & Obras"; dentro da pasta exibe apenas o Nome da Pasta */}
      {!selectedFolder ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title={isMember ? "Meus Projetos" : "Projetos & Obras"}
            description={
              isMember
                ? "Obras e projetos onde você está alocado trabalhando no momento."
                : "Gerencie seus projetos em pastas, acompanhe medições vinculadas e controle a equipe alocada em cada obra."
            }
          />

          <div className="flex items-center gap-2 shrink-0">
            {canManageFolders && (
              <Button
                type="button"
                variant="outline"
                onClick={openCreateFolderModal}
                className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-10"
              >
                <FolderPlus className="h-4 w-4 text-amber-600" />
                <span>+ Nova Pasta</span>
              </Button>
            )}

            {canCreateProject && (
              <Button
                onClick={() => navigate("/projetos/novo")}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0 shadow-xs text-xs h-10"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                <span>+ Novo Projeto</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSelectedFolderId(null)}
              className="h-9 w-9 shrink-0 border-slate-300 text-slate-600 hover:text-slate-900"
              title="Voltar para Todos os Projetos"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                (
                  FOLDER_COLOR_STYLES[selectedFolder.color || "amber"] ||
                  FOLDER_COLOR_STYLES.amber
                ).iconBg
              } ${
                (
                  FOLDER_COLOR_STYLES[selectedFolder.color || "amber"] ||
                  FOLDER_COLOR_STYLES.amber
                ).iconText
              }`}
            >
              <FolderOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {selectedFolder.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-semibold"
                >
                  {selectedFolder.projectsCount}{" "}
                  {selectedFolder.projectsCount === 1 ? "projeto" : "projetos"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canManageFolders && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openRenameFolderModal(selectedFolder)}
                  className="h-9 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5 text-amber-600" />
                  <span>Renomear</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingFolder(selectedFolder)}
                  className="h-9 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Pasta</span>
                </Button>
              </>
            )}

            {canCreateProject && (
              <Button
                onClick={() =>
                  navigate(`/projetos/novo?folderId=${selectedFolder.id}`)
                }
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0 shadow-xs text-xs h-9"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                <span>+ Novo Projeto</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 1. FAIXA DE ACESSADOS RECENTEMENTE (ÚLTIMOS 5) */}
      {recentProjects.length > 0 && !selectedFolder && !isSearching && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Acessados Recentemente (Últimos {recentProjects.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Acesso rápido em 1 clique
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {recentProjects.map((proj) => {
              const statusInfo = PROJECT_STATUS_CONFIG[proj.status]
              return (
                <Button
                  key={proj.id}
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => navigate(getProjectUrl(proj, "dashboard"))}
                  className="group flex flex-col justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-left transition-all hover:border-amber-400 hover:bg-white hover:shadow-xs"
                >
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-semibold px-1.5 py-0 ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </Badge>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 shrink-0" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-1 pt-0.5">
                      {proj.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 pt-1.5 mt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 w-full">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{proj.resolvedClientName}</span>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. BARRA DE BUSCA E FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder={
              selectedFolder
                ? `Buscar projetos dentro de "${selectedFolder.name}"...`
                : "Buscar em todos os projetos e pastas por obra ou cliente..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50/50 focus:bg-white"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value
            return (
              <Button
                key={tab.value}
                type="button"
                variant="unstyled"
                size="auto"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* 3. SEÇÃO DE PASTAS (Exibida na raiz quando não há busca ativa) */}
      {!selectedFolder && !isSearching && (folders.length > 0 || canManageFolders) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pastas de Projetos ({folders.length})
              </h2>
            </div>

            {canManageFolders && (
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                onClick={openCreateFolderModal}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Pasta</span>
              </Button>
            )}
          </div>

          {folders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <FolderPlus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Organize suas obras em pastas
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Agrupe projetos por construtora, região ou condomínio.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCreateFolderModal}
                className="text-xs h-8 gap-1.5 border-slate-300 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar Primeira Pasta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {folders.map((folder) => {
                const colorStyle =
                  FOLDER_COLOR_STYLES[folder.color || "amber"] ||
                  FOLDER_COLOR_STYLES.amber

                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-amber-400 hover:shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colorStyle.iconBg} ${colorStyle.iconText}`}
                      >
                        <Folder className="h-5 w-5 fill-current opacity-85" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 truncate transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {folder.projectsCount}{" "}
                          {folder.projectsCount === 1 ? "projeto" : "projetos"}
                        </p>
                      </div>
                    </div>

                    {canManageFolders && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              title="Ações da pasta"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => openRenameFolderModal(folder)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-amber-600" />
                              <span>Renomear</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingFolder(folder)}
                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. LISTAGEM DE PROJETOS */}
      <div className="space-y-3">
        {!selectedFolder && (
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <span>
                {isSearching
                  ? `Resultados da Busca (${projects.length})`
                  : `Projetos Soltos / Raiz (${projects.length})`}
              </span>
            </h2>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedFolder
                  ? `Nenhum projeto nesta pasta`
                  : "Nenhum projeto encontrado"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {isSearching || statusFilter !== "all"
                  ? "Tente ajustar sua busca ou filtro de status para visualizar suas obras."
                  : selectedFolder
                  ? "Mova projetos existentes para esta pasta através do menu (...) do card ou cadastre um novo projeto aqui."
                  : isMember
                  ? "Você ainda não possui projetos soltos fora das pastas."
                  : "Crie um novo projeto ou selecione uma das pastas acima para visualizar as obras agrupadas."}
              </p>
            </div>
            {canCreateProject && !isSearching && statusFilter === "all" && (
              <Button
                onClick={() =>
                  navigate(
                    selectedFolderId
                      ? `/projetos/novo?folderId=${selectedFolderId}`
                      : "/projetos/novo"
                  )
                }
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
                canManageFolders={canManageFolders}
                onRequestMoveFolder={openMoveModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CRIAR / RENOMEAR PASTA */}
      <Dialog
        open={isFolderModalOpen}
        onOpenChange={(open) => !open && setIsFolderModalOpen(false)}
      >
        <DialogContent
          onClose={() => setIsFolderModalOpen(false)}
          className="max-w-md bg-white"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Folder className="h-4 w-4 text-amber-600" />
              <span>{editingFolder ? "Renomear Pasta" : "Nova Pasta de Projetos"}</span>
            </DialogTitle>
            <DialogDescription>
              Organize seus projetos por construtora, região ou cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFolder} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nome da Pasta <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ex: Construtora Horizonte, Obras Litoral..."
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                autoFocus
                className="h-9 text-xs bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Cor Identificadora
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(FOLDER_COLOR_STYLES).map(([colorKey, style]) => {
                  const isSelected = folderColorInput === colorKey
                  return (
                    <Button
                      key={colorKey}
                      type="button"
                      variant="unstyled"
                      size="auto"
                      onClick={() => setFolderColorInput(colorKey)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <span>{style.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFolderModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!folderNameInput.trim()}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                {editingFolder ? "Salvar Alterações" : "Criar Pasta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CONFIRMAR EXCLUSÃO DE PASTA */}
      <Dialog
        open={!!deletingFolder}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
      >
        <DialogContent
          onClose={() => setDeletingFolder(null)}
          className="max-w-md bg-white"
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Excluir pasta &ldquo;{deletingFolder?.name}&rdquo;?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed pt-1">
              Fique tranquilo: <strong>nenhum projeto será apagado</strong>. Todos os
              projetos vinculados a esta pasta serão movidos automaticamente de
              volta para a raiz (Sem pasta).
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingFolder(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteFolder}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Excluir Pasta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: MOVER PROJETO PARA PASTA */}
      <Dialog
        open={!!movingProject}
        onOpenChange={(open) => !open && setMovingProject(null)}
      >
        <DialogContent
          onClose={() => setMovingProject(null)}
          className="max-w-md bg-white"
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Mover Projeto para Pasta
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Escolha a pasta de destino para{" "}
              <strong className="text-slate-800">{movingProject?.title}</strong>:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
            {/* Opção Raiz / Sem Pasta */}
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              onClick={() => setTargetFolderId("")}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition-all ${
                targetFolderId === ""
                  ? "border-amber-500 bg-amber-50/70 font-bold text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <span>Sem pasta / Raiz dos Projetos</span>
              </div>
              {targetFolderId === "" && (
                <Check className="h-4 w-4 text-amber-600" />
              )}
            </Button>

            {/* Lista de Pastas */}
            {folders.map((folder) => {
              const isSelected = targetFolderId === folder.id
              return (
                <Button
                  key={folder.id}
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => setTargetFolderId(folder.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/70 font-bold text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="h-4 w-4 text-amber-600 fill-amber-500/20" />
                    <span>{folder.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-amber-600" />}
                </Button>
              )
            })}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMovingProject(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmMoveProject}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              Confirmar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default ProjectsPage
