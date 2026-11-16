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

export const INITIAL_FOLDERS: ProjectFolder[] = [
  {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    tenantId: "tenant_01",
    name: "Construtora Horizonte",
    color: "amber",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    tenantId: "tenant_01",
    name: "Obras Litoral",
    color: "blue",
    createdAt: "2026-10-02T11:00:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    tenantId: "tenant_solo_01",
    name: "Obras Residenciais SP",
    color: "emerald",
    createdAt: "2026-10-05T09:00:00Z",
  },
]

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
    scopeItems: [
      {
        id: "scope-101",
        projectId: "proj-001",
        masterServiceId: "mst-001",
        serviceName: "Assentamento de Mármore Travertino",
        environment: "Cozinha Ilha & Gourmet",
        unit: "m²",
        maxQuantity: 15.0,
        executedQuantity: 8.5,
      },
      {
        id: "scope-102",
        projectId: "proj-001",
        masterServiceId: "mst-002",
        serviceName: "Corte em Meia Esquadria 45°",
        environment: "Bordas da Bancada",
        unit: "m linear",
        maxQuantity: 18.0,
        executedQuantity: 11.2,
      },
      {
        id: "scope-103",
        projectId: "proj-001",
        masterServiceId: "mst-003",
        serviceName: "Furação e Recorte de Cuba Esculpida",
        environment: "Cozinha",
        unit: "unidade",
        maxQuantity: 2.0,
        executedQuantity: 2.0,
      },
      {
        id: "scope-104",
        projectId: "proj-001",
        masterServiceId: "mst-005",
        serviceName: "Instalação de Ilha Gourmet & Bancada",
        environment: "Espaço Gourmet",
        unit: "unidade",
        maxQuantity: 1.0,
        executedQuantity: 0,
      },
    ],
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
    scopeItems: [
      {
        id: "scope-201",
        projectId: "proj-002",
        masterServiceId: "mst-006",
        serviceName: "Revestimento Porcelanato Grandes Formatos",
        environment: "Suíte Master",
        unit: "m²",
        maxQuantity: 25.0,
        executedQuantity: 16.4,
      },
      {
        id: "scope-202",
        projectId: "proj-002",
        masterServiceId: "mst-002",
        serviceName: "Corte em Meia Esquadria 45°",
        environment: "Nichos e Bancadas",
        unit: "m linear",
        maxQuantity: 12.0,
        executedQuantity: 8.6,
      },
      {
        id: "scope-203",
        projectId: "proj-002",
        masterServiceId: "mst-008",
        serviceName: "Corte e Instalação de Nicho",
        environment: "Box Banheiro",
        unit: "unidade",
        maxQuantity: 3.0,
        executedQuantity: 0,
      },
    ],
    createdAt: "2026-10-25T14:00:00Z",
  },
  {
    id: "proj-003",
    tenantId: "tenant_01",
    folderId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    clientId: "cli-003",
    clientName: "Construtora Silva & Ramos",
    title: "Edifício Horizon & Quinta da Baroneza",
    description: "Acabamento de pisos e paredes em mármore importado para hall e áreas comuns.",
    address: "Estrada dos Pires, Km 12 - Quinta da Baroneza, Bragança Paulista - SP",
    startDate: "2026-10-05",
    endDate: "2027-01-20",
    status: "active",
    maxMembers: 6,
    scopeItems: [
      {
        id: "scope-301",
        projectId: "proj-003",
        masterServiceId: "mst-004",
        serviceName: "Polimento e Cristalização de Rochas",
        environment: "Hall de Entrada",
        unit: "m²",
        maxQuantity: 40.0,
        executedQuantity: 24.0,
      },
      {
        id: "scope-302",
        projectId: "proj-003",
        masterServiceId: "mst-005",
        serviceName: "Instalação de Ilha Gourmet & Bancada",
        environment: "Recepção",
        unit: "unidade",
        maxQuantity: 2.0,
        executedQuantity: 1.0,
      },
    ],
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

      ensureSeedData: () => {
        const { projects, members, folders } = get()
        const legacyFolderIdMap: Record<string, string> = {
          "fld-001": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          "fld-002": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
          "fld-solo-001": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
        }

        let hasMigrated = false
        const migratedFolders = (folders || []).map((f) => {
          if (legacyFolderIdMap[f.id]) {
            hasMigrated = true
            return { ...f, id: legacyFolderIdMap[f.id] }
          }
          return f
        })

        const migratedProjects = projects.map((p) => {
          if (p.folderId && legacyFolderIdMap[p.folderId]) {
            hasMigrated = true
            return { ...p, folderId: legacyFolderIdMap[p.folderId] }
          }
          return p
        })

        const existingProjectIds = new Set(migratedProjects.map((p) => p.id))
        const missingProjects = INITIAL_PROJECTS.filter(
          (p) => !existingProjectIds.has(p.id)
        )
        const existingMemberIds = new Set(members.map((m) => m.id))
        const missingMembers = INITIAL_PROJECT_MEMBERS.filter(
          (m) => !existingMemberIds.has(m.id)
        )
        const existingFolderIds = new Set(migratedFolders.map((f) => f.id))
        const missingFolders = INITIAL_FOLDERS.filter(
          (f) => !existingFolderIds.has(f.id)
        )

        if (
          hasMigrated ||
          missingProjects.length > 0 ||
          missingMembers.length > 0 ||
          missingFolders.length > 0
        ) {
          set({
            projects: [...migratedProjects, ...missingProjects],
            members: [...members, ...missingMembers],
            folders: [...migratedFolders, ...missingFolders],
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
        folders: state.folders,
      }),
    }
  )
)
