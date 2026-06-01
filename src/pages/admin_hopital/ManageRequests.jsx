import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import RequestCard from '../../components/RequestCard'

export default function ManageRequests() {
  const profile = useAuthStore((s) => s.profile)
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState({})
  const [acceptedDonors, setAcceptedDonors] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadAll()
  }, [profile?.hopital_id])

  async function loadAll() {
    if (!profile?.hopital_id) return

    const { data: reqs } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('hopital_id', profile.hopital_id)
      .order('created_at', { ascending: false })

    setRequests(reqs || [])

    const patientIds = [...new Set((reqs || []).map((r) => r.patient_id).filter(Boolean))]
    if (patientIds.length) {
      const { data } = await supabase.from('profiles').select('*').in('id', patientIds)
      const map = {}
      for (const p of data || []) map[p.id] = p
      setPatients(map)
    }

    const reqIds = (reqs || []).map((r) => r.id)
    if (reqIds.length) {
      const { data: alerts } = await supabase
        .from('donor_alerts')
        .select('*, profiles(first_name, last_name, blood_type, phone)')
        .in('request_id', reqIds)
        .eq('status', 'accepted')

      const grouped = {}
      for (const a of alerts || []) {
        if (!grouped[a.request_id]) grouped[a.request_id] = []
        grouped[a.request_id].push(a)
      }
      setAcceptedDonors(grouped)
    }
  }

  async function broadcast(requestId) {
    const { data, error } = await supabase.rpc('broadcast_to_donors', { p_request_id: requestId })
    setMsg(error ? error.message : `${data} donneur(s) alerté(s)`)
    loadAll()
  }

  async function setStatus(id, status) {
    await supabase.from('blood_requests').update({ status }).eq('id', id)
    loadAll()
  }

  return (
    <div>
      <Link to="/admin-hopital" className="mb-4 inline-block text-sm text-[#E8293A] hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Gestion des demandes</h1>
      {msg && <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{msg}</p>}

      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id}>
            <RequestCard
              request={req}
              patient={patients[req.patient_id]}
              actions={
                req.status === 'active' && (
                  <>
                    <button
                      type="button"
                      onClick={() => broadcast(req.id)}
                      className="rounded-lg bg-[#E8293A] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Lancer le broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(req.id, 'fulfilled')}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
                    >
                      Complétée
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(req.id, 'cancelled')}
                      className="rounded-lg border px-4 py-2 text-sm"
                    >
                      Annuler
                    </button>
                  </>
                )
              }
            />
            {acceptedDonors[req.id]?.length > 0 && (
              <div className="mt-2 ml-4 rounded-lg border-l-4 border-green-500 bg-green-50 p-3">
                <p className="mb-2 text-sm font-semibold">Donneurs acceptés :</p>
                <ul className="space-y-1 text-sm">
                  {acceptedDonors[req.id].map((a) => (
                    <li key={a.id}>
                      {a.profiles?.first_name} {a.profiles?.last_name} — {a.profiles?.blood_type} — {a.profiles?.phone}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
