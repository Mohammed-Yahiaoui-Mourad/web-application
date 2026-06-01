import { Outlet, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../store/useAuthStore'

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-red-600">Hospital Administration</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tableau de bord hospitalier</h1>
                  <p className="mt-1 text-gray-600">
                    {profile?.first_name} {profile?.last_name} — pilotage des demandes et des priorités patients.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[340px]">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search donors, requests, or clinics..."
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                  >
                    Emergency Request
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    🔔
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
