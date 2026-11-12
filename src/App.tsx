import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/layouts/ProtectedRoute"
import { AppLayout } from "@/layouts/AppLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { HomePage } from "@/pages/home/HomePage"
import { ServicesPage } from "@/pages/services/ServicesPage"
import { MeasurementsPage } from "@/pages/measurements/MeasurementsPage"
import { NewMeasurementPage } from "@/pages/measurements/NewMeasurementPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { TeamPage } from "@/pages/team/TeamPage"
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
            <Route path="/" element={<HomePage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/medicoes" element={<MeasurementsPage />} />
            <Route path="/medicoes/nova" element={<NewMeasurementPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/plano" element={<PlanPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/usuario" element={<Navigate to="/perfil" replace />} />
          </Route>
        </Route>

        {/* Fallback de rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
