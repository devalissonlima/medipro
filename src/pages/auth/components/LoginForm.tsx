import {
  ArrowRight,
  Lock,
  Mail,
  HardHat,
  AlertCircle,
  Crown,
  ClipboardCheck,
  Wrench,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthLogic } from "../hooks/useAuthLogic"
import type { UserRole } from "@/types/auth"

interface MockProfileButton {
  role: Exclude<UserRole, "MASTER">
  title: string
  subtitle: string
  icon: typeof Crown
  badgeColor: string
}

const MOCK_PROFILE_BUTTONS: MockProfileButton[] = [
  {
    role: "MANAGER",
    title: "Login como MANAGER",
    subtitle: "Patrão / Dono da empresa",
    icon: Crown,
    badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300",
  },
  {
    role: "PROJECT_SUPERVISOR",
    title: "Login como SUPERVISOR",
    subtitle: "Encarregado de obras",
    icon: ClipboardCheck,
    badgeColor: "bg-blue-500/15 text-blue-700 border-blue-300",
  },
  {
    role: "MEMBER",
    title: "Login como MEMBER",
    subtitle: "Instalador / Campo",
    icon: Wrench,
    badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  },
  {
    role: "SOLO",
    title: "Login como SOLO",
    subtitle: "Autônomo individual",
    icon: UserCheck,
    badgeColor: "bg-purple-500/15 text-purple-700 border-purple-300",
  },
]

export function LoginForm() {
  const {
    email,
    setEmail,
    senha,
    setSenha,
    isLoading,
    errorMessage,
    handleSubmit,
    handleMockLogin,
  } = useAuthLogic()

  return (
    <Card className="w-full max-w-lg border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader className="space-y-2 pb-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 mb-1">
          <HardHat className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Acesse o MediPro
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Plataforma B2B de medições, obras e controle operacional.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
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
            <label
              htmlFor="senha"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Senha de acesso
            </label>
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 h-10 shadow-sm gap-2 transition-colors"
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
        </form>

        {/* Área de Login Mockado para Testes de UI e RBAC */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Testar Perfis (Mock)
            </h3>
            <span className="text-[11px] text-slate-400">
              Acesso instantâneo com 1 clique
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_PROFILE_BUTTONS.map((profile) => {
              const Icon = profile.icon
              return (
                <button
                  key={profile.role}
                  type="button"
                  onClick={() => handleMockLogin(profile.role)}
                  className="group flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition-colors hover:border-amber-400 hover:bg-amber-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${profile.badgeColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                      {profile.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
