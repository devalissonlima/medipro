import {
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useClientForm } from "../hooks/useClientForm"
import { useClientsStore } from "@/stores/clientsStore"
import type { ClientType } from "@/types/client"
import { CLIENT_TYPE_CONFIG } from "@/types/client"

export function ClientFormModal() {
  const isFormOpen = useClientsStore((state) => state.isFormOpen)
  const {
    isEditing,
    name,
    setName,
    companyName,
    setCompanyName,
    type,
    setType,
    phone,
    setPhone,
    email,
    setEmail,
    document,
    setDocument,
    street,
    setStreet,
    number,
    setNumber,
    neighborhood,
    setNeighborhood,
    city,
    setCity,
    state,
    setState,
    notes,
    setNotes,
    errors,
    handleSubmit,
    closeModals,
  } = useClientForm()

  return (
    <Dialog open={isFormOpen} onOpenChange={closeModals}>
      <DialogContent onClose={closeModals} className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle>
            {isEditing ? "Editar Cadastro de Cliente" : "Novo Cliente / Obra"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações de contato, endereço da obra e dados para medição."
              : "Cadastre um novo cliente ou construtora para vincular orçamentos e agilizar o envio no WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Cliente (Tabs/Selector) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tipo de Cliente <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CLIENT_TYPE_CONFIG) as ClientType[]).map((t) => {
                const isSelected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {CLIENT_TYPE_CONFIG[t].label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nome / Contato Principal & Empresa (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nome do Contato Principal <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ex: Dr. Roberto Martins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""}
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Empresa / Apelido da Obra
              </label>
              <Input
                placeholder="Ex: Residência Alphaville Zero"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          {/* Telefone / WhatsApp & E-mail (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Telefone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-rose-400 focus-visible:ring-rose-400" : ""}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                E-mail (Opcional)
              </label>
              <Input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Documento CPF / CNPJ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              Documento (CPF ou CNPJ - Opcional)
            </label>
            <Input
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          {/* Endereço da Obra */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              Endereço da Obra / Localidade
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-3">
                <Input
                  placeholder="Rua / Avenida"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  placeholder="Nº / Apto"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="UF (ex: SP)"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="h-9 text-xs uppercase"
              />
            </div>
          </div>

          {/* Observações Gerais */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Observações & Notas de Campo
            </label>
            <Textarea
              rows={2}
              placeholder="Ex: Regras de portaria, contato do mestre de obras, restrição de horário para barulho..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModals}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
            >
              {isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
