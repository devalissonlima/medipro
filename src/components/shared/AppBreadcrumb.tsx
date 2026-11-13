import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { useProjectsStore } from "@/stores/projectsStore"
import { useMeasurementsStore } from "@/stores/measurementsStore"

export function AppBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const { projects } = useProjectsStore()
  const { measurements } = useMeasurementsStore()

  // Se estiver na raiz "/", mostra apenas "Início"
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
  const items: { label: string; href?: string; isCurrent?: boolean }[] = [
    { label: "Início", href: "/" },
  ]

  const first = segments[0]

  if (first === "dashboard") {
    items.push({ label: "Dashboard", isCurrent: true })
  } else if (first === "servicos") {
    items.push({ label: "Serviços", isCurrent: true })
  } else if (first === "clientes") {
    items.push({ label: "Meus Clientes", isCurrent: true })
  } else if (first === "plano") {
    items.push({ label: "Meu Plano", isCurrent: true })
  } else if (first === "perfil" || first === "usuario") {
    items.push({ label: "Minha Conta", isCurrent: true })
  } else if (first === "medicoes") {
    items.push({ label: "Medições", href: segments.length > 1 ? "/medicoes" : undefined, isCurrent: segments.length === 1 })

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
    items.push({ label: "Projetos", href: segments.length > 1 ? "/projetos" : undefined, isCurrent: segments.length === 1 })

    if (segments[1] === "novo") {
      items.push({ label: "Novo Projeto", isCurrent: true })
    } else if (segments[1]) {
      const project = projects.find((p) => p.id === segments[1])
      const projectTitle = project ? project.title : "Obra"
      const hasSubTab = !!segments[2]

      items.push({
        label: projectTitle,
        href: hasSubTab ? `/projetos/${segments[1]}/visao-geral` : undefined,
        isCurrent: !hasSubTab,
      })

      if (segments[2] === "visao-geral") {
        items.push({ label: "Visão Geral", isCurrent: true })
      } else if (segments[2] === "equipe") {
        items.push({ label: "Equipe da Obra", isCurrent: true })
      }
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
