import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ hopitals: 0, patients: 0, donneurs: 0, requests: 0 })

  useEffect(() => {
    async function load() {
      const [h, p, d, r] = await Promise.all([
        supabase.from('hopitals').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'donneur'),
        supabase.from('blood_requests').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        hopitals: h.count || 0,
        patients: p.count || 0,
        donneurs: d.count || 0,
        requests: r.count || 0,
      })
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
        Import CSV : <code className="rounded bg-white px-1">npm run import:hospitals</code> →{' '}
        <code className="rounded bg-white px-1">supabase/import-hopitals-osm.sql</code>
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
