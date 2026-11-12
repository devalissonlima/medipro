import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Project, ProjectMember, ProjectStatus } from "@/types/project"

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-001",
    tenantId: "tenant_01",
    clientId: "cli-001",
    clientName: "Dr. Roberto Martins",
    title: "Residencial Alphaville Zero - Cozinha & Gourmet",
    description: "Instalação de bancadas de mármore travertino na cozinha ilha e espaço gourmet.",
    address: "Alameda das Sucupiras, 210 - Alphaville Zero, Santana de Parnaíba - SP",
    startDate: "2026-10-18",
    endDate: "2026-12-15",
    status: "active",
    maxMembers: 5,
    createdAt: "2026-10-18T09:00:00Z",
  },
  {
    id: "proj-002",
    tenantId: "tenant_01",
    clientId: "cli-002",
    clientName: "Arq. Camila Vasconcellos",
    title: "Condomínio Tamboré 10 - Suíte Master",
    description: "Revestimento em grandes formatos e acabamento fino em banheiros da suíte master.",
    address: "Av. Tamboré, 1200 - Cond. Tamboré 10, Barueri - SP",
    startDate: "2026-10-25",
    endDate: "2026-11-30",
    status: "active",
    maxMembers: 5,
    createdAt: "2026-10-25T14:00:00Z",
  },
  {
    id: "proj-003",
    tenantId: "tenant_01",
    clientId: "cli-003",
    clientName: "Construtora Silva & Ramos",
    title: "Edifício Horizon & Quinta da Baroneza",
    description: "Acabamento de pisos e paredes em mármore importado para hall e áreas comuns.",
    address: "Estrada dos Pires, Km 12 - Quinta da Baroneza, Bragança Paulista - SP",
    startDate: "2026-10-05",
    endDate: "2027-01-20",
    status: "active",
    maxMembers: 6,
    createdAt: "2026-10-05T10:30:00Z",
  },
  {
    id: "proj-004",
    tenantId: "tenant_01",
    clientId: "cli-004",
    clientName: "Eng. Marcos Pontes",
    title: "Ed. Grand Plaza Campinas - Lavabos",
    description: "Montagem de lavabos corporativos e instalação de tampos e espelhos.",
    address: "Av. José de Souza Campos, 900 - Cambuí, Campinas - SP",
    startDate: "2026-09-20",
    endDate: "2026-10-20",
    status: "completed",
    maxMembers: 5,
    createdAt: "2026-09-20T08:00:00Z",
  },
  {
    id: "proj-solo-001",
    tenantId: "tenant_solo_01",
    clientId: "cli-001",
    clientName: "Dr. Roberto Martins",
    title: "Reforma Apartamento Jardins - Cozinha",
    description: "Instalação de bancadas de quartzo branco e rodabanca.",
    address: "Rua Haddock Lobo, 800 - Jardins, São Paulo - SP",
    startDate: "2026-11-01",
    endDate: "2026-11-20",
    status: "active",
    maxMembers: 1,
    createdAt: "2026-11-01T09:00:00Z",
  },
  {
    id: "proj-solo-002",
    tenantId: "tenant_solo_01",
    clientId: "cli-002",
    clientName: "Arq. Camila Vasconcellos",
    title: "Escritório Faria Lima - Lavabos",
    description: "Troca de cubas esculpidas em granito preto são gabriel.",
    address: "Av. Brigadeiro Faria Lima, 2200 - Pinheiros, São Paulo - SP",
    startDate: "2026-10-10",
    endDate: "2026-10-25",
    status: "completed",
    maxMembers: 1,
    createdAt: "2026-10-10T11:00:00Z",
  },
]

export const INITIAL_PROJECT_MEMBERS: ProjectMember[] = [
  {
    id: "pm-001",
    projectId: "proj-001",
    userId: "usr_supervisor_001",
    userName: "Marcos Oliveira",
    userEmail: "marcos.oliveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    projectRole: "PROJECT_SUPERVISOR",
    specialtyTag: "Encarregado Geral",
    status: "active",
  },
  {
    id: "pm-002",
    projectId: "proj-001",
    userId: "usr_member_001",
    userName: "Lucas Ferraz",
    userEmail: "lucas.ferraz@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Instalador de Mármore",
    status: "active",
  },
  {
    id: "pm-003",
    projectId: "proj-001",
    userId: "usr_member_004",
    userName: "Rafael Silveira",
    userEmail: "rafael.silveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Marceneiro",
    status: "active",
  },
  {
    id: "pm-004",
    projectId: "proj-002",
    userId: "usr_supervisor_001",
    userName: "Marcos Oliveira",
    userEmail: "marcos.oliveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    projectRole: "PROJECT_SUPERVISOR",
    specialtyTag: "Encarregado de Obra",
    status: "active",
  },
  {
    id: "pm-005",
    projectId: "proj-002",
    userId: "usr_member_002",
    userName: "Tiago Santos",
    userEmail: "tiago.santos@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Revestidor Grandes Formatos",
    status: "active",
  },
  {
    id: "pm-006",
    projectId: "proj-003",
    userId: "usr_supervisor_001",
    userName: "Marcos Oliveira",
    userEmail: "marcos.oliveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    projectRole: "PROJECT_SUPERVISOR",
    specialtyTag: "Encarregado Sênior",
    status: "active",
  },
  {
    id: "pm-007",
    projectId: "proj-003",
    userId: "usr_member_001",
    userName: "Lucas Ferraz",
    userEmail: "lucas.ferraz@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Instalador de Mármore",
    status: "active",
  },
  {
    id: "pm-008",
    projectId: "proj-003",
    userId: "usr_member_002",
    userName: "Tiago Santos",
    userEmail: "tiago.santos@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Polidor & Acabamento",
    status: "active",
  },
  {
    id: "pm-009",
    projectId: "proj-004",
    userId: "usr_member_004",
    userName: "Rafael Silveira",
    userEmail: "rafael.silveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    projectRole: "MEMBER",
    specialtyTag: "Marceneiro",
    status: "active",
  },
]

interface ProjectsState {
  projects: Project[]
  members: ProjectMember[]

  addProject: (
    data: Omit<Project, "id" | "createdAt" | "maxMembers"> & { maxMembers?: number }
  ) => Project
  updateProject: (id: string, data: Partial<Project>) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  deleteProject: (id: string) => void

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

      ensureSeedData: () => {
        const { projects, members } = get()
        const existingProjectIds = new Set(projects.map((p) => p.id))
        const missingProjects = INITIAL_PROJECTS.filter(
          (p) => !existingProjectIds.has(p.id)
        )
        const existingMemberIds = new Set(members.map((m) => m.id))
        const missingMembers = INITIAL_PROJECT_MEMBERS.filter(
          (m) => !existingMemberIds.has(m.id)
        )

        if (missingProjects.length > 0 || missingMembers.length > 0) {
          set({
            projects: [...projects, ...missingProjects],
            members: [...members, ...missingMembers],
          })
        }
      },
    }),
    {
      name: "@medipro:projects-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        members: state.members,
      }),
    }
  )
)
