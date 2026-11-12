import React, { useState } from "react"
import {
  FolderPlus,
  MapPin,
  Calendar,
  Users,
  FileText,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import type { Client } from "@/types/client"
import type { ProjectStatus } from "@/types/project"

interface ProjectFormModalProps {
  isOpen: boolean
  clients: Client[]
  isSolo: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    clientId: string
    status: ProjectStatus
    description?: string
    address?: string
    startDate?: string
    endDate?: string
  }) => void
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  clients,
  isSolo,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("")
  const [clientId, setClientId] = useState(clients[0]?.id || "")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("active")
  const [error, setError] = useState("")

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Informe o título ou identificação da obra.")
      return
    }
    if (!clientId) {
      setError("Selecione o cliente vinculado a este projeto.")
      return
    }

    if (startDate && endDate && endDate < startDate) {
      setError("A data de previsão de finalização deve ser posterior ou igual à data de início.")
      return
    }

    onSubmit({
      title: title.trim(),
      clientId,
      status,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    // Reset formulário
    setTitle("")
    setDescription("")
    setAddress("")
    setStartDate(new Date().toISOString().split("T")[0])
    setEndDate("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Novo Projeto / Obra</DialogTitle>
              <DialogDescription className="text-xs">
                Cadastre a obra com cliente, endereço e prazos operacionais.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Título da Obra */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Título da Obra / Projeto <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Ex: Residencial Alphaville Zero - Cozinha & Gourmet"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError("")
              }}
              className="bg-white text-xs h-9"
            />
          </div>

          {/* Cliente Vinculado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Cliente Vinculado <span className="text-rose-500">*</span>
            </label>
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-white text-xs h-9"
            >
              <option value="" disabled>
                Selecione um cliente...
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.companyName ? `(${c.companyName})` : ""}
                </option>
              ))}
            </Select>
          </div>

          {/* Endereço da Obra */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Endereço da Obra / Localização
            </label>
            <Input
              placeholder="Ex: Alameda das Sucupiras, 210 - Alphaville Zero, Santana de Parnaíba - SP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-white text-xs h-9"
            />
          </div>

          {/* Descrição do Projeto / Escopo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Descrição da Obra / Escopo Contratado
            </label>
            <Textarea
              placeholder="Descreva o escopo da obra, especificações e orientações para a equipe (ex: assentamento de piso travertino, bancadas esculpidas e rodapés)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white text-xs min-h-[75px]"
            />
          </div>

          {/* Prazos da Obra: Data de Início e Previsão de Finalização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Data de Início
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Previsão de Finalização
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>
          </div>

          {/* Status Inicial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Status Inicial da Obra
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="bg-white text-xs h-9"
            >
              <option value="active">Em andamento</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
            </Select>
          </div>

          {/* Banner Informativo do Limite de Vagas do Plano */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">
                Capacidade de Equipe por Obra:
              </span>
              <span className="text-[11px] text-slate-500">
                {isSolo
                  ? "1 colaborador ativo (determinado pelo seu Plano Solo)."
                  : "Até 5 colaboradores ativos nesta obra (determinado pelo seu Plano Pro)."}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs font-semibold"
            >
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectFormModal
