import React from "react"
import { useNavigate } from "react-router-dom"
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  CreditCard,
  LogOut,
  Calendar,
  Sparkles,
  ArrowLeft,
} from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const userInitials = user?.nome
    ? user.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "MP"

  const roleLabels: Record<string, string> = {
    gestor: "Líder / Empreiteiro (Gestor)",
    prestador: "Prestador / Instalador de Campo",
    autonomo: "Profissional Autônomo",
    admin: "Administrador da Conta",
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl">
        {/* Botão de retorno e Cabeçalho */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <PageHeader
          title="Minha Conta"
          description="Gerencie seus dados de acesso, função no Medipro e encerramento de sessão."
          badge={
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Sparkles className="h-3 w-3 mr-1" />
              Sessão Ativa
            </Badge>
          }
        />

        {/* Card Principal: Resumo do Usuário */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados do Perfil</CardTitle>
            <CardDescription>
              Informações vinculadas à sua credencial de acesso na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl border border-border/60 bg-muted/20">
              <Avatar className="h-20 w-20 border-2 border-primary/20 text-xl font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AvatarImage src={user?.avatarUrl} alt={user?.nome} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground truncate">
                    {user?.nome || "Usuário Medipro"}
                  </h3>
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 text-xs">
                    {user?.plano || "Plano Pro"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{user?.email || "usuario@medipro.com.br"}</span>
                </div>
              </div>
            </div>

            {/* Grid de Atributos da Conta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-card">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Perfil de Acesso</span>
                  <p className="text-sm font-semibold text-foreground">
                    {roleLabels[user?.role || "gestor"] || "Gestor"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-card">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Assinatura Ativa</span>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.plano || "Plano Pro"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-card">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status da Conta</span>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Ativo e Verificado
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Encerramento de Sessão */}
        <Card className="border-rose-500/30 bg-rose-500/[0.02] shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Sessão e Segurança
            </CardTitle>
            <CardDescription>
              Encerre sua sessão no dispositivo atual para proteger seus dados de medição.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Deseja desconectar sua conta?
                </p>
                <p className="text-xs text-muted-foreground">
                  Você precisará informar seu e-mail e senha no próximo acesso.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2 shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-medium"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
