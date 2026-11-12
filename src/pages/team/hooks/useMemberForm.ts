import { useState, useEffect } from "react"
import { useTeamStore } from "@/stores/teamStore"
import type { MemberRole } from "@/types/team"

export function useMemberForm() {
  const { editingMember, addMember, updateMember, closeModals } = useTeamStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<MemberRole>("Instalador de Mármore")
  const [baseRate, setBaseRate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null)

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setEmail(editingMember.email)
      setPhone(editingMember.phone)
      setRole(editingMember.role)
      setBaseRate(editingMember.baseRate ? String(editingMember.baseRate) : "")
    } else {
      setName("")
      setEmail("")
      setPhone("")
      setRole("Instalador de Mármore")
      setBaseRate("")
    }
    setErrors({})
    setCreatedInviteLink(null)
  }, [editingMember])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "O nome completo do colaborador é obrigatório."
    }

    if (!email.trim()) {
      newErrors.email = "O e-mail de acesso é obrigatório."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Informe um e-mail válido (ex: nome@empresa.com.br)."
    }

    if (!phone.trim()) {
      newErrors.phone = "O telefone / WhatsApp é obrigatório."
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Informe DDD + número de celular válido."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const rateNum = baseRate ? parseFloat(baseRate.replace(",", ".")) : undefined

    if (editingMember) {
      updateMember(editingMember.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        baseRate: isNaN(rateNum as number) ? undefined : rateNum,
      })
      closeModals()
    } else {
      const success = addMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        baseRate: isNaN(rateNum as number) ? undefined : rateNum,
        status: "pending_invite",
      })

      if (success) {
        // Gera link de ativação mockado
        const token = Math.random().toString(36).substring(2, 9)
        const link = `${window.location.origin}/ativar-convite?token=${token}`
        setCreatedInviteLink(link)
      }
    }
  }

  return {
    isEditing: !!editingMember,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    baseRate,
    setBaseRate,
    errors,
    createdInviteLink,
    handleSubmit,
    closeModals,
  }
}
