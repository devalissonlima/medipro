import { ArrowRight, Lock, Mail, HardHat, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthLogic } from "../hooks/useAuthLogic"

export function LoginForm() {
  const {
    email,
    setEmail,
    senha,
    setSenha,
    isLoading,
    errorMessage,
    handleSubmit,
    fillQuickDemo,
  } = useAuthLogic()

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader className="space-y-2 pb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 mb-2">
          <HardHat className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Acesse o Medipro
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Plataforma de medições, orçamentos e gestão para construção e reformas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              E-mail corporativo
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="border-slate-300 focus-visible:ring-amber-500"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="senha"
                className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Senha de acesso
              </label>
            </div>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
              className="border-slate-300 focus-visible:ring-amber-500"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 h-10 shadow-sm gap-2 transition-all"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar na plataforma</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="pt-2">
            <button
              type="button"
              onClick={fillQuickDemo}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70 rounded-md py-2 transition-colors font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Preencher com credenciais de demonstração
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
