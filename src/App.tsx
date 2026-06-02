import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import useAuthStore from './store/useAuthStore'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminHopitalDashboard from './pages/admin_hopital/Dashboard'
import ManageRequests from './pages/admin_hopital/ManageRequests'
import Planning from './pages/admin_hopital/Planning'
import Donneurs from './pages/admin_hopital/Donneurs'
import Historique from './pages/admin_hopital/Historique'
import Team from './pages/admin_hopital/Team'
import Profile from './pages/Profile'
import Login from './pages/auth/Login'
import DevSetup from './pages/auth/DevSetup'
import HospitalLayout from './layouts/HospitalLayout'

function RoleRedirect() {
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8293A] border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (profile?.role === 'admin_hopital' || profile?.role === 'hospital') {
    return <Navigate to="/admin-hopital" replace />
  }

  return <Navigate to="/login" replace />
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuth()
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />

          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            {import.meta.env.DEV && <Route path="/dev-setup" element={<DevSetup />} />}
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<HospitalLayout />}>
            <Route
              path="/admin-hopital"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <AdminHopitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-hopital/demandes"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <ManageRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-hopital/planning"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <Planning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-hopital/donneurs"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <Donneurs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-hopital/historique"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <Historique />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-hopital/equipe"
              element={
                <ProtectedRoute allowedRoles={['admin_hopital']}>
                  <Team />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  )
}
