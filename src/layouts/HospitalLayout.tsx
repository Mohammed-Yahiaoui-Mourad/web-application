import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function HospitalLayout() {
  return (
    <div className="h-screen overflow-hidden bg-transparent">
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
