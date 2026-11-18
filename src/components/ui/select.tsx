import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ParsedOption {
  value: string
  label: string
  disabled?: boolean
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children)
  }
  return ""
}

function collectOptions(
  children: React.ReactNode,
  acc: ParsedOption[] = []
): ParsedOption[] {
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{
        value?: string | number
        disabled?: boolean
        children?: React.ReactNode
      }>(child)
    ) {
      return
    }

    if (child.type === "option") {
      const label = extractText(child.props.children).trim()
      const value =
        child.props.value !== undefined ? String(child.props.value) : label
      acc.push({
        value,
        label,
        disabled: child.props.disabled,
      })
    } else if (child.props.children) {
      collectOptions(child.props.children, acc)
    }
  })

  return acc
}

export interface SelectProps {
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  title?: string
  required?: boolean
  placeholder?: string
  "aria-label"?: string
  children?: React.ReactNode
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
      id,
      name,
      title,
      placeholder = "Selecione...",
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const options = React.useMemo(() => collectOptions(children), [children])
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue !== undefined ? String(defaultValue) : ""
    )

    const isControlled = value !== undefined
    const currentValue = isControlled ? String(value) : internalValue

    const selectedOption =
      options.find((opt) => opt.value === currentValue) ||
      (!isControlled && !defaultValue ? options[0] : undefined)

    const displayLabel = selectedOption?.label || placeholder

    const handleSelect = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)

      if (onChange) {
        const syntheticTarget = {
          value: nextValue,
          name: name || "",
          id: id || "",
        } as unknown as HTMLSelectElement

        const syntheticEvent = {
          target: syntheticTarget,
          currentTarget: syntheticTarget,
        } as React.ChangeEvent<HTMLSelectElement>

        onChange(syntheticEvent)
      }
    }

    return (
      <DropdownMenuPrimitive.Root modal={false}>
        <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
          <Button
            ref={ref}
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            title={title}
            aria-label={ariaLabel}
            className={cn(
              "group flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-2xs transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                (!selectedOption || selectedOption.disabled) && "text-slate-400"
              )}
            >
              {displayLabel}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[80] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(92vw,28rem)] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {options.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-slate-400">
                Nenhuma opção disponível
              </div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = selectedOption?.value === opt.value
                return (
                  <DropdownMenuPrimitive.Item
                    key={`${opt.value}-${idx}`}
                    disabled={opt.disabled}
                    onSelect={() => handleSelect(opt.value)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                      isSelected && "bg-amber-50/80 text-amber-950 font-semibold"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    )}
                  </DropdownMenuPrimitive.Item>
                )
              })
            )}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    )
  }
)
Select.displayName = "Select"

export { Select }
