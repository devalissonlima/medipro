import { useState, useEffect } from "react"
import { useClientsStore } from "@/stores/clientsStore"
import type { ClientType } from "@/types/client"

export function useClientForm() {
  const { editingClient, addClient, updateClient, closeModals } = useClientsStore()

  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [type, setType] = useState<ClientType>("residential")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [document, setDocument] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("São Paulo")
  const [state, setState] = useState("SP")
  const [notes, setNotes] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name)
      setCompanyName(editingClient.companyName || "")
      setType(editingClient.type || "residential")
      setPhone(editingClient.phone || editingClient.whatsapp || "")
      setEmail(editingClient.email || "")
      setDocument(editingClient.document || "")
      setStreet(editingClient.address?.street || "")
      setNumber(editingClient.address?.number || "")
      setNeighborhood(editingClient.address?.neighborhood || "")
      setCity(editingClient.address?.city || "São Paulo")
      setState(editingClient.address?.state || "SP")
      setNotes(editingClient.notes || "")
    } else {
      setName("")
      setCompanyName("")
      setType("residential")
      setPhone("")
      setEmail("")
      setDocument("")
      setStreet("")
      setNumber("")
      setNeighborhood("")
      setCity("São Paulo")
      setState("SP")
      setNotes("")
    }
    setErrors({})
  }, [editingClient])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "O nome ou contato principal é obrigatório."
    }

    if (!phone.trim()) {
      newErrors.phone = "O telefone / WhatsApp é obrigatório."
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Informe DDD + número de telefone válido."
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Formato de e-mail inválido."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const addressData = {
      street: street.trim() || undefined,
      number: number.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      city: city.trim() || "São Paulo",
      state: state.trim() || "SP",
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        type,
        phone: phone.trim(),
        whatsapp: phone.trim(),
        email: email.trim().toLowerCase() || undefined,
        document: document.trim() || undefined,
        address: addressData,
        notes: notes.trim() || undefined,
      })
    } else {
      addClient({
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        type,
        phone: phone.trim(),
        email: email.trim().toLowerCase() || undefined,
        document: document.trim() || undefined,
        address: addressData,
        notes: notes.trim() || undefined,
      })
    }
  }

  return {
    isEditing: !!editingClient,
    name,
    setName,
    companyName,
    setCompanyName,
    type,
    setType,
    phone,
    setPhone,
    email,
    setEmail,
    document,
    setDocument,
    street,
    setStreet,
    number,
    setNumber,
    neighborhood,
    setNeighborhood,
    city,
    setCity,
    state,
    setState,
    notes,
    setNotes,
    errors,
    handleSubmit,
    closeModals,
  }
}
