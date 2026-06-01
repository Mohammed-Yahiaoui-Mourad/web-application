import { Outlet, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../store/useAuthStore'

export default function HospitalLayout() {
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
                  <p className="text-sm uppercase tracking-[0.3em] text-red-600">Hospital Operations</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tableau de bord hospitalier</h1>
                  <p className="mt-1 text-gray-600">
                    {profile?.hospital_name || 'Votre hôpital'} — pilotage des demandes, des stocks et des actions globales.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/admin-hopital"
                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Tableau temps réel
                  </Link>
                  <Link
                    to="/admin-hopital/demandes"
                    className="rounded-full border border-red-600 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Gérer les demandes
                  </Link>
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
