import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  FolderKanban,
  DollarSign,
  Ruler,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useClientsStore } from "@/stores/clientsStore"
import { useProjectsStore } from "@/stores/projectsStore"
import { useAuthStore } from "@/stores/authStore"
import type { ProjectStatus, BillingCondition } from "@/types/project"

export function NewProjectPage() {
  const navigate = useNavigate()
  const goBack = useSmartBack("/projetos")
  const { clients } = useClientsStore()
  const { addProject } = useProjectsStore()
  const user = useAuthStore((state) => state.user)

  // Bloco 1: Dados Base
  const [title, setTitle] = useState("")
  const [clientId, setClientId] = useState(clients[0]?.id || "")
  const [status, setStatus] = useState<ProjectStatus>("active")

  // Bloco 2: Financeiro e Comercial
  const [budgetedAmount, setBudgetedAmount] = useState<string>("")
  const [laborCostCap, setLaborCostCap] = useState<string>("")
  const [billingCondition, setBillingCondition] = useState<BillingCondition>("by_stage")

  // Bloco 3: Escopo e Metragem
  const [totalAreaExpected, setTotalAreaExpected] = useState<string>("")
  const [areaUnit, setAreaUnit] = useState<string>("m²")
  const [materialsInvolved, setMaterialsInvolved] = useState("")
  const [description, setDescription] = useState("")

  // Bloco 4: Prazos e Logística
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [address, setAddress] = useState("")
  const [accessRules, setAccessRules] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSolo = user?.role === "SOLO"
  const planCapacity = isSolo ? 1 : 5

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Informe o nome ou título da obra.")
      return
    }
    if (!clientId) {
      setError("Selecione o cliente vinculado a este projeto.")
      return
    }
    if (startDate && endDate && endDate < startDate) {
      setError("A data de previsão de finalização não pode ser anterior à data de início.")
      return
    }

    if (!user) return

    setIsSubmitting(true)

    const selectedClient = clients.find((c) => c.id === clientId)

    const numericBudget = budgetedAmount ? parseFloat(budgetedAmount.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined
    const numericLabor = laborCostCap ? parseFloat(laborCostCap.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined
    const numericArea = totalAreaExpected ? parseFloat(totalAreaExpected.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined

    const newProject = addProject({
      tenantId: user.tenantId,
      clientId,
      clientName: selectedClient?.name || "Cliente",
      title: title.trim(),
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      budgetedAmount: isNaN(numericBudget as number) ? undefined : numericBudget,
      laborCostCap: isNaN(numericLabor as number) ? undefined : numericLabor,
      billingCondition,
      totalAreaExpected: isNaN(numericArea as number) ? undefined : numericArea,
      areaUnit,
      materialsInvolved: materialsInvolved.trim() || undefined,
      accessRules: accessRules.trim() || undefined,
      maxMembers: planCapacity,
    })

    setIsSubmitting(false)
    navigate(`/projetos/${newProject.id}/visao-geral`)
  }

  return (
    <PageContainer className="max-w-5xl space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goBack("/projetos")}
            className="h-9 w-9 text-slate-600 hover:text-slate-900 border-slate-300 shrink-0"
            title="Voltar para a página anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Gestão de Obras & Projetos
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Novo Projeto / Obra
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => goBack("/projetos")}
            className="text-xs h-9"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs h-9 bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Cadastrando..." : "Cadastrar Projeto"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOCO 1: DADOS BASE DO PROJETO */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-amber-500" />
              <span>Bloco 1: Identificação & Dados Base da Obra</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nome da Obra / Projeto <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Residencial Alphaville Zero - Cozinha & Gourmet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Cliente Vinculado (CRM) <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="bg-white text-xs h-9"
                >
                  <option value="" disabled>Selecione um cliente cadastrado...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ""}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Status Inicial
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="bg-white text-xs h-9"
                >
                  <option value="active">Em andamento (Execução)</option>
                  <option value="planning">Planejamento / Aguardando Início</option>
                  <option value="paused">Pausado</option>
                </Select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 block">Vagas de Equipe:</span>
                  <span className="text-[11px] text-slate-500">
                    {isSolo
                      ? "1 vaga ativa (Plano Solo)."
                      : "Até 5 colaboradores ativos na obra (definido pelo seu Plano Pro)."}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 2: DADOS FINANCEIROS E COMERCIAIS */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>Bloco 2: Dados Financeiros & Condição Comercial</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Valor Total Orçado com Cliente (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={budgetedAmount}
                  onChange={(e) => setBudgetedAmount(e.target.value)}
                  className="bg-white text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-slate-400">Contrato global acordado</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Teto Estimado de Mão de Obra (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={laborCostCap}
                  onChange={(e) => setLaborCostCap(e.target.value)}
                  className="bg-white text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-slate-400">Limite de repasse aos instaladores</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Condição de Faturamento
                </label>
                <Select
                  value={billingCondition}
                  onChange={(e) => setBillingCondition(e.target.value as BillingCondition)}
                  className="bg-white text-xs h-9"
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="by_stage">Por Etapa / Medição Aprovada</option>
                  <option value="on_completion">Na Entrega Final</option>
                </Select>
                <span className="text-[10px] text-slate-400">Ciclo de conferência e liquidação</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 3: ESCOPO E METRAGEM */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-600" />
              <span>Bloco 3: Escopo, Metragens & Materiais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700">
                  Metragem Total Prevista
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 85.50"
                    value={totalAreaExpected}
                    onChange={(e) => setTotalAreaExpected(e.target.value)}
                    className="bg-white text-xs h-9 font-mono flex-1"
                  />
                  <Select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value)}
                    className="bg-white text-xs h-9 w-24 shrink-0"
                  >
                    <option value="m²">m²</option>
                    <option value="m linear">m linear</option>
                    <option value="peças">peças</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Principais Materiais Envolvidos
                </label>
                <Input
                  placeholder="Ex: Mármore Travertino Navona, Porcelanato 120x120, Granito Preto São Gabriel"
                  value={materialsInvolved}
                  onChange={(e) => setMaterialsInvolved(e.target.value)}
                  className="bg-white text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Descrição Detalhada do Escopo da Obra
              </label>
              <Textarea
                placeholder="Descreva o escopo contratado, áreas de intervenção (cozinha, varanda gourmet, banheiros), detalhes técnicos e acabamentos esperados..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white text-xs min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 4: PRAZOS E LOGÍSTICA */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Bloco 4: Prazos, Endereço & Logística de Campo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Data de Início da Obra
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
                  Previsão de Finalização / Entrega
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Endereço Completo da Obra
              </label>
              <Input
                placeholder="Ex: Alameda das Sucupiras, 210 - Alphaville Zero, Santana de Parnaíba - SP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Regras de Acesso ao Local & Observações de Logística
              </label>
              <Textarea
                placeholder="Ex: Horário de ruído permitido das 09h às 17h; necessário liberação prévia na portaria com documento; uso exclusivo do elevador de serviço..."
                value={accessRules}
                onChange={(e) => setAccessRules(e.target.value)}
                className="bg-white text-xs min-h-[70px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rodapé de Envio */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => goBack("/projetos")}
            className="text-xs h-10 px-5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Criando Obra..." : "Concluir e Criar Projeto"}</span>
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}

export default NewProjectPage
