import { useState, useRef, useEffect } from "react"
import { Building2, Plus, Check, UserCheck, Shield, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useClientsStore } from "@/stores/clientsStore"

interface ClientSelectorProps {
  clientId: string
  clientName: string
  isTeamContext: boolean
  error?: string
  onSelectClient: (id: string, name: string) => void
  onToggleTeamContext: (isTeam: boolean) => void
}

export function ClientSelector({
  clientId,
  clientName,
  isTeamContext,
  error,
  onSelectClient,
  onToggleTeamContext,
}: ClientSelectorProps) {
  const { clients, createQuickClient } = useClientsStore()
  const [searchTerm, setSearchTerm] = useState(clientName)
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [quickPhone, setQuickPhone] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)

  // Sincroniza searchTerm quando clientName muda externamente
  useEffect(() => {
    setSearchTerm(clientName)
  }, [clientName])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (id: string, name: string) => {
    onSelectClient(id, name)
    setSearchTerm(name)
    setIsOpen(false)
  }

  const handleCreateQuick = () => {
    if (!searchTerm.trim()) return
    const newClient = createQuickClient({
      name: searchTerm.trim(),
      whatsapp: quickPhone || "(11) 99999-0000",
    })
    handleSelect(newClient.id, newClient.name)
    setShowQuickCreate(false)
    setQuickPhone("")
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Context Switcher (Autônomo x Equipe de Campo) */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-slate-500" />
          Destinatário da Medição <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => onToggleTeamContext(false)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              !isTeamContext
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Cliente / Obra Direta
          </button>
          <button
            type="button"
            onClick={() => onToggleTeamContext(true)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              isTeamContext
                ? "bg-slate-900 text-white shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Liderança da Equipe
          </button>
        </div>
      </div>

      {isTeamContext ? (
        /* Modo Membro de Equipe: Destinatário travado com aviso claro */
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-blue-950">
                Enviando diretamente para a Liderança
              </p>
              <p className="text-[11px] text-blue-700">
                A medição será protocolada no painel do Gestor para conferência e aprovação quinzenal.
              </p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white text-[10px]">
            Equipe Interna
          </Badge>
        </div>
      ) : (
        /* Modo Autônomo: Autocomplete integrado ao mini CRM */
        <div className="relative">
          <div className="relative">
            <Input
              placeholder="Digite o nome do cliente ou construtora..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsOpen(true)
                if (clientId) onSelectClient("", e.target.value)
              }}
              onFocus={() => setIsOpen(true)}
              className={`pr-8 bg-white ${
                error ? "border-rose-400 focus-visible:ring-rose-400" : ""
              }`}
            />
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          {error && <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>}

          {/* Dropdown de Clientes */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const isSelected = client.id === clientId
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelect(client.id, client.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-amber-50 text-amber-900 font-semibold"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900 truncate">
                            {client.name}
                          </span>
                        </div>
                        {client.address && (
                          <span className="text-[11px] text-slate-400 block truncate pl-5">
                            {typeof client.address === "string"
                              ? client.address
                              : [client.address.street, client.address.city]
                                  .filter(Boolean)
                                  .join(", ")}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-amber-600 shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  <p>Nenhum cliente encontrado com esse nome.</p>
                </div>
              )}

              {/* Botão de Cadastro Inline Rápido com 1 clique */}
              <div className="border-t border-slate-100 p-2 mt-1">
                {showQuickCreate ? (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <p className="text-[11px] font-semibold text-slate-700">
                      Cadastrar "{searchTerm}" no Mini CRM:
                    </p>
                    <Input
                      placeholder="WhatsApp (ex: 11 99999-8888)"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-slate-500"
                        onClick={() => setShowQuickCreate(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-xs px-3 bg-slate-900 text-white hover:bg-slate-800"
                        onClick={handleCreateQuick}
                      >
                        Salvar e Selecionar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQuickCreate(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Cadastrar "{searchTerm || "Novo Cliente"}" na hora
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
