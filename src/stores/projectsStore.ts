import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/use-toast"
import type {
  Project,
  ProjectMember,
  ProjectStatus,
  ProjectScopeItem,
  ProjectFolder,
} from "@/types/project"

function generateGuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const INITIAL_FOLDERS: ProjectFolder[] = []

export const INITIAL_PROJECTS: Project[] = []

export const INITIAL_PROJECT_MEMBERS: ProjectMember[] = []

interface ProjectsState {
  projects: Project[]
  members: ProjectMember[]
  folders: ProjectFolder[]

  addProject: (
    data: Omit<Project, "id" | "createdAt" | "maxMembers"> & { maxMembers?: number }
  ) => Project
  updateProject: (id: string, data: Partial<Project>) => void
  updateProjectScope: (projectId: string, scopeItems: ProjectScopeItem[]) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  deleteProject: (id: string) => void

  createFolder: (data: { name: string; tenantId: string; color?: string }) => ProjectFolder
  renameFolder: (folderId: string, newName: string, color?: string) => void
  deleteFolder: (folderId: string) => void
  moveProjectToFolder: (projectId: string, folderId: string | null) => void

  addProjectMember: (
    member: Omit<ProjectMember, "id">
  ) => { success: boolean; error?: string; member?: ProjectMember }
  updateProjectMember: (id: string, data: Partial<ProjectMember>) => void
  toggleMemberStatus: (id: string) => void
  removeProjectMember: (id: string) => void
  ensureSeedData: () => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      members: INITIAL_PROJECT_MEMBERS,
      folders: INITIAL_FOLDERS,

      addProject: (data) => {
        const newProject: Project = {
          ...data,
          id: `proj-${Date.now().toString(36)}`,
          maxMembers: data.maxMembers || 5,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          projects: [newProject, ...state.projects],
        }))
        return newProject
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }))
      },

      updateProjectScope: (projectId, scopeItems) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, scopeItems } : p
          ),
        }))
      },

      updateProjectStatus: (id, status) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          members: state.members.filter((m) => m.projectId !== id),
        }))
      },

      createFolder: ({ name, tenantId, color }) => {
        const newFolder: ProjectFolder = {
          id: generateGuid(),
          tenantId,
          name: name.trim(),
          color: color || "amber",
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          folders: [...state.folders, newFolder],
        }))
        toast({
          title: "Pasta Criada",
          description: `A pasta "${newFolder.name}" foi criada com sucesso.`,
          variant: "success",
        })
        return newFolder
      },

      renameFolder: (folderId, newName, color) => {
        const trimmed = newName.trim()
        if (!trimmed) return
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? { ...f, name: trimmed, color: color ?? f.color }
              : f
          ),
        }))
        toast({
          title: "Pasta Renomeada",
          description: `A pasta foi atualizada para "${trimmed}".`,
          variant: "success",
        })
      },

      deleteFolder: (folderId) => {
        const target = get().folders.find((f) => f.id === folderId)
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          projects: state.projects.map((p) =>
            p.folderId === folderId ? { ...p, folderId: null } : p
          ),
        }))
        toast({
          title: "Pasta Removida",
          description: target
            ? `A pasta "${target.name}" foi excluída e seus projetos voltaram para a raiz.`
            : "Pasta excluída. Os projetos vinculados voltaram para a raiz.",
        })
      },

      moveProjectToFolder: (projectId, folderId) => {
        const project = get().projects.find((p) => p.id === projectId)
        const folder = folderId
          ? get().folders.find((f) => f.id === folderId)
          : null

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, folderId: folderId || null } : p
          ),
        }))

        if (project) {
          toast({
            title: "Projeto Movido",
            description: folder
              ? `"${project.title}" foi movido para a pasta "${folder.name}".`
              : `"${project.title}" foi movido para a raiz (sem pasta).`,
            variant: "success",
          })
        }
      },

      addProjectMember: (memberData) => {
        const state = get()
        const project = state.projects.find((p) => p.id === memberData.projectId)
        if (!project) {
          return { success: false, error: "Projeto não encontrado." }
        }

        const activeCount = state.members.filter(
          (m) => m.projectId === memberData.projectId && m.status === "active"
        ).length

        if (memberData.status === "active" && activeCount >= project.maxMembers) {
          return {
            success: false,
            error: `Limite de ${project.maxMembers} membros ativos atingido para este projeto.`,
          }
        }

        const alreadyExists = state.members.some(
          (m) =>
            m.projectId === memberData.projectId &&
            m.userEmail?.toLowerCase() === memberData.userEmail?.toLowerCase() &&
            memberData.userEmail
        )
        if (alreadyExists) {
          return {
            success: false,
            error: "Este usuário já está alocado neste projeto.",
          }
        }

        const newMember: ProjectMember = {
          ...memberData,
          id: `pm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        }

        set((s) => ({
          members: [...s.members, newMember],
        }))

        return { success: true, member: newMember }
      },

      updateProjectMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }))
      },

      toggleMemberStatus: (id) => {
        const state = get()
        const member = state.members.find((m) => m.id === id)
        if (!member) return

        const nextStatus = member.status === "active" ? "inactive" : "active"

        if (nextStatus === "active") {
          const project = state.projects.find((p) => p.id === member.projectId)
          const activeCount = state.members.filter(
            (m) => m.projectId === member.projectId && m.status === "active"
          ).length
          if (project && activeCount >= project.maxMembers) {
            return
          }
        }

        set((s) => ({
          members: s.members.map((m) =>
            m.id === id ? { ...m, status: nextStatus } : m
          ),
        }))
      },

      removeProjectMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }))
      },

      ensureSeedData: () => {},
    }),
    {
      name: "@medipro:projects-data-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        members: state.members,
        folders: state.folders,
      }),
    }
  )
)
