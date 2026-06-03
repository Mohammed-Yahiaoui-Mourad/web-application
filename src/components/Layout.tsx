import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const hideSidebar = location.pathname === '/login' || location.pathname === '/dev-setup'

  if (hideSidebar) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-700">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
