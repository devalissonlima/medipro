import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/layouts/ProtectedRoute"
import { AppLayout } from "@/layouts/AppLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { HomePage } from "@/pages/home/HomePage"
import { ServicesPage } from "@/pages/services/ServicesPage"
import { MeasurementsPage } from "@/pages/measurements/MeasurementsPage"
import { NewMeasurementPage } from "@/pages/measurements/NewMeasurementPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ProjectsPage } from "@/pages/projects/ProjectsPage"
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage"
import { ClientsPage } from "@/pages/clients/ClientsPage"
import { PlanPage } from "@/pages/plan/PlanPage"
import { ProfilePage } from "@/pages/profile/ProfilePage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Autenticação */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Protegidas dentro do AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Rotas comuns a todos os perfis autenticados */}
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/usuario" element={<Navigate to="/perfil" replace />} />

            {/* Dashboard Geral: Exclusiva de MANAGER (e MASTER) */}
            <Route element={<ProtectedRoute allowedRoles={["MASTER", "MANAGER"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Serviços e Medições (Lista): MEMBER, SOLO e MASTER */}
            <Route element={<ProtectedRoute allowedRoles={["MASTER", "MEMBER", "SOLO"]} />}>
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/medicoes" element={<MeasurementsPage />} />
            </Route>

            {/* Nova & Editar Medição: MEMBER, PROJECT_SUPERVISOR, SOLO e MASTER */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["MASTER", "PROJECT_SUPERVISOR", "MEMBER", "SOLO"]}
                />
              }
            >
              <Route path="/medicoes/nova" element={<NewMeasurementPage />} />
              <Route path="/medicoes/editar/:id" element={<NewMeasurementPage />} />
            </Route>

            {/* Projetos: MANAGER, PROJECT_SUPERVISOR, MEMBER, SOLO e MASTER */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "MEMBER", "SOLO"]}
                />
              }
            >
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/projetos/:id" element={<ProjectDetailPage />} />
            </Route>

            {/* Clientes: MANAGER, PROJECT_SUPERVISOR, SOLO e MASTER */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["MASTER", "MANAGER", "PROJECT_SUPERVISOR", "SOLO"]}
                />
              }
            >
              <Route path="/clientes" element={<ClientsPage />} />
            </Route>

            {/* Meu Plano: MANAGER, SOLO e MASTER */}
            <Route element={<ProtectedRoute allowedRoles={["MASTER", "MANAGER", "SOLO"]} />}>
              <Route path="/plano" element={<PlanPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback de rotas desconhecidas ou antigas (ex: /equipe removida) */}
        <Route path="/equipe" element={<Navigate to="/projetos" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
