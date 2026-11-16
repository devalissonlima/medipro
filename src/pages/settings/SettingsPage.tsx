import { useState } from "react"
import { Layers } from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { MasterCatalogTab } from "./components/MasterCatalogTab"

type SettingsTab = "catalog"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("catalog")

  return (
    <PageContainer className="space-y-6 pb-20">
      <PageHeader
        title="Configurações da Empresa"
        description="Gestão de padrões corporativos, catálogo geral de serviços e regras operacionais."
      />

      {/* Tabs de Configuração */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === "catalog"
                ? "border-amber-500 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Layers className="h-4 w-4 text-amber-500" />
            <span>Catálogo Geral de Serviços</span>
          </button>
        </nav>
      </div>

      {/* Conteúdo da Tab */}
      {activeTab === "catalog" && <MasterCatalogTab />}
    </PageContainer>
  )
}

export default SettingsPage
