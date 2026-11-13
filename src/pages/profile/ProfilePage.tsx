import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSmartBack } from "@/hooks/useSmartBack"
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  CreditCard,
  LogOut,
  Calendar,
  ArrowLeft,
  Camera,
  Save,
  Briefcase,
  Phone,
  Upload,
} from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { toast } from "@/components/ui/use-toast"
import { PageContainer } from "@/components/shared/PageContainer"
import { PageHeader } from "@/components/shared/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
]

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const goBack = useSmartBack("/")
  const { user, logout, updateProfile } = useAuthStore()

  const [name, setName] = useState(user?.name || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [specialty, setSpecialty] = useState(user?.specialty || "")
  const [phone, setPhone] = useState(user?.phone || "")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setAvatarUrl(user.avatarUrl || "")
      setSpecialty(user.specialty || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
      specialty: specialty.trim(),
      phone: phone.trim(),
    })

    toast({
      title: "Perfil Atualizado",
      description: "Suas alterações de perfil foram salvas com sucesso!",
      variant: "success",
    })
  }

  const userInitials = (name || user?.name || "MP")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  const roleLabels: Record<string, string> = {
    MASTER: "Administrador Master",
    MANAGER: "Patrão / Dono (MANAGER)",
    PROJECT_SUPERVISOR: "Encarregado de Obra (SUPERVISOR)",
    MEMBER: "Instalador / Campo (MEMBER)",
    SOLO: "Profissional Autônomo (SOLO)",
  }

  return (
    <PageContainer className="space-y-6 pb-20">
      {/* Botão de retorno e Cabeçalho */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack("/")}
          className="text-xs text-slate-500 hover:text-slate-900 gap-1.5"
          title="Voltar para a página anterior"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title="Minha Conta"
        description="Gerencie seus dados de acesso, função no Medipro e encerramento de sessão."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Edição de Perfil (2 Colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/90 shadow-2xs bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Editar Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize sua foto, nome de exibição e especialidade profissional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                {/* Avatar Preview & Upload */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/70">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-slate-200 text-xl font-bold bg-amber-500/10 text-amber-700">
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                      title="Carregar foto"
                    >
                      <Camera className="h-5 w-5" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">Foto de Perfil</h4>
                    <p className="text-xs text-slate-500">
                      Escolha uma foto do seu dispositivo ou selecione um avatar rápido abaixo:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 cursor-pointer text-slate-700 shadow-2xs"
                      >
                        <Upload className="h-3 w-3 text-slate-500" />
                        <span>Carregar Imagem</span>
                      </label>

                      {PRESET_AVATARS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`h-7 w-7 rounded-full overflow-hidden border-2 transition-all ${
                            avatarUrl === preset ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200 hover:border-slate-400"
                          }`}
                          title={`Selecionar avatar ${index + 1}`}
                        >
                          <img src={preset} alt={`Opção ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Campos do Formulário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="user-name" className="text-xs font-semibold text-slate-700">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      id="user-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="user-specialty" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      Cargo / Especialidade
                    </label>
                    <Input
                      id="user-specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Encarregado Geral, Gesseiro, etc."
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="user-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Telefone / WhatsApp
                    </label>
                    <Input
                      id="user-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-10 px-5 shadow-xs"
                  >
                    <Save className="h-4 w-4 text-amber-400" />
                    <span>Salvar Alterações</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Zona de Segurança / Logout */}
          <Card className="border-rose-200 bg-rose-50/20 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-800 flex items-center gap-2">
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
                  <p className="text-xs font-semibold text-slate-800">
                    Deseja desconectar sua conta?
                  </p>
                  <p className="text-xs text-slate-500">
                    Você precisará informar seu e-mail e senha no próximo acesso.
                  </p>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="gap-2 shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 px-4"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Credencial e Plano (1 Coluna Lateral) */}
        <div className="space-y-6">
          <Card className="border-slate-200/90 shadow-2xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Credencial de Acesso
              </CardTitle>
              <CardDescription className="text-xs">
                Informações controladas pelo administrador do tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  E-mail de Login
                </span>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{user?.email || "usuario@medipro.com.br"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Perfil de Acesso (RBAC)
                </span>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{roleLabels[user?.role || "MANAGER"] || "Gestor"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Plano da Conta
                </span>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>{user?.plano || "Plano Pro"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Status da Conta
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Ativo e Verificado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
