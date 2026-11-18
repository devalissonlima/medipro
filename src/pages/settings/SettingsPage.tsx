import { useState } from "react"
import { Layers, Palette } from "lucide-react"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { BrandIdentityFormTab } from "@/components/shared/BrandIdentityFormTab"
import { Button } from "@/components/ui/button"
import { MasterCatalogTab } from "./components/MasterCatalogTab"

type SettingsTab = "catalog" | "branding"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("catalog")

  return (
    <PageContainer className="space-y-6 pb-20">
      <PageHeader
        title="Configurações da Empresa"
        description="Gestão de padrões corporativos, catálogo unificado de composições e identidade visual timbrada."
      />

      {/* Tabs de Configuração */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <Button
            type="button"
            variant="unstyled"
            size="auto"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-xs transition-colors shrink-0 ${
              activeTab === "catalog"
                ? "border-amber-500 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Layers className="h-4 w-4 text-amber-500" />
            <span>Catálogo Geral de Serviços</span>
          </Button>

          <Button
            type="button"
            variant="unstyled"
            size="auto"
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-xs transition-colors shrink-0 ${
              activeTab === "branding"
                ? "border-amber-500 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Palette className="h-4 w-4 text-amber-500" />
            <span>Identidade &amp; Papel Timbrado</span>
          </Button>
        </nav>
      </div>

      {/* Conteúdo da Tab */}
      {activeTab === "catalog" && <MasterCatalogTab />}
      {activeTab === "branding" && <BrandIdentityFormTab />}
    </PageContainer>
  )
}

export default SettingsPage
