import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { ROLE_ROUTES } from '../constants'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading, token } = useAuthStore()

  // If still initializing, show loading spinner
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8293A] border-t-transparent" />
      </div>
    )
  }

  // Check if we have token but user not set yet - don't redirect immediately
  const hasToken = !!token || !!localStorage.getItem('access_token')
  
  // If no token and no user, redirect to login
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    // If we have a token, show loading or profile missing message
    if (hasToken) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-700">Chargement du profil...</p>
          </div>
        </div>
      )
    }
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-gray-700">Profil introuvable. Contactez l&apos;administrateur.</p>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const redirect = ROLE_ROUTES[profile.role] || '/login'
    return <Navigate to={redirect} replace />
  }

  return children
}
