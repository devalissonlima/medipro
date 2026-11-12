import React, { useState } from "react"
import { UserPlus, Users, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { ProjectMember } from "@/types/project"

interface DirectoryUser {
  id: string
  name: string
  email: string
  avatarUrl: string
  defaultTag: string
}

const COMPANY_DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: "usr_supervisor_001",
    name: "Marcos Oliveira",
    email: "marcos.oliveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    defaultTag: "Encarregado de Obra",
  },
  {
    id: "usr_member_001",
    name: "Lucas Ferraz",
    email: "lucas.ferraz@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    defaultTag: "Instalador de Mármore",
  },
  {
    id: "usr_member_002",
    name: "Tiago Santos",
    email: "tiago.santos@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    defaultTag: "Revestidor Grandes Formatos",
  },
  {
    id: "usr_member_004",
    name: "Rafael Silveira",
    email: "rafael.silveira@medipro.com.br",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    defaultTag: "Marceneiro",
  },
]

interface AddProjectMemberModalProps {
  isOpen: boolean
  existingUserIds: string[]
  onClose: () => void
  onAdd: (
    data: Omit<ProjectMember, "id" | "projectId">
  ) => { success: boolean; error?: string }
}

export const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  isOpen,
  existingUserIds,
  onClose,
  onAdd,
}) => {
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [projectRole, setProjectRole] = useState<"MEMBER" | "PROJECT_SUPERVISOR">("MEMBER")
  const [specialtyTag, setSpecialtyTag] = useState("")
  const [error, setError] = useState("")

  const availableDirectoryUsers = COMPANY_DIRECTORY_USERS.filter(
    (u) => !existingUserIds.includes(u.id)
  )

  const handleSelectDirectoryUser = (uid: string) => {
    setSelectedUserId(uid)
    const found = COMPANY_DIRECTORY_USERS.find((u) => u.id === uid)
    if (found && !specialtyTag) {
      setSpecialtyTag(found.defaultTag)
    }
    setError("")
  }

  const resetForm = () => {
    setSelectedUserId("")
    setNewName("")
    setNewEmail("")
    setProjectRole("MEMBER")
    setSpecialtyTag("")
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!specialtyTag.trim()) {
      setError("Informe a tag de cargo/especialidade na obra (ex: Marceneiro).")
      return
    }

    if (mode === "existing") {
      const selected = COMPANY_DIRECTORY_USERS.find((u) => u.id === selectedUserId)
      if (!selected) {
        setError("Selecione um colaborador da lista ou cadastre um novo.")
        return
      }

      const res = onAdd({
        userId: selected.id,
        userName: selected.name,
        userEmail: selected.email,
        avatarUrl: selected.avatarUrl,
        projectRole,
        specialtyTag: specialtyTag.trim(),
        status: "active",
      })

      if (!res.success) {
        setError(res.error || "Não foi possível adicionar o colaborador.")
        return
      }
    } else {
      if (!newName.trim() || !newEmail.trim()) {
        setError("Preencha o nome e o e-mail do novo colaborador.")
        return
      }

      const res = onAdd({
        userId: `usr_custom_${Date.now().toString(36)}`,
        userName: newName.trim(),
        userEmail: newEmail.trim(),
        projectRole,
        specialtyTag: specialtyTag.trim(),
        status: "active",
      })

      if (!res.success) {
        setError(res.error || "Não foi possível adicionar o colaborador.")
        return
      }
    }

    resetForm()
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Adicionar Membro na Obra</DialogTitle>
              <DialogDescription>
                Aloque um colaborador ou encarregado para este projeto.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Seletor de Modo: Existente x Novo */}
        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("existing")
              setError("")
            }}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              mode === "existing"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Selecionar Existente
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("new")
              setError("")
            }}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              mode === "new"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Cadastrar Novo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === "existing" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Colaborador da Empresa <span className="text-rose-500">*</span>
              </label>
              <Select
                value={selectedUserId}
                onChange={(e) => handleSelectDirectoryUser(e.target.value)}
                className="bg-white"
              >
                <option value="">
                  {availableDirectoryUsers.length > 0
                    ? "Escolha um colaborador..."
                    : "Todos os pré-cadastrados já estão na obra"}
                </option>
                {availableDirectoryUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Eduardo Pereira"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  E-mail de Acesso <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="eduardo@empresa.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Papel no Projeto (Role)
              </label>
              <Select
                value={projectRole}
                onChange={(e) =>
                  setProjectRole(
                    e.target.value as "MEMBER" | "PROJECT_SUPERVISOR"
                  )
                }
                className="bg-white"
              >
                <option value="MEMBER">MEMBER (Instalador)</option>
                <option value="PROJECT_SUPERVISOR">
                  PROJECT_SUPERVISOR (Encarregado)
                </option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Tag de Cargo <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ex: Marceneiro, Instalador"
                value={specialtyTag}
                onChange={(e) => setSpecialtyTag(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Confirmar Alocação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
