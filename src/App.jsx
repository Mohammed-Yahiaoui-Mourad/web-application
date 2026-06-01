import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import useAuthStore from './store/useAuthStore'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { ROLE_ROUTES } from './constants'
import AdminLayout from './layouts/AdminLayout'
import HospitalLayout from './layouts/HospitalLayout'
import PatientLayout from './layouts/PatientLayout'
import SidebarLayout from './layouts/SidebarLayout'

import Login from './pages/auth/Login'
import RegisterPatient from './pages/auth/RegisterPatient'
import RegisterDonor from './pages/auth/RegisterDonor'
import DevSetup from './pages/auth/DevSetup'

import SuperAdminDashboard from './pages/super_admin/Dashboard'
import CreateHospitalAdmin from './pages/super_admin/CreateHospitalAdmin'

import AdminHopitalDashboard from './pages/admin_hopital/Dashboard'
import ManageRequests from './pages/admin_hopital/ManageRequests'
import Profile from './pages/Profile'

import PatientDashboard from './pages/patient/Dashboard'
import NewRequest from './pages/patient/NewRequest'

import DonorDashboard from './pages/donneur/Dashboard'
import MyAlerts from './pages/donneur/MyAlerts'

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
  if (profile?.role === 'patient') {
    return <Navigate to="/patient" replace />
  }
  if (profile?.role === 'super_admin' || profile?.role === 'admin') {
    return <Navigate to="/super-admin" replace />
  }
  if (profile?.role === 'donneur') {
    return <Navigate to="/donneur" replace />
  }

  return <Navigate to="/login" replace />
}

function AuthBootstrap({ children }) {
  useAuth()
  return children
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
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/register/donor" element={<RegisterDonor />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/creer-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <CreateHospitalAdmin />
                </ProtectedRoute>
              }
            />
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
          </Route>

          <Route element={<PatientLayout />}>
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/nouvelle-demande"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <NewRequest />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route element={<SidebarLayout />}>
            <Route
              path="/donneur"
              element={
                <ProtectedRoute allowedRoles={['donneur']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donneur/alertes"
              element={
                <ProtectedRoute allowedRoles={['donneur']}>
                  <MyAlerts />
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
