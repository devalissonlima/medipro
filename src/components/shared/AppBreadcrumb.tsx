import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"
import { useBudgetsStore } from "@/stores/budgetsStore"

export function AppBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const { projects, folders } = useProjectsStore()
  const { measurements } = useMeasurementsStore()
  const { budgets } = useBudgetsStore()

  // O item "Início" existe apenas na página de início ("/")
  if (pathname === "/") {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
          <Home className="h-3.5 w-3.5 text-amber-500" />
          <span>Início</span>
        </span>
      </nav>
    )
  }

  const segments = pathname.split("/").filter(Boolean)
  const items: { label: string; href?: string; isCurrent?: boolean }[] = []

  const first = segments[0]

  if (first === "dashboard") {
    items.push({ label: "Dashboard", isCurrent: true })
  } else if (first === "equipe") {
    items.push({ label: "Minha Equipe", isCurrent: true })
  } else if (first === "servicos") {
    items.push({ label: "Serviços", isCurrent: true })
  } else if (first === "clientes") {
    items.push({ label: "Meus Clientes", isCurrent: true })
  } else if (first === "plano") {
    items.push({ label: "Meu Plano", isCurrent: true })
  } else if (first === "configuracoes") {
    items.push({ label: "Configurações", isCurrent: true })
  } else if (first === "perfil" || first === "usuario" || first === "minha-conta") {
    items.push({ label: "Minha Conta", isCurrent: true })
  } else if (first === "orcamentos") {
    items.push({
      label: "Orçamentos",
      href: segments.length > 1 ? "/orcamentos" : undefined,
      isCurrent: segments.length === 1,
    })

    if (segments[1] === "novo") {
      items.push({ label: "Novo Orçamento", isCurrent: true })
    } else if (segments[1] && segments[2] === "editar") {
      const budget = budgets.find((b) => b.id === segments[1])
      items.push({
        label: budget ? budget.code : "Orçamento",
        href: `/orcamentos/${segments[1]}`,
      })
      items.push({ label: "Editar", isCurrent: true })
    } else if (segments[1]) {
      const budget = budgets.find((b) => b.id === segments[1])
      items.push({
        label: budget ? `${budget.code} — ${budget.title}` : "Proposta",
        isCurrent: true,
      })
    }
  } else if (first === "medicoes") {
    items.push({
      label: "Medições",
      href: segments.length > 1 ? "/medicoes" : undefined,
      isCurrent: segments.length === 1,
    })

    if (segments[1] === "nova") {
      items.push({ label: "Nova Medição", isCurrent: true })
    } else if (segments[1] === "editar" && segments[2]) {
      const measurement = measurements.find((m) => m.id === segments[2])
      items.push({ label: "Editar" })
      items.push({
        label: measurement ? measurement.title : "Medição",
        isCurrent: true,
      })
    } else if (segments[1]) {
      const measurement = measurements.find((m) => m.id === segments[1])
      items.push({
        label: measurement ? measurement.title : "Detalhes",
        isCurrent: true,
      })
    }
  } else if (first === "projetos") {
    items.push({
      label: "Projetos",
      href: segments.length > 1 ? "/projetos" : undefined,
      isCurrent: segments.length === 1,
    })

    if (segments[1] === "novo") {
      items.push({ label: "Novo Projeto", isCurrent: true })
    } else if (segments.length === 2) {
      // Rota de pasta: /projetos/:folderId
      const folder = (folders || []).find((f) => f.id === segments[1])
      const project = projects.find((p) => p.id === segments[1])
      items.push({
        label: folder ? folder.name : project ? project.title : "Pasta",
        isCurrent: true,
      })
    } else if (segments.length === 3) {
      // Rota de projeto na raiz: /projetos/:id/:tab -> Exibe apenas: Projetos > [Pasta se houver] > Projeto
      const project = projects.find((p) => p.id === segments[1])
      const projectTitle = project ? project.title : "Obra"

      if (project?.folderId) {
        const folder = (folders || []).find((f) => f.id === project.folderId)
        if (folder) {
          items.push({
            label: folder.name,
            href: `/projetos/${folder.id}`,
          })
        }
      }

      items.push({
        label: projectTitle,
        isCurrent: true,
      })
    } else if (segments.length >= 4) {
      // Rota de projeto dentro de pasta: /projetos/:folderId/:id/:tab -> Exibe apenas: Projetos > Pasta > Projeto
      const folderId = segments[1]
      const projectId = segments[2]

      const folder = (folders || []).find((f) => f.id === folderId)
      const project = projects.find((p) => p.id === projectId)

      items.push({
        label: folder ? folder.name : "Pasta",
        href: `/projetos/${folderId}`,
      })

      items.push({
        label: project ? project.title : "Obra",
        isCurrent: true,
      })
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-1.5 shrink-0">
            {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-slate-900 transition-colors truncate max-w-[150px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate max-w-[160px] sm:max-w-[260px] ${
                  isLast ? "font-semibold text-slate-900" : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
