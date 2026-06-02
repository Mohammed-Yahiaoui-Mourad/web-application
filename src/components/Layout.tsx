import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const hideSidebar = location.pathname === '/login' || location.pathname === '/dev-setup'

  if (hideSidebar) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-12">
        <div className="auth-background" />
        <div className="auth-decor one" />
        <div className="auth-decor two" />
        <div className="auth-decor three" />

        <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6">
          <div className="mx-auto mb-8 max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 px-6 py-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <img src="/amal-logo.png" alt="AMAL logo" className="h-14 w-14 rounded-3xl object-cover shadow-lg shadow-slate-200/50" />
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">AMAL</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">BloodMatch</h1>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600 sm:max-w-xs">
                Administration hospitalière fluide et claire, avant même d'ouvrir la carte.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 page-transition">
          <Outlet />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto page-transition">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
