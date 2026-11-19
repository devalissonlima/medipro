import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useTeamStore } from "@/stores/teamStore"
import type { TeamAccountType } from "@/types/team"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useMemberForm() {
  const user = useAuthStore((state) => state.user)
  const { isInviteModalOpen, createMemberInvite, closeModals } = useTeamStore()

  const tenantId = user?.tenantId || "tenant_01"
  const plan = user?.plano || "Plano Pro"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [accountType, setAccountType] = useState<TeamAccountType>("MEMBER")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isInviteModalOpen) {
      setName("")
      setEmail("")
      setAccountType("MEMBER")
      setErrors({})
    }
  }, [isInviteModalOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (name.trim().length < 2) {
      newErrors.name = "Informe o nome completo do usuário."
    }

    if (!email.trim()) {
      newErrors.email = "O e-mail corporativo ou de acesso é obrigatório."
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Informe um e-mail válido (ex: usuario@empresa.com.br)."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const result = createMemberInvite(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        accountType,
      },
      tenantId,
      plan
    )

    if (!result.success && result.error) {
      setErrors({ email: result.error })
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    accountType,
    setAccountType,
    errors,
    setErrors,
    handleSubmit,
    closeModals,
  }
}
