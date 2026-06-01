import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function SidebarLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-red-600">Donor Dashboard</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">Mes alertes et mon activité</h1>
                  <p className="mt-1 text-gray-600">Consultez les alertes, le statut des demandes et les actions disponibles.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    🔔 Notifications
                  </button>
                </div>
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
