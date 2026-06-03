import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function HospitalLayout() {
  const location = useLocation()

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg)] transition-colors duration-700">
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="min-h-full animate-fade-in-up transition-all duration-400 ease-out">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
