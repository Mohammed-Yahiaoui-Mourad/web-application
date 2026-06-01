import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import RequestCard from '../../components/RequestCard'
import BloodTypePill from '../../components/BloodTypePill'

export default function PatientDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    if (!profile?.id) return
    loadRequests()
  }, [profile?.id])

  async function loadRequests() {
    const { data } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const activeRequest = requests.find((req) => req.status === 'active')
  const confirmedDonors = requests.reduce((sum, req) => sum + (req.donors_confirmed || 0), 0)

  return (
    <div>
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Espace Patient</h1>
              <p className="mt-2 text-gray-600">
                Bonjour {profile?.first_name || 'Patient'} — votre suivi et statut personnel.
              </p>
            </div>
            <Link
              to="/patient/nouvelle-demande"
              className="rounded-lg bg-[#E8293A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Nouvelle demande
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-gray-500">Statut personnel</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {profile?.blood_type ? `${profile.blood_type} • ${profile.region || 'Région inconnue'}` : 'Profil incomplet'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Dernier don : {profile?.last_donation_date ? new Date(profile.last_donation_date).toLocaleDateString('fr-FR') : 'Aucun don enregistré'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Donneurs confirmés</p>
              <p className="mt-3 text-4xl font-bold text-[#16a34a]">{confirmedDonors}</p>
              <p className="mt-2 text-sm text-gray-600">donneurs prêts à intervenir</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Carte donneurs</p>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Donneurs disponibles</p>
              <p className="mt-2 text-3xl font-semibold text-[#2563EB]">{confirmedDonors}</p>
              <p className="mt-1 text-sm text-gray-600">Nombre de donneurs actuellement assignés</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Demande active</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {activeRequest ? `Urgence ${activeRequest.severity}` : 'Aucune demande active'}
              </p>
              {activeRequest && (
                <p className="mt-2 text-sm text-gray-600">{activeRequest.units_needed} poche(s) de {activeRequest.blood_type}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Historique des demandes</h2>
            <p className="mt-1 text-gray-500">Suivi de vos dernières demandes et leur statut.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-gray-500">
            Aucune demande trouvée pour l'instant.
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
