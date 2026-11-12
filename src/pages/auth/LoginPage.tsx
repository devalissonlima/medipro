import { LoginForm } from "./components/LoginForm"
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Subtle Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <LoginForm />

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
            <span>Medições Precisas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Aprovação Ágil</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Dados Seguros</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Medipro SaaS &copy; {new Date().getFullYear()} — Plataforma Especializada para Construção & Reformas
        </p>
      </div>
    </div>
  )
}
