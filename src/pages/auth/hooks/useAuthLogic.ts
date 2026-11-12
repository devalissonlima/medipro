import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"

export function useAuthLogic() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, isAuthenticated } = useAuthStore()

  const [email, setEmail] = React.useState("")
  const [senha, setSenha] = React.useState("")
  const [validationError, setValidationError] = React.useState<string | null>(null)

  // Redireciona se o usuário já estiver logado
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!email.trim()) {
      setValidationError("Por favor, preencha o e-mail.")
      return
    }

    if (!senha.trim()) {
      setValidationError("Por favor, informe a senha.")
      return
    }

    const success = await login({ email, senha })
    if (success) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }

  const fillQuickDemo = () => {
    setEmail("carlos.mendes@medipro.com.br")
    setSenha("123456")
  }

  return {
    email,
    setEmail,
    senha,
    setSenha,
    isLoading,
    errorMessage: validationError || error,
    handleSubmit,
    fillQuickDemo,
  }
}
