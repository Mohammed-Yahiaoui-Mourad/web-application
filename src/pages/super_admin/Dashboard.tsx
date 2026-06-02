import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ hopitals: 0, patients: 0, donneurs: 0, requests: 0 })

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/api/admin/dashboard')
        setStats({
          hopitals: data.hospitals?.total || 0,
          patients: data.users?.patients || 0,
          donneurs: data.users?.donors || 0,
          requests: data.requests?.total || 0,
        })
      } catch (err) {
        console.error('load stats error:', err)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Super Admin — BloodMatch</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Hôpitaux', value: stats.hopitals },
          { label: 'Patients', value: stats.patients },
          { label: 'Donneurs', value: stats.donneurs },
          { label: 'Demandes', value: stats.requests },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <strong>{stats.hopitals}</strong> établissements de santé (données OpenStreetMap / HOTOSM).
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/super-admin/creer-admin"
          className="rounded-xl bg-white p-6 shadow hover:shadow-md"
        >
          <span className="text-2xl">👤</span>
          <h2 className="mt-2 font-semibold">Créer un admin hôpital</h2>
          <p className="text-sm text-gray-600">Associer un admin à un hôpital existant</p>
        </Link>
      </div>
    </div>
  )
}
