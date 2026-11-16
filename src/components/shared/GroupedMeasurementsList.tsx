import React, { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { groupMeasurementsByDate } from "@/utils/dateGrouping"
import type { Measurement } from "@/types/measurement"

interface GroupedMeasurementsListProps {
  measurements: Measurement[]
  renderItem?: (measurement: Measurement) => React.ReactNode
  renderGroupContent?: (items: Measurement[], groupId: string) => React.ReactNode
}

export const GroupedMeasurementsList: React.FC<GroupedMeasurementsListProps> = ({
  measurements,
  renderItem,
  renderGroupContent,
}) => {
  const groups = useMemo(
    () => groupMeasurementsByDate(measurements),
    [measurements]
  )

  // Conjunto de IDs de grupos recolhidos (por padrão, todos iniciam expandidos = Set vazio)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.id)
        const count = group.items.length

        return (
          <div key={group.id} className="space-y-2">
            {/* Cabeçalho Clicável Estilo Outlook */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-100/80 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-200/60 hover:border-slate-300 group"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-600 shadow-2xs border border-slate-200/80 group-hover:text-slate-900 transition-colors">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
                <CalendarDays className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  {group.label}
                </span>
              </div>

              <Badge
                variant="outline"
                className="bg-white text-slate-600 border-slate-200/90 text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs"
              >
                {count} {count === 1 ? "medição" : "medições"}
              </Badge>
            </button>

            {/* Conteúdo do Grupo Expandido */}
            {!isCollapsed && (
              <div className="animate-in fade-in duration-150">
                {renderGroupContent ? (
                  renderGroupContent(group.items, group.id)
                ) : renderItem ? (
                  <div className="space-y-2.5">
                    {group.items.map((item) => (
                      <React.Fragment key={item.id}>
                        {renderItem(item)}
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
