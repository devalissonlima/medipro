import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useNavigationHistoryStore } from "@/stores/navigationHistoryStore"

/**
 * Hook para voltar à página anterior analisando o histórico do router.
 * Se a página anterior foi /login ou não há histórico anterior no router, redireciona para o fallback (padrão: "/").
 */
export function useSmartBack(defaultFallback: string = "/") {
  const navigate = useNavigate()
  const getPreviousPath = useNavigationHistoryStore((s) => s.getPreviousPath)

  const goBack = useCallback(
    (customFallback?: string) => {
      const fallback = customFallback || defaultFallback
      const prev = getPreviousPath()

      // Verificar se a página anterior foi login ou vazia
      const isLoginOrEmpty =
        !prev ||
        prev === "/login" ||
        prev.startsWith("/login") ||
        prev === "#/login" ||
        prev === ""

      // Verificar também o histórico do navegador (state idx do react-router)
      const historyIdx = (window.history.state as { idx?: number } | null)?.idx ?? 0

      if (isLoginOrEmpty || historyIdx <= 0) {
        navigate(fallback, { replace: true })
        return
      }

      // Voltar exatamente para a página anterior no histórico
      navigate(-1)
    },
    [navigate, defaultFallback, getPreviousPath]
  )

  return goBack
}
