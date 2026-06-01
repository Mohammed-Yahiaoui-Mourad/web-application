import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import RequestCard from '../../components/RequestCard'

export default function AdminHopitalDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState({})
  const [stats, setStats] = useState({ active: 0, urgent: 0, inRoute: 0, totalUnits: 0, fulfilled: 0 })
  const [broadcastMsg, setBroadcastMsg] = useState('')

  useEffect(() => {
    if (profile?.hopital_id) loadData()
  }, [profile?.hopital_id])

  async function loadData() {
    const { data: reqs } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('hopital_id', profile.hopital_id)
      .order('created_at', { ascending: false })

    const list = reqs || []
    setRequests(list)

    setStats({
      active: list.filter((r) => r.status === 'active').length,
      urgent: list.filter((r) => r.severity === 'urgent' || r.severity === 'critique').length,
      inRoute: list.reduce((sum, r) => sum + (r.donors_confirmed || 0), 0),
      totalUnits: list.reduce((sum, r) => sum + (r.units_needed || 0), 0),
      fulfilled: list.filter((r) => r.status === 'fulfilled').length,
    })

    const patientIds = [...new Set(list.map((r) => r.patient_id).filter(Boolean))]
    if (patientIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds)
      const map = {}
      for (const p of profs || []) map[p.id] = p
      setPatients(map)
    }
  }

  async function launchBroadcast(requestId) {
    setBroadcastMsg('')
    const { data, error } = await supabase.rpc('broadcast_to_donors', {
      p_request_id: requestId,
    })

    if (error) {
      setBroadcastMsg(`Erreur : ${error.message}`)
    } else {
      setBroadcastMsg(`${data} donneur(s) alerté(s) !`)
      loadData()
    }
  }

  async function updateStatus(requestId, status) {
    await supabase.from('blood_requests').update({ status }).eq('id', requestId)
    loadData()
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#ef4444]/80">Hôpital</p>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="mt-2 text-gray-600">
                Suivi des demandes, des dons en cours et des priorités urgentes.
              </p>
            </div>
            <Link
              to="/admin-hopital/demandes"
              className="rounded-lg border border-[#E8293A] bg-white px-4 py-2 text-sm font-semibold text-[#E8293A] shadow-sm hover:bg-red-50"
            >
              Gérer les demandes
            </Link>
          </div>

          {broadcastMsg && (
            <div className="mb-4 rounded-2xl bg-green-50 p-4 text-green-800">{broadcastMsg}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-[#FEF2F2] p-5 shadow-sm">
              <p className="text-sm text-gray-500">Urgences</p>
              <p className="mt-2 text-4xl font-bold text-[#DC2626]">{stats.urgent}</p>
              <p className="mt-2 text-sm text-gray-500">demandes critiques ou urgentes</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Dons en cours</p>
              <p className="mt-2 text-4xl font-bold text-[#F97316]">{stats.inRoute}</p>
              <p className="mt-2 text-sm text-gray-500">donneurs déjà assignés</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Poches demandées</p>
              <p className="mt-2 text-4xl font-bold text-[#2563EB]">{stats.totalUnits}</p>
              <p className="mt-2 text-sm text-gray-500">unités requises</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Actions globales</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadData()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => requests.slice(0, 3).forEach((req) => launchBroadcast(req.id))}
              className="rounded-lg bg-[#E8293A] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Contacter les donneurs
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Assigner un donneur
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Tableau temps réel</h2>
            <p className="text-gray-500">Suivi des demandes ouvertes et actions disponibles.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {requests.length} demandes affichées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Urgence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.slice(0, 6).map((req) => (
                <tr key={req.id}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                    {patients[req.patient_id]?.first_name || 'Patient'} {patients[req.patient_id]?.last_name || ''}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{req.blood_type}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 capitalize">{req.severity}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        req.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : req.status === 'fulfilled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'fulfilled')}
                        className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => launchBroadcast(req.id)}
                        className="rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        Assigner
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Contacter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
